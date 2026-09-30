"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useToast } from "@/app/context/toast";
import { usePermBased } from "@/app/(home)/hooks/usePermBased";
import { etapaKeys } from "@/hooks/queries/useEtapas";
import { esfAerKeys } from "@/hooks/queries/useEsfAer";
import { indicadoresKeys } from "@/hooks/queries/useIndicadores";
import { seboKeys } from "@/hooks/queries/useSebo";
import { indispKeys } from "@/hooks/queries/useIndisps";
import { escalaKeys } from "@/hooks/queries/useEscala";
import { deleteMissaoComEtapas } from "services/routes/estatistica/etapas";

import { useMissaoDraftDispatch } from "../context/MissaoDraftContext";
import type { MissaoDraft } from "../context/types";
import { useSaveMissaoDraft } from "./useSaveMissaoDraft";
import { useUpdateMissaoDraft } from "./useUpdateMissaoDraft";

interface UseMissaoActionsArgs {
   draft: MissaoDraft;
   mode: "new" | "edit";
}

/**
 * Orquestra as mutations da missao (criar / atualizar / excluir), incluindo a
 * checagem de permissao e a recarga do rascunho pos-salvar (a tela permanece
 * aberta; so excluir a missao volta para a lista). Expoe as mutations cruas para que o componente leia os estados
 * de pending (header, guard de mudancas, atalho).
 */
export function useMissaoActions({ draft, mode }: UseMissaoActionsArgs) {
   const router = useRouter();
   const { push } = useToast();
   const dispatch = useMissaoDraftDispatch();
   const { hasPerm } = usePermBased();
   const canCreate = hasPerm("estatistica.etapas", "create");
   const canDelete = hasPerm("estatistica.etapas", "delete");
   const canUpdate = hasPerm("estatistica.etapas", "update");
   // O PUT da edição exige `update` na rota, mais `create` se o lote cria
   // etapa e `delete` se exclui uma persistida (403 do servidor, senão).
   // Derivado do rascunho, como o buildUpdatePayload monta create/delete_ids.
   const criaEtapa = draft.etapas.some((e) => e.serverId === null);
   const excluiEtapa = draft.initialEtapaServerIds.some(
      (id) => !draft.etapas.some((e) => e.serverId === id)
   );
   const canSave =
      mode === "edit"
         ? canUpdate && (!criaEtapa || canCreate) && (!excluiEtapa || canDelete)
         : canCreate;
   // Liga a exibicao de erro nos campos ainda nao tocados (especificos):
   // depois de um salvar recusado, a pessoa precisa ver o que falta.
   const [saveAttempted, setSaveAttempted] = useState(false);

   const queryClient = useQueryClient();
   const saveMutation = useSaveMissaoDraft();
   const updateMutation = useUpdateMissaoDraft();

   const deleteMutation = useMutation({
      mutationFn: () => deleteMissaoComEtapas(draft.serverId!),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: etapaKeys.all });
         queryClient.invalidateQueries({ queryKey: esfAerKeys.all });
         queryClient.invalidateQueries({ queryKey: seboKeys.all });
         queryClient.invalidateQueries({ queryKey: indicadoresKeys.all });
         queryClient.invalidateQueries({ queryKey: indispKeys.all });
         queryClient.invalidateQueries({ queryKey: escalaKeys.all });
         router.push("/estatistica/etapas");
      },
      onError: (err: Error) => {
         push({
            type: "error",
            title: "Erro ao excluir",
            message: err.message ?? "Falha ao excluir missão",
         });
      },
   });

   const handleSave = useCallback(() => {
      if (!canSave) {
         push({
            title: "Sem permissão",
            message:
               mode === "edit" && canUpdate
                  ? "Você não tem permissão para criar ou excluir etapas nesta missão."
                  : "Você não tem permissão para salvar missões.",
            type: "warning",
         });
         return;
      }
      if (draft.etapas.length === 0) {
         push({
            title: "Erro",
            message: "A missão precisa ter pelo menos 1 etapa.",
            type: "error",
         });
         return;
      }
      // Salvar uma etapa fora de "ok" descartaria OIs incompletas e
      // zeraria específicos inválidos silenciosamente (ver buildEtapaNested).
      // Bloqueia e aponta quais etapas revisar.
      const invalidas = draft.etapas
         .map((e, i) => ({ num: i + 1, status: e.status }))
         .filter((e) => e.status !== "ok");
      if (invalidas.length > 0) {
         setSaveAttempted(true);
         push({
            title: "Etapas incompletas",
            message:
               `Revise a(s) etapa(s) ${invalidas
                  .map((e) => e.num)
                  .join(", ")} antes de salvar. Confira dados do voo, ` +
               "soma das OIs e campos dos específicos.",
            type: "error",
         });
         return;
      }
      if (mode === "edit") {
         updateMutation.mutate(draft, {
            onSuccess: (missao) => {
               setSaveAttempted(false);
               if (!missao) {
                  dispatch({ type: "RECOMPUTE_SNAPSHOT" });
                  return;
               }
               // Fica na tela: recarrega o rascunho com o que o servidor
               // gravou, senão as etapas novas seguem sem id e o próximo
               // salvar as criaria de novo. A seleção acompanha a mesma
               // etapa — pelo id, ou (se era nova) por data/decolagem/rota,
               // já que o servidor pode devolvê-las em outra ordem.
               const sel = draft.etapas.find(
                  (e) => e.localId === draft.selectedLocalId
               );
               const alvo =
                  sel?.serverId ??
                  (sel &&
                     missao.etapas.find(
                        (e) =>
                           e.data === sel.form.data &&
                           e.dep.slice(0, 5) === sel.form.dep &&
                           e.origem === sel.form.origem &&
                           e.destino === sel.form.destino
                     )?.id);
               dispatch({
                  type: "LOAD_FROM_SERVER",
                  payload: { missao, selectEtapaServerId: alvo ?? undefined },
               });
            },
         });
         return;
      }
      // Missão nova: o POST devolve só o id, então segue para a edição da
      // missão criada (mesmo editor, agora carregado do servidor). replace,
      // e não push: voltar não deve reabrir o formulário de criação.
      saveMutation.mutate(draft, {
         onSuccess: (missao) => {
            setSaveAttempted(false);
            dispatch({ type: "RECOMPUTE_SNAPSHOT" });
            router.replace(`/estatistica/etapas/missao/${missao.id}`);
         },
      });
   }, [
      canSave,
      canUpdate,
      draft,
      mode,
      push,
      dispatch,
      router,
      saveMutation,
      updateMutation,
   ]);

   return {
      canCreate,
      canDelete,
      saveMutation,
      updateMutation,
      deleteMutation,
      handleSave,
      saveAttempted,
   };
}
