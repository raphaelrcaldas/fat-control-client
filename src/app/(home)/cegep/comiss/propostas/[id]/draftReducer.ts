import type {
   Proposta,
   PropostaCenario,
   PropostaLinha,
   PropostaUpdatePayload,
} from "services/routes/cegep/propostas";
import { cenarioCodigo } from "./propostaCalc";
import { proximaCor } from "./cenarioPalette";

/**
 * Reducer puro do rascunho da proposta.
 *
 * Duas exigências moldam o código:
 * - **Identidade local estável.** Cenário e linha ganham um `localId` que
 *   sobrevive ao salvamento — é a `key` do React e o alvo das ações. O `id` do
 *   backend só chega depois do eco do save e pode ser nulo até lá.
 * - **Imutabilidade cirúrgica.** Cada ação substitui apenas o cenário (e dentro
 *   dele apenas a linha) que mudou, preservando a referência dos demais. Os
 *   `useMemo` de impacto e o `React.memo` das linhas dependem disso.
 */

export function newLocalId(): string {
   if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
   }
   return `l-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export interface LinhaDraft extends PropostaLinha {
   localId: string;
}

export interface CenarioDraft extends Omit<PropostaCenario, "linhas"> {
   localId: string;
   linhas: LinhaDraft[];
}

export interface PropostaDraft extends Omit<Proposta, "cenarios"> {
   cenarios: CenarioDraft[];
}

export interface DraftState {
   draft: PropostaDraft | null;
   dirtyCenarios: Record<string, true>;
   dirtyMeta: boolean;
}

export const initialDraftState: DraftState = {
   draft: null,
   dirtyCenarios: {},
   dirtyMeta: false,
};

export type DraftAction =
   | { type: "INIT"; proposta: Proposta }
   | { type: "SYNC_SAVED"; proposta: Proposta }
   | { type: "RENAME_PROPOSTA"; nome: string }
   | { type: "ADD_CENARIO"; duplicateFrom: string; localId: string }
   | { type: "RENAME_CENARIO"; cenarioId: string; nome: string }
   | { type: "REMOVE_CENARIO"; cenarioId: string }
   | { type: "ADD_LINHAS"; cenarioId: string; linhas: LinhaDraft[] }
   | {
        type: "UPDATE_LINHA";
        cenarioId: string;
        linhaId: string;
        patch: Partial<PropostaLinha>;
     }
   | { type: "REMOVE_LINHA"; cenarioId: string; linhaId: string };

// --- Conversões entre o formato do serviço e o rascunho local ---

export function toDraft(p: Proposta): PropostaDraft {
   return {
      ...p,
      cenarios: p.cenarios.map((c) => ({
         ...c,
         localId: newLocalId(),
         linhas: c.linhas.map((l) => ({ ...l, localId: newLocalId() })),
      })),
   };
}

/** Payload de gravação: sem `localId` e sem o `user` denormalizado. */
export function toPayload(d: PropostaDraft): PropostaUpdatePayload {
   return {
      nome: d.nome,
      ano_ref: d.ano_ref,
      cenarios: d.cenarios.map((c) => ({
         id: c.id ?? null,
         nome: c.nome,
         cor: c.cor,
         linhas: c.linhas.map((l) => ({
            id: l.id ?? null,
            user_id: l.user_id,
            base_ab: l.base_ab,
            qtd_ab: l.qtd_ab,
            ano_ab: l.ano_ab,
            base_fc: l.base_fc,
            qtd_fc: l.qtd_fc,
            ano_fc: l.ano_fc,
         })),
      })),
   };
}

// --- Reducer ---

/** Substitui um cenário pelo resultado de `fn`, mantendo os demais intactos. */
function mapCenario(
   state: DraftState,
   cenarioId: string,
   fn: (c: CenarioDraft) => CenarioDraft
): DraftState {
   if (!state.draft) return state;
   const idx = state.draft.cenarios.findIndex((c) => c.localId === cenarioId);
   if (idx === -1) return state;

   const cenarios = [...state.draft.cenarios];
   cenarios[idx] = fn(cenarios[idx]);

   return {
      ...state,
      draft: { ...state.draft, cenarios },
      dirtyCenarios: { ...state.dirtyCenarios, [cenarioId]: true },
   };
}

export function draftReducer(
   state: DraftState,
   action: DraftAction
): DraftState {
   switch (action.type) {
      case "INIT":
         return {
            draft: toDraft(action.proposta),
            dirtyCenarios: {},
            dirtyMeta: false,
         };

      // Eco do save: reaproveita os `localId` vigentes (a UI não pode piscar) e
      // só absorve os `id` que o backend atribuiu.
      //
      // O pareamento é por IDENTIDADE, não por posição: o cenário casa pelo
      // `id` que ele já tinha, e a linha pelo `user_id` (único dentro do
      // cenário, garantido pelo UNIQUE da tabela). Casar por índice funciona
      // enquanto a ordem enviada for exatamente a devolvida — e um `id`
      // atribuído à linha errada faz o save seguinte gravar valores no militar
      // errado, em silêncio.
      case "SYNC_SAVED": {
         const saved = action.proposta;
         if (!state.draft) {
            return {
               draft: toDraft(saved),
               dirtyCenarios: {},
               dirtyMeta: false,
            };
         }

         const salvosPorId = new Map(
            saved.cenarios.filter((c) => c.id != null).map((c) => [c.id, c])
         );

         const cenarios = state.draft.cenarios.map((c, i) => {
            // Cenário novo ainda não tem `id`: aí sim a posição é o único
            // vínculo possível (o backend devolve na ordem enviada).
            const s =
               (c.id != null ? salvosPorId.get(c.id) : undefined) ??
               saved.cenarios[i];
            if (!s) return c;

            const linhasPorUser = new Map(s.linhas.map((l) => [l.user_id, l]));
            return {
               ...c,
               id: s.id ?? null,
               nome: s.nome,
               cor: s.cor,
               linhas: c.linhas.map((l) => {
                  const sl = linhasPorUser.get(l.user_id);
                  return sl ? { ...l, id: sl.id ?? null } : l;
               }),
            };
         });

         return {
            draft: {
               ...state.draft,
               id: saved.id,
               nome: saved.nome,
               ano_ref: saved.ano_ref,
               status: saved.status,
               updated_at: saved.updated_at,
               cenarios,
            },
            dirtyCenarios: {},
            dirtyMeta: false,
         };
      }

      case "RENAME_PROPOSTA": {
         if (!state.draft || state.draft.nome === action.nome) return state;
         return {
            ...state,
            draft: { ...state.draft, nome: action.nome },
            dirtyMeta: true,
         };
      }

      case "ADD_CENARIO": {
         if (!state.draft) return state;
         const origem = state.draft.cenarios.find(
            (c) => c.localId === action.duplicateFrom
         );

         const usadas = state.draft.cenarios.map((c) => c.cor);
         const novo: CenarioDraft = {
            id: null,
            localId: action.localId,
            nome: `Cenário ${cenarioCodigo(state.draft.cenarios.length)}`,
            cor: proximaCor(usadas),
            // Linhas duplicadas nascem sem `id` do backend: são registros novos.
            linhas: (origem?.linhas ?? []).map((l) => ({
               ...l,
               id: null,
               localId: newLocalId(),
            })),
         };

         return {
            ...state,
            draft: {
               ...state.draft,
               cenarios: [...state.draft.cenarios, novo],
            },
            dirtyCenarios: { ...state.dirtyCenarios, [novo.localId]: true },
         };
      }

      case "RENAME_CENARIO":
         return mapCenario(state, action.cenarioId, (c) =>
            c.nome === action.nome ? c : { ...c, nome: action.nome }
         );

      case "REMOVE_CENARIO": {
         if (!state.draft) return state;
         // A proposta nunca fica sem cenário: sem ele não há o que planejar.
         if (state.draft.cenarios.length <= 1) return state;
         if (!state.draft.cenarios.some((c) => c.localId === action.cenarioId))
            return state;

         const dirtyCenarios = { ...state.dirtyCenarios };
         delete dirtyCenarios[action.cenarioId];

         return {
            ...state,
            draft: {
               ...state.draft,
               cenarios: state.draft.cenarios.filter(
                  (c) => c.localId !== action.cenarioId
               ),
            },
            // A remoção em si é uma alteração pendente da proposta.
            dirtyCenarios,
            dirtyMeta: true,
         };
      }

      case "ADD_LINHAS": {
         if (!action.linhas.length) return state;
         return mapCenario(state, action.cenarioId, (c) => ({
            ...c,
            linhas: [...c.linhas, ...action.linhas],
         }));
      }

      case "UPDATE_LINHA":
         return mapCenario(state, action.cenarioId, (c) => {
            const idx = c.linhas.findIndex((l) => l.localId === action.linhaId);
            if (idx === -1) return c;
            const linhas = [...c.linhas];
            linhas[idx] = { ...linhas[idx], ...action.patch };
            return { ...c, linhas };
         });

      case "REMOVE_LINHA":
         return mapCenario(state, action.cenarioId, (c) => {
            const linhas = c.linhas.filter((l) => l.localId !== action.linhaId);
            return linhas.length === c.linhas.length ? c : { ...c, linhas };
         });

      default:
         return state;
   }
}
