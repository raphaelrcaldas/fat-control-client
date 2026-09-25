import { timeToMinutes } from "@/../utils/dateHandler";

import { selectEspecificosValid } from "./validators";
import type {
   DraftAssignedTrip,
   DraftEtapa,
   DraftOIItem,
   DraftPoolTrip,
   DraftStatus,
   EtapaFormData,
   MissaoDraft,
} from "./types";

/** Numa etapa "ROTA", registrar pousos (> 0) costuma ser engano: sinaliza suspeita. */
export function isRotaPousoSuspeito(destino: string, pousos: number): boolean {
   return destino === "ROTA" && pousos !== 0;
}

export function calcTvoo(dep: string, arr: string): number {
   if (!dep || !arr) return 0;
   const depMin = timeToMinutes(dep);
   let arrMin = timeToMinutes(arr);
   if (arrMin === 0 && depMin > 0) arrMin = 1440;
   if (arrMin <= depMin) return 0;
   return arrMin - depMin;
}

interface EtapaTotals {
   tvoo: number;
   pousos: number;
   oiTvooSum: number;
   oiValid: boolean;
}

export function selectEtapaTotals(etapa: DraftEtapa): EtapaTotals {
   const tvoo = calcTvoo(etapa.form.dep, etapa.form.arr);
   const oiTvooSum = etapa.oiItems.reduce((acc, oi) => acc + (oi.tvoo || 0), 0);
   const oiValid =
      etapa.oiItems.length === 0 ||
      (oiTvooSum === tvoo &&
         etapa.oiItems.every(
            (oi) => oi.esf_aer_id && oi.tipo_missao_id && oi.tvoo > 0
         ));
   return {
      tvoo,
      pousos: etapa.form.pousos,
      oiTvooSum,
      oiValid,
   };
}

export function selectStatusByEtapa(etapa: DraftEtapa): DraftStatus {
   const totals = selectEtapaTotals(etapa);
   const tvooValid = totals.tvoo > 0 && totals.tvoo % 5 === 0;
   const baseFilled =
      !!etapa.form.data &&
      etapa.form.origem.length === 4 &&
      etapa.form.destino.length === 4 &&
      !!etapa.form.dep &&
      !!etapa.form.arr &&
      !!etapa.form.anv;

   if (!baseFilled) {
      return etapa.serverId == null ? "rascunho" : "editando";
   }
   if (!tvooValid || !totals.oiValid || !selectEspecificosValid(etapa))
      return "verificar";
   return "ok";
}

export function buildLastEtapaTemplate(
   draft: MissaoDraft
): Partial<EtapaFormData> {
   if (draft.etapas.length === 0) return {};
   const last = draft.etapas[draft.etapas.length - 1];
   return {
      data: last.form.data,
      origem: last.form.destino,
      anv: last.form.anv,
      dep: last.form.destino === "ROTA" ? last.form.arr : "",
   };
}

export interface LastEtapaSeed {
   form: Partial<EtapaFormData>;
   oiItems: DraftOIItem[];
   assignedTrips: DraftAssignedTrip[];
}

export function buildLastEtapaSeed(draft: MissaoDraft): LastEtapaSeed {
   const form = buildLastEtapaTemplate(draft);
   if (draft.etapas.length === 0) {
      return { form, oiItems: [], assignedTrips: [] };
   }
   const last = draft.etapas[draft.etapas.length - 1];
   const oiItems: DraftOIItem[] = last.oiItems.map((oi) => ({
      uid: crypto.randomUUID(),
      esf_aer_id: oi.esf_aer_id,
      tipo_missao_id: oi.tipo_missao_id,
      reg: oi.reg,
      tvoo: 0,
      tvooDisplay: "",
   }));
   const assignedTrips: DraftAssignedTrip[] = last.assignedTrips.map((t) => ({
      ...t,
   }));
   return { form, oiItems, assignedTrips };
}

export function buildPoolFromDraft(
   draft: MissaoDraft,
   currentLocalId: string | null
): DraftPoolTrip[] {
   const currentIdx = draft.etapas.findIndex(
      (e) => e.localId === currentLocalId
   );
   const assignedIds = new Set<number>(
      currentIdx >= 0
         ? draft.etapas[currentIdx].assignedTrips.map((t) => t.tripId)
         : []
   );

   // `lastFunc`/`lastFuncBordo` vêm da etapa mais próxima ANTES da atual
   // (a anterior sobrescreve as mais antigas); só quem não voou antes
   // herda de uma etapa posterior. É o que o arrasto reaproveita.
   const before = currentIdx >= 0 ? draft.etapas.slice(0, currentIdx) : [];
   const after =
      currentIdx >= 0 ? draft.etapas.slice(currentIdx + 1) : draft.etapas;

   const seen = new Map<number, DraftPoolTrip>();
   const collect = (etapas: DraftEtapa[], overwrite: boolean) => {
      for (const etapa of etapas) {
         for (const t of etapa.assignedTrips) {
            if (assignedIds.has(t.tripId)) continue;
            if (!overwrite && seen.has(t.tripId)) continue;
            seen.set(t.tripId, {
               tripId: t.tripId,
               trig: t.trig,
               nomeGuerra: t.nomeGuerra,
               pGraduacao: t.pGraduacao,
               lastFunc: t.func,
               lastFuncBordo: t.funcBordo,
               ant: t.ant,
               ult_promo: t.ult_promo,
               ant_rel: t.ant_rel,
            });
         }
      }
   };
   collect(before, true);
   collect(after, false);
   return Array.from(seen.values());
}
