import type { Reducer } from "react";
import { reconcileDraft } from "./reconcileMissao";
import { missaoDraftReducer } from "@/app/(home)/estatistica/etapas/missao/context/reducer";
import type {
   Action,
   DraftOIItem,
   MissaoDraft,
} from "@/app/(home)/estatistica/etapas/missao/context/types";

/**
 * Acoes proprias do simulador, empilhadas sobre o reducer compartilhado com
 * estatistica (que nao muda). Sempre operam sobre o estado mais recente.
 */
export type SimuladorAction =
   | Action
   /** Sessao excluida no servidor: deixa de contar em `delete_ids`. */
   | { type: "FORGET_SERVER_ETAPA"; payload: { serverId: number } }
   /**
    * Nova leitura do servidor. `baseline` e o estado persistido ANTES desta
    * leitura; o resultado e calculado sobre o `state` atual (acoes do usuario
    * ja enfileiradas nao sao sobrescritas). Idempotente e sem efeito
    * colateral: o baseline novo e os descartes saem da mesma funcao pura, no
    * chamador.
    */
   | {
        type: "RECONCILE";
        payload: { server: MissaoDraft; baseline: MissaoDraft };
     }
   /** Sessao legada sem OI: cria a OI unica ja com os valores do simulador. */
   | {
        type: "ADD_OI_WITH";
        payload: { localId: string; patch: Partial<Omit<DraftOIItem, "uid">> };
     };

export const simuladorReducer: Reducer<MissaoDraft, SimuladorAction> = (
   state,
   action
) => {
   switch (action.type) {
      case "RECONCILE": {
         const { server, baseline } = action.payload;
         return reconcileDraft(state, baseline, server)?.draft ?? state;
      }
      case "FORGET_SERVER_ETAPA":
         return {
            ...state,
            initialEtapaServerIds: state.initialEtapaServerIds.filter(
               (id) => id !== action.payload.serverId
            ),
         };
      case "ADD_OI_WITH": {
         const { localId, patch } = action.payload;
         if (state.etapas.find((e) => e.localId === localId)?.oiItems.length)
            return state;
         const added = missaoDraftReducer(state, {
            type: "ADD_OI",
            payload: { localId },
         });
         const uid = added.etapas.find((e) => e.localId === localId)?.oiItems[0]
            ?.uid;
         return uid
            ? missaoDraftReducer(added, {
                 type: "UPDATE_OI",
                 payload: { localId, uid, patch },
              })
            : state;
      }
      default:
         return missaoDraftReducer(state, action);
   }
};
