import { createSimuladorEtapaForm } from "../helpers/simuladorEtapaForm";
import { etapaFingerprint, reconcileDraft } from "../helpers/reconcileMissao";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { ApiError } from "services/Api";
import { useToast } from "@/app/context/toast";
import { useEsfAerList } from "@/hooks/queries/useEsfAer";
import { useTiposMissao } from "@/hooks/queries/useTiposMissao";
import { useUpdateMissaoWithEtapas } from "@/hooks/queries/useEtapas";
import type { MissaoComEtapasDetail } from "services/routes/estatistica/etapas";
import { simuladorReducer } from "../helpers/simuladorReducer";
import { buildDraftFromServer } from "@/app/(home)/estatistica/etapas/missao/context/serverMappers";
import { buildUpdatePayload } from "@/app/(home)/estatistica/etapas/missao/context/missaoPayload";
import { formatSaveError } from "@/app/(home)/estatistica/etapas/missao/context/saveErrors";
import {
   DATA_MAX,
   DATA_MIN,
   FIELD_LIMITS,
} from "@/app/(home)/estatistica/etapas/missao/context/validators";
import type {
   DraftEtapa,
   MissaoDraft,
} from "@/app/(home)/estatistica/etapas/missao/context/types";
import { computeTvoo } from "../../helpers/tvoo";
import { sortEtapas } from "../../helpers/sessoes";
import { MAX_PILOTOS, SIM_ANV } from "../../types";

type Bloqueio =
   | "data"
   | "ano"
   | "rota"
   | "horarios"
   | "tempo"
   | "pousos"
   | "pilotos"
   | "tipo";

const DATA_ISO = /^\d{4}-\d{2}-\d{2}$/;

const BLOQUEIO_LABEL: Record<Bloqueio, string> = {
   data: "data",
   ano: "ano da data",
   rota: "origem e destino",
   horarios: "horários",
   tempo: "tempo de voo",
   pousos: "pousos",
   pilotos: "pilotos",
   tipo: "tipo de missão",
};

/** DD/MM de uma data ISO, para os avisos ao usuário. */
const diaMes = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

export function useSimuladorMissaoDraft(
   missao: MissaoComEtapasDetail,
   initialEtapaId?: number
) {
   const [draft, dispatch] = useReducer(simuladorReducer, missao, (initial) =>
      buildDraftFromServer(
         { ...initial, etapas: sortEtapas(initial.etapas) },
         initialEtapaId
      )
   );
   const [formVersion, setFormVersion] = useState(0);
   const baseline = useRef(draft);
   const draftRef = useRef(draft);
   const update = useUpdateMissaoWithEtapas();
   const { push } = useToast();
   const pushRef = useRef(push);
   const esfAer = useEsfAerList();
   const tipos = useTiposMissao();
   const smlEsfAer = esfAer.data?.find((e) => e.descricao.includes("SML"));
   const requestedId = useRef(initialEtapaId);
   // Última leitura entregue pelo cache e última que já passou (ou foi
   // descartada de propósito) pela reconciliação. Durante o PUT a leitura só
   // entra em `latestMissaoRef`: se o save falhar, ainda precisa ser aplicada.
   const latestMissaoRef = useRef(missao);
   const seenMissao = useRef(missao);
   const savingRef = useRef(false);
   const isLoadingData = esfAer.isLoading || tipos.isLoading;
   const isConfigurationError =
      !isLoadingData &&
      !esfAer.isError &&
      !tipos.isError &&
      (!smlEsfAer || !tipos.data?.length);
   const isDataError = esfAer.isError || tipos.isError || isConfigurationError;
   const error = esfAer.error ?? tipos.error;
   const dataErrorMessage = isConfigurationError
      ? !smlEsfAer
         ? "A configuração do simulador não contém o esforço aéreo SML."
         : "A configuração do simulador não contém tipos de missão disponíveis."
      : error instanceof Error
        ? `Não foi possível carregar os dados da sessão: ${error.message}`
        : "Não foi possível carregar os dados da sessão";
   const retryLoadingData = async () => {
      await Promise.all([esfAer.refetch(), tipos.refetch()]);
   };

   useEffect(() => {
      draftRef.current = draft;
      pushRef.current = push;
   });

   // Reconcilia o rascunho com `missao` (ver `reconcileDraft`). O baseline e os
   // toasts ficam fora do reducer; o rascunho é calculado pela ação RECONCILE
   // sobre o estado atual, com as mesmas entradas da função pura que gera o
   // baseline novo e a lista de descartes aqui.
   const applyServer = useCallback((next: MissaoComEtapasDetail) => {
      if (seenMissao.current === next) return;
      seenMissao.current = next;
      const server = buildDraftFromServer({
         ...next,
         etapas: sortEtapas(next.etapas),
      });
      const previous = baseline.current;
      const result = reconcileDraft(draftRef.current, previous, server);
      if (!result) return;
      baseline.current = result.baseline;
      dispatch({ type: "RECONCILE", payload: { server, baseline: previous } });
      const dates = [...new Set(result.discardedDates.map(diaMes))];
      if (dates.length > 0)
         pushRef.current({
            type: "warning",
            title: "Missão alterada por outro usuário",
            message:
               dates.length === 1
                  ? `Sessão ${dates[0]} excluída por outro usuário; suas alterações nela foram descartadas`
                  : `Sessões ${dates.join(", ")} excluídas por outro usuário; suas alterações nelas foram descartadas`,
            duration: 12000,
         });
   }, []);

   // Reconcilia quando o detalhe da missão muda (refetch, invalidação, outra
   // pessoa editando). Durante o PUT não mexe: a leitura fica em
   // `latestMissaoRef`. No sucesso o baseline vira a própria resposta e a
   // leitura pulada é descartada (a invalidação que segue traz uma posterior);
   // na falha o `save` a aplica. Dado idêntico é no-op (ver `reconcileDraft`).
   useEffect(() => {
      latestMissaoRef.current = missao;
      if (savingRef.current) return;
      applyServer(missao);
   }, [missao, applyServer]);

   // Refetch atualiza o cache; os rascunhos pertencem à tela. Só uma mudança
   // explícita de etapa na URL muda a seleção, sem recarregar campos locais.
   useEffect(() => {
      if (requestedId.current === initialEtapaId) return;
      requestedId.current = initialEtapaId;
      const target = draft.etapas.find((e) => e.serverId === initialEtapaId);
      if (target)
         dispatch({
            type: "SELECT_ETAPA",
            payload: { localId: target.localId },
         });
   }, [initialEtapaId, draft.etapas]);

   const selected =
      draft.etapas.find((e) => e.localId === draft.selectedLocalId) ?? null;
   const modified = (etapa: DraftEtapa) => {
      const initial = baseline.current.etapas.find(
         (e) => e.localId === etapa.localId
      );
      return !initial || etapaFingerprint(etapa) !== etapaFingerprint(initial);
   };
   const isPending = (etapa: DraftEtapa) =>
      etapa.serverId === null || modified(etapa);
   const pendingEtapas = draft.etapas.filter(isPending);
   const dirty =
      pendingEtapas.length > 0 ||
      (draft.obs ?? "") !== (baseline.current.obs ?? "");
   // Missões podem atravessar anos: uma pendência histórica deve continuar
   // editável, sem liberar a troca acidental do ano da sessão persistida.
   // Sessão nova (ainda sem ano original) aceita qualquer ano: a dupla que
   // cruza a virada do ano continua na mesma missão.
   const etapaAnoRef = (etapa: DraftEtapa) => {
      const original = baseline.current.etapas.find(
         (e) => e.localId === etapa.localId
      );
      return original?.serverId != null
         ? Number(original.form.data.slice(0, 4))
         : null;
   };
   /** Primeiro motivo pelo qual a sessão não pode ser gravada, ou `null`. */
   const blocker = (etapa: DraftEtapa): Bloqueio | null => {
      const { data, origem, destino, dep, arr, pousos } = etapa.form;
      const tvoo = computeTvoo(dep, arr);
      const ano = etapaAnoRef(etapa);
      // O input date aceita ano de 5+ dígitos (`20260-01-01`), que passaria
      // nas comparações de texto abaixo; a API só aceita `YYYY-MM-DD`.
      if (!DATA_ISO.test(data)) return "data";
      if (ano !== null && data.slice(0, 4) !== String(ano)) return "ano";
      // Sessão nova aceita qualquer ano, mas dentro da janela de sanidade: o
      // `0202-09-20` passava e o PUT voltava 422.
      if (ano === null && (data < DATA_MIN || data > DATA_MAX)) return "ano";
      if (origem.length !== 4 || destino.length !== 4) return "rota";
      if (!dep || !arr) return "horarios";
      if (tvoo < 5 || tvoo % 5 !== 0) return "tempo";
      if (
         !Number.isInteger(pousos) ||
         pousos < 0 ||
         pousos > FIELD_LIMITS.pousos.max
      )
         return "pousos";
      if (
         etapa.assignedTrips.length === 0 ||
         etapa.assignedTrips.length > MAX_PILOTOS
      )
         return "pilotos";
      if (!(etapa.oiItems[0]?.tipo_missao_id ?? tipos.data?.[0]?.id))
         return "tipo";
      return null;
   };
   const valid = (etapa: DraftEtapa) => blocker(etapa) === null;
   const canSave =
      dirty &&
      !isLoadingData &&
      !isDataError &&
      !update.isPending &&
      pendingEtapas.every(valid);
   const firstBlocked = dirty
      ? pendingEtapas.find((e) => !valid(e))
      : undefined;
   const blockedReason = firstBlocked
      ? `Sessão ${draft.etapas.indexOf(firstBlocked) + 1} incompleta: ${BLOQUEIO_LABEL[blocker(firstBlocked)!]}`
      : null;

   const select = (localId: string) => {
      if (!savingRef.current)
         dispatch({ type: "SELECT_ETAPA", payload: { localId } });
   };
   const add = () => {
      if (!savingRef.current)
         dispatch({
            type: "ADD_ETAPA",
            // Sessão de simulador nasce sem pousos: o default compartilhado
            // (1) passaria na validação sem ninguém reparar.
            payload: { template: { anv: SIM_ANV, pousos: 0 } },
         });
   };
   const remove = (localId: string, persisted = false) => {
      if (savingRef.current) return;
      const target = draft.etapas.find((e) => e.localId === localId);
      dispatch({ type: "REMOVE_ETAPA", payload: { localId } });
      if (persisted && target) {
         // Já excluída no servidor: sai do baseline e de `delete_ids`.
         baseline.current = {
            ...baseline.current,
            etapas: baseline.current.etapas.filter(
               (e) => e.localId !== localId
            ),
         };
         if (target.serverId !== null)
            dispatch({
               type: "FORGET_SERVER_ETAPA",
               payload: { serverId: target.serverId },
            });
      }
   };
   const setObs = (value: string) => {
      if (!savingRef.current)
         dispatch({
            type: "SET_MISSAO_FIELD",
            payload: { field: "obs", value },
         });
   };

   const save = useCallback(async () => {
      if (!canSave || savingRef.current) return;
      savingRef.current = true;
      // Normaliza apenas etapas que serão enviadas, inclusive legadas sem OI.
      // Os campos fora do formulário são preservados pelo mapper compartilhado.
      const normalized: MissaoDraft = {
         ...draft,
         // Opcional em branco viaja `null`, também quando a missão tinha obs.
         obs: (draft.obs ?? "").trim() === "" ? null : draft.obs,
         etapas: draft.etapas.map((e) =>
            e.serverId !== null && !modified(e)
               ? { ...e, dirty: false }
               : {
                    ...e,
                    dirty: true,
                    oiItems: [
                       {
                          uid: e.oiItems[0]?.uid ?? crypto.randomUUID(),
                          esf_aer_id: smlEsfAer!.id,
                          tipo_missao_id:
                             e.oiItems[0]?.tipo_missao_id ?? tipos.data![0].id,
                          reg: e.oiItems[0]?.reg ?? "d",
                          tvoo: computeTvoo(e.form.dep, e.form.arr),
                       },
                    ],
                 }
         ),
      };
      let saved = false;
      try {
         const result = await update.mutateAsync({
            id: missao.id,
            data: buildUpdatePayload(normalized),
         });
         if (!result.ok) {
            const { title, message } = formatSaveError(
               new ApiError(result.message ?? "Falha ao salvar", result.errors),
               normalized,
               "Sessão"
            );
            push({ type: "error", title, message, duration: 12000 });
            return;
         }
         // O endpoint transacional devolve os IDs novos. Incorporá-los aqui
         // evita POST duplicado mesmo quando o refetch posterior falha.
         if (!result.data)
            throw new Error(
               "A missão salva não retornou suas etapas. Recarregue antes de continuar."
            );
         const selectedEtapa = normalized.etapas.find(
            (e) => e.localId === normalized.selectedLocalId
         );
         const selectedId =
            selectedEtapa?.serverId ??
            result.data.etapas.find(
               (e) =>
                  e.data === selectedEtapa?.form.data &&
                  e.dep.slice(0, 5) === selectedEtapa?.form.dep &&
                  e.origem === selectedEtapa?.form.origem &&
                  e.destino === selectedEtapa?.form.destino
            )?.id;
         const savedDraft = buildDraftFromServer(
            { ...result.data, etapas: sortEtapas(result.data.etapas) },
            selectedId
         );
         baseline.current = savedDraft;
         dispatch({
            type: "RESET_DRAFT",
            payload: { kind: "edit", initial: savedDraft },
         });
         setFormVersion((v) => v + 1);
         push({
            title: "Sucesso!",
            message: "Alterações da missão salvas",
            type: "success",
         });
         saved = true;
         return result.data;
      } catch (err) {
         push({
            title: "Erro",
            message:
               err instanceof Error ? err.message : "Erro ao salvar alterações",
            type: "error",
         });
      } finally {
         savingRef.current = false;
         // Sucesso: o baseline é a resposta do PUT e a leitura que chegou no
         // meio é anterior a ela — descartada. Falha: nada foi gravado, então a
         // leitura recebida durante o save (ou a que a invalidação do PUT
         // recusado trouxer) ainda vale; sem isto, uma sessão excluída por
         // outra pessoa deixava o editor preso em 422.
         if (saved) seenMissao.current = latestMissaoRef.current;
         else applyServer(latestMissaoRef.current);
      }
   }, [
      applyServer,
      canSave,
      draft,
      missao.id,
      push,
      smlEsfAer,
      tipos.data,
      update,
   ]);

   const form = selected
      ? createSimuladorEtapaForm({
           etapa: selected,
           dispatch,
           savingRef,
           anoRef: etapaAnoRef(selected),
           catalogs: {
              tiposMissaoData: tipos.data,
              smlEsfAer,
              isLoadingData,
              isDataError,
              dataErrorMessage,
              retryLoadingData,
              isRefetchingData: esfAer.isRefetching || tipos.isRefetching,
           },
        })
      : null;

   return {
      draft: {
         ...draft,
         etapas: draft.etapas.map((e) => {
            const pending = isPending(e);
            // Status compartilhado não cobre o que `valid` exige (pilotos,
            // ano da sessão persistida): sessão pendente que o selector dá
            // como "ok" mas não pode ser gravada aparece como "verificar".
            const blockedBy = pending ? blocker(e) : null;
            return {
               ...e,
               dirty: modified(e),
               status:
                  blockedBy && (e.status === "ok" || blockedBy === "ano")
                     ? ("verificar" as const)
                     : e.status,
            };
         }),
      },
      selected,
      form,
      formVersion,
      dirty,
      canSave,
      blockedReason,
      isSaving: update.isPending,
      add,
      select,
      remove,
      setObs,
      save,
   };
}

export type SimuladorEtapaForm = NonNullable<
   ReturnType<typeof useSimuladorMissaoDraft>["form"]
>;
