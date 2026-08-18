"use client";

import { useCallback, useEffect, useMemo, useReducer } from "react";
import type { PropostaLinha } from "services/routes/cegep/propostas";
import { useProposta, useUpdateProposta } from "@/hooks/queries/usePropostas";
import {
   type LinhaDraft,
   type PropostaDraft,
   draftReducer,
   initialDraftState,
   newLocalId,
   toPayload,
} from "./draftReducer";

export interface PropostaDraftActions {
   renameProposta(nome: string): void;
   /** Duplica o cenário informado e devolve o `localId` do novo (para ativar). */
   addCenario(duplicateFromLocalId: string): string;
   renameCenario(cenarioId: string, nome: string): void;
   removeCenario(cenarioId: string): void;
   addLinhas(cenarioId: string, linhas: LinhaDraft[]): void;
   updateLinha(
      cenarioId: string,
      linhaId: string,
      patch: Partial<PropostaLinha>
   ): void;
   removeLinha(cenarioId: string, linhaId: string): void;
}

export interface UsePropostaDraftResult {
   status: "loading" | "error" | "ready";
   draft: PropostaDraft | null;
   isDirty: boolean;
   isCenarioDirty: (cenarioLocalId: string) => boolean;
   dirtyCenarioIds: Set<string>;
   actions: PropostaDraftActions;
   save(): Promise<void>;
   isSaving: boolean;
}

/**
 * Dona do rascunho da proposta. O baseline vem do backend uma única vez; a
 * partir daí quem manda é o reducer local.
 *
 * O `INIT` só dispara com `draft === null`. Um refetch que reinicializasse o
 * rascunho apagaria em silêncio o trabalho não salvo — por isso o detalhe é
 * consultado com `staleTime: Infinity` e sem refetch no foco, e o pós-save
 * volta pelo eco (`SYNC_SAVED`), nunca por invalidação.
 */
export function usePropostaDraft(
   propostaId: number | null
): UsePropostaDraftResult {
   const { data, isError } = useProposta(propostaId);
   const updateMutation = useUpdateProposta();

   const [state, dispatch] = useReducer(draftReducer, initialDraftState);

   useEffect(() => {
      if (data && state.draft === null) {
         dispatch({ type: "INIT", proposta: data });
      }
   }, [data, state.draft]);

   // `dispatch` é estável, então este objeto nasce uma vez e sobrevive a todo
   // render — pré-requisito do React.memo das linhas da tabela.
   const actions = useMemo<PropostaDraftActions>(
      () => ({
         renameProposta: (nome) => dispatch({ type: "RENAME_PROPOSTA", nome }),
         addCenario: (duplicateFrom) => {
            const localId = newLocalId();
            dispatch({ type: "ADD_CENARIO", duplicateFrom, localId });
            return localId;
         },
         renameCenario: (cenarioId, nome) =>
            dispatch({ type: "RENAME_CENARIO", cenarioId, nome }),
         removeCenario: (cenarioId) =>
            dispatch({ type: "REMOVE_CENARIO", cenarioId }),
         addLinhas: (cenarioId, linhas) =>
            dispatch({ type: "ADD_LINHAS", cenarioId, linhas }),
         updateLinha: (cenarioId, linhaId, patch) =>
            dispatch({ type: "UPDATE_LINHA", cenarioId, linhaId, patch }),
         removeLinha: (cenarioId, linhaId) =>
            dispatch({ type: "REMOVE_LINHA", cenarioId, linhaId }),
      }),
      []
   );

   const dirtyCenarioIds = useMemo(
      () => new Set(Object.keys(state.dirtyCenarios)),
      [state.dirtyCenarios]
   );

   const isDirty = state.dirtyMeta || dirtyCenarioIds.size > 0;

   const isCenarioDirty = useCallback(
      (cenarioLocalId: string) => dirtyCenarioIds.has(cenarioLocalId),
      [dirtyCenarioIds]
   );

   const draft = state.draft;

   // A exceção sobe para a página, que é quem tem o toast.
   const save = useCallback(async () => {
      if (!draft) return;
      const result = await updateMutation.mutateAsync({
         id: draft.id,
         payload: toPayload(draft),
      });
      // O eco traz os ids recém-atribuídos; sem ele o rascunho salvaria os
      // mesmos registros como novos no próximo save.
      if (result.data) {
         dispatch({ type: "SYNC_SAVED", proposta: result.data });
      }
   }, [draft, updateMutation]);

   // Com rascunho em mãos a tela é utilizável mesmo que um refetch falhe —
   // por isso "ready" vence "error".
   //
   // Sem rascunho, só `isError` produz "error": existe um render em que a query
   // já resolveu (`isLoading` false, sem erro) e o `INIT` do reducer, que mora
   // num efeito e roda depois do paint, ainda não populou o draft. Tratar esse
   // intervalo como erro piscava "Proposta não encontrada" em toda abertura do
   // sandbox — no caminho feliz.
   const status: UsePropostaDraftResult["status"] = draft
      ? "ready"
      : isError
        ? "error"
        : "loading";

   return {
      status,
      draft,
      isDirty,
      isCenarioDirty,
      dirtyCenarioIds,
      actions,
      save,
      isSaving: updateMutation.isPending,
   };
}
