import { DEFAULT_ETAPA_FORM, newEspecifico, newOiItem } from "./factories";
import { buildLastEtapaSeed, selectStatusByEtapa } from "./selectors";
import { serializeDraft } from "./serialization";
import { buildDraftFromServer, emptyDraft } from "./serverMappers";
import type {
   Action,
   DraftEtapa,
   DraftHeavyCds,
   DraftPqd,
   DraftRevo,
   MissaoDraft,
} from "./types";

function updateEtapa(
   draft: MissaoDraft,
   localId: string,
   updater: (etapa: DraftEtapa) => DraftEtapa
): MissaoDraft {
   let touched = false;
   const etapas = draft.etapas.map((etapa) => {
      if (etapa.localId !== localId) return etapa;
      touched = true;
      const next = updater(etapa);
      return {
         ...next,
         dirty: true,
         status: selectStatusByEtapa(next),
      };
   });
   if (!touched) return draft;
   return { ...draft, etapas };
}

export function missaoDraftReducer(
   state: MissaoDraft,
   action: Action
): MissaoDraft {
   switch (action.type) {
      case "LOAD_FROM_SERVER": {
         const { missao, selectEtapaServerId } = action.payload;
         return buildDraftFromServer(missao, selectEtapaServerId);
      }

      case "RESET_DRAFT": {
         if (action.payload.kind === "new") return emptyDraft();
         const initial = action.payload.initial;
         return {
            ...initial,
            initialSnapshot: initial.initialSnapshot ?? serializeDraft(initial),
         };
      }

      case "SET_MISSAO_FIELD": {
         const { field, value } = action.payload;
         if (field === "is_simulador") {
            return { ...state, is_simulador: Boolean(value) };
         }
         if (field === "titulo" || field === "obs") {
            const v =
               value == null
                  ? null
                  : typeof value === "string"
                    ? value
                    : String(value);
            return { ...state, [field]: v };
         }
         return state;
      }

      case "ADD_ETAPA": {
         const seed = buildLastEtapaSeed(state);
         const form = {
            ...DEFAULT_ETAPA_FORM,
            ...seed.form,
            ...(action.payload?.template ?? {}),
         };
         const etapa: DraftEtapa = {
            localId: crypto.randomUUID(),
            serverId: null,
            status: "rascunho",
            form,
            oiItems: seed.oiItems,
            assignedTrips: seed.assignedTrips,
            pqd: [],
            revo: [],
            heavyCds: [],
            dirty: true,
         };
         etapa.status = selectStatusByEtapa(etapa);
         return {
            ...state,
            etapas: [...state.etapas, etapa],
            selectedLocalId: etapa.localId,
         };
      }

      case "REMOVE_ETAPA": {
         const idx = state.etapas.findIndex(
            (e) => e.localId === action.payload.localId
         );
         if (idx === -1) return state;
         const etapas = state.etapas.filter((_, i) => i !== idx);
         let selectedLocalId = state.selectedLocalId;
         if (state.selectedLocalId === action.payload.localId) {
            if (etapas.length === 0) {
               selectedLocalId = null;
            } else {
               const target = etapas[Math.max(0, idx - 1)];
               selectedLocalId = target.localId;
            }
         }
         return { ...state, etapas, selectedLocalId };
      }

      case "SELECT_ETAPA": {
         if (state.selectedLocalId === action.payload.localId) return state;
         const exists = state.etapas.some(
            (e) => e.localId === action.payload.localId
         );
         if (!exists) return state;
         return { ...state, selectedLocalId: action.payload.localId };
      }

      case "UPDATE_ETAPA_FORM": {
         const { localId, patch } = action.payload;
         return updateEtapa(state, localId, (etapa) => ({
            ...etapa,
            form: { ...etapa.form, ...patch },
         }));
      }

      case "ADD_OI": {
         const { localId } = action.payload;
         return updateEtapa(state, localId, (etapa) => {
            const last =
               etapa.oiItems.length > 0
                  ? etapa.oiItems[etapa.oiItems.length - 1]
                  : null;
            const item = newOiItem(last?.esf_aer_id ?? null);
            return { ...etapa, oiItems: [...etapa.oiItems, item] };
         });
      }

      case "REMOVE_OI": {
         const { localId, uid } = action.payload;
         return updateEtapa(state, localId, (etapa) => ({
            ...etapa,
            oiItems: etapa.oiItems.filter((oi) => oi.uid !== uid),
         }));
      }

      case "UPDATE_OI": {
         const { localId, uid, patch } = action.payload;
         return updateEtapa(state, localId, (etapa) => ({
            ...etapa,
            oiItems: etapa.oiItems.map((oi) =>
               oi.uid === uid ? { ...oi, ...patch } : oi
            ),
         }));
      }

      case "SET_ETAPA_OIS": {
         const { localId, ois } = action.payload;
         return updateEtapa(state, localId, (etapa) => ({
            ...etapa,
            oiItems: ois,
         }));
      }

      case "ADD_ESPECIFICO": {
         const { localId, kind } = action.payload;
         return updateEtapa(state, localId, (etapa) => {
            const item = newEspecifico(kind);
            if (kind === "pqd") {
               return { ...etapa, pqd: [...etapa.pqd, item as DraftPqd] };
            }
            if (kind === "revo") {
               return { ...etapa, revo: [...etapa.revo, item as DraftRevo] };
            }
            return {
               ...etapa,
               heavyCds: [...etapa.heavyCds, item as DraftHeavyCds],
            };
         });
      }

      case "REMOVE_ESPECIFICO": {
         const { localId, kind, uid } = action.payload;
         return updateEtapa(state, localId, (etapa) => {
            if (kind === "pqd") {
               return {
                  ...etapa,
                  pqd: etapa.pqd.filter((p) => p.uid !== uid),
               };
            }
            if (kind === "revo") {
               return {
                  ...etapa,
                  revo: etapa.revo.filter((r) => r.uid !== uid),
               };
            }
            return {
               ...etapa,
               heavyCds: etapa.heavyCds.filter((h) => h.uid !== uid),
            };
         });
      }

      case "UPDATE_PQD": {
         const { localId, uid, patch } = action.payload;
         return updateEtapa(state, localId, (etapa) => ({
            ...etapa,
            pqd: etapa.pqd.map((p) => (p.uid === uid ? { ...p, ...patch } : p)),
         }));
      }

      case "UPDATE_REVO": {
         const { localId, uid, patch } = action.payload;
         return updateEtapa(state, localId, (etapa) => ({
            ...etapa,
            revo: etapa.revo.map((r) =>
               r.uid === uid ? { ...r, ...patch } : r
            ),
         }));
      }

      case "UPDATE_HEAVY_CDS": {
         const { localId, uid, patch } = action.payload;
         return updateEtapa(state, localId, (etapa) => ({
            ...etapa,
            heavyCds: etapa.heavyCds.map((h) =>
               h.uid === uid ? { ...h, ...patch } : h
            ),
         }));
      }

      case "ADD_TRIP": {
         const { localId, trip } = action.payload;
         return updateEtapa(state, localId, (etapa) => {
            if (etapa.assignedTrips.some((t) => t.tripId === trip.tripId)) {
               return etapa;
            }
            return { ...etapa, assignedTrips: [...etapa.assignedTrips, trip] };
         });
      }

      case "REMOVE_TRIP": {
         const { localId, tripId } = action.payload;
         return updateEtapa(state, localId, (etapa) => ({
            ...etapa,
            assignedTrips: etapa.assignedTrips.filter(
               (t) => t.tripId !== tripId
            ),
         }));
      }

      case "UPDATE_FUNC_BORDO": {
         const { localId, tripId, funcBordo } = action.payload;
         return updateEtapa(state, localId, (etapa) => ({
            ...etapa,
            assignedTrips: etapa.assignedTrips.map((t) =>
               t.tripId === tripId ? { ...t, funcBordo } : t
            ),
         }));
      }

      case "MOVE_TRIP_TO_FUNC": {
         const { localId, tripId, func } = action.payload;
         return updateEtapa(state, localId, (etapa) => ({
            ...etapa,
            assignedTrips: etapa.assignedTrips.map((t) =>
               t.tripId === tripId ? { ...t, func } : t
            ),
         }));
      }

      case "SET_ETAPA_TRIPS": {
         const { localId, trips } = action.payload;
         return updateEtapa(state, localId, (etapa) => ({
            ...etapa,
            assignedTrips: trips,
         }));
      }

      case "MARK_ETAPA_PERSISTED": {
         const { localId, serverId } = action.payload;
         const etapas = state.etapas.map((etapa) =>
            etapa.localId === localId
               ? { ...etapa, serverId, dirty: false }
               : etapa
         );
         return { ...state, etapas };
      }

      case "MARK_MISSAO_PERSISTED": {
         return { ...state, serverId: action.payload.serverId };
      }

      case "RECOMPUTE_SNAPSHOT": {
         const cleanEtapas = state.etapas.map((etapa) => ({
            ...etapa,
            dirty: false,
         }));
         const next: MissaoDraft = {
            ...state,
            etapas: cleanEtapas,
            initialSnapshot: null,
         };
         return { ...next, initialSnapshot: serializeDraft(next) };
      }

      case "REVERT_DRAFT": {
         if (state.initialSnapshot == null) return state;
         let restored: Partial<MissaoDraft>;
         try {
            restored = JSON.parse(
               state.initialSnapshot
            ) as Partial<MissaoDraft>;
         } catch {
            return state;
         }
         const restoredEtapas = (restored.etapas ?? []).map((e) => ({
            ...e,
            dirty: false,
         })) as DraftEtapa[];
         const stillExists = restoredEtapas.some(
            (e) => e.localId === state.selectedLocalId
         );
         const selectedLocalId = stillExists
            ? state.selectedLocalId
            : (restoredEtapas[0]?.localId ?? null);
         return {
            serverId: restored.serverId ?? null,
            titulo: restored.titulo ?? null,
            obs: restored.obs ?? null,
            is_simulador: restored.is_simulador ?? false,
            etapas: restoredEtapas,
            selectedLocalId,
            initialEtapaServerIds: state.initialEtapaServerIds,
            initialSnapshot: state.initialSnapshot,
         };
      }

      default: {
         const _exhaustive: never = action;
         void _exhaustive;
         return state;
      }
   }
}
