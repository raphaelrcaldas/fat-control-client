import type { FuncType } from "@/constants/tripulantes/funcoes";
import {
   minutesToTime,
   timeToMinutes,
   formatTime,
} from "@/../utils/dateHandler";
import type {
   EtapaDetail,
   MissaoComEtapasDetail,
} from "services/routes/estatistica/etapas";
import type {
   DraftAssignedTrip,
   DraftEtapa,
   DraftHeavyCds,
   DraftOIItem,
   DraftPoolTrip,
   DraftPqd,
   DraftRevo,
   DraftStatus,
   EspecificoKind,
   EtapaFormData,
   MissaoDraft,
} from "./types";

export const DEFAULT_ETAPA_FORM: EtapaFormData = {
   data: "",
   origem: "",
   destino: "",
   dep: "",
   arr: "",
   anv: "",
   pousos: 1,
   tow: null,
   pax: null,
   carga: null,
   comb: null,
   lub: null,
   nivel: "",
   sagem: false,
   parte1: false,
   obs: "",
};

export function calcTvoo(dep: string, arr: string): number {
   if (!dep || !arr) return 0;
   const depMin = timeToMinutes(dep);
   let arrMin = timeToMinutes(arr);
   if (arrMin === 0 && depMin > 0) arrMin = 1440;
   if (arrMin <= depMin) return 0;
   return arrMin - depMin;
}

export function newLocalId(): string {
   return crypto.randomUUID();
}

export function newOiItem(esfAerId: number | null = null): DraftOIItem {
   return {
      uid: crypto.randomUUID(),
      esf_aer_id: esfAerId,
      tipo_missao_id: null,
      reg: "d",
      tvoo: 0,
      tvooDisplay: "",
   };
}

export function newPqd(): DraftPqd {
   return { uid: crypto.randomUUID(), tipo: "VTC", qtd: 1 };
}

export function newRevo(): DraftRevo {
   return { uid: crypto.randomUUID(), combTransf: null };
}

export function newHeavyCds(): DraftHeavyCds {
   return {
      uid: crypto.randomUUID(),
      tipo: "heavy",
      peso: null,
      dist: null,
      radial: null,
   };
}

export function newEspecifico(
   kind: EspecificoKind
): DraftPqd | DraftRevo | DraftHeavyCds {
   switch (kind) {
      case "pqd":
         return newPqd();
      case "revo":
         return newRevo();
      case "heavyCds":
         return newHeavyCds();
   }
}

/** Um item PQD e valido com quantidade preenchida e >= 0 (0 = passagem em branco). */
export function isPqdValid(p: DraftPqd): boolean {
   return p.qtd != null && p.qtd >= 0;
}

/** Um item REVO so e valido com combustivel transferido preenchido e >= 1. */
export function isRevoValid(r: DraftRevo): boolean {
   return r.combTransf != null && r.combTransf >= 1;
}

/** Um lancamento de carga so e valido com peso/dist >= 1 e radial 0..359. */
export function isHeavyCdsValid(h: DraftHeavyCds): boolean {
   return (
      h.peso != null &&
      h.peso >= 1 &&
      h.dist != null &&
      h.dist >= 1 &&
      h.radial != null &&
      h.radial >= 0 &&
      h.radial <= 359
   );
}

/** Todos os especificos da etapa preenchidos (arrays vazios sao validos). */
export function selectEspecificosValid(etapa: DraftEtapa): boolean {
   return (
      etapa.pqd.every(isPqdValid) &&
      etapa.revo.every(isRevoValid) &&
      etapa.heavyCds.every(isHeavyCdsValid)
   );
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
   const assignedIds = new Set<number>();
   if (currentLocalId) {
      const current = draft.etapas.find((e) => e.localId === currentLocalId);
      if (current) {
         for (const t of current.assignedTrips) assignedIds.add(t.tripId);
      }
   }

   const seen = new Map<number, DraftPoolTrip>();
   for (const etapa of draft.etapas) {
      for (const t of etapa.assignedTrips) {
         if (!seen.has(t.tripId) && !assignedIds.has(t.tripId)) {
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
   }
   return Array.from(seen.values());
}

function stableStringify(value: unknown): string {
   if (value === null || typeof value !== "object") {
      return JSON.stringify(value);
   }
   if (Array.isArray(value)) {
      return `[${value.map((v) => stableStringify(v)).join(",")}]`;
   }
   const obj = value as Record<string, unknown>;
   const keys = Object.keys(obj).sort();
   const parts = keys.map(
      (k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`
   );
   return `{${parts.join(",")}}`;
}

export function serializeDraft(draft: MissaoDraft): string {
   // Exclude UI-only fields and metadata that shouldn't trigger "dirty":
   //   - initialSnapshot: the comparison reference itself
   //   - initialEtapaServerIds: load-time metadata for delete-detection
   //   - selectedLocalId: pure UI state (which etapa the user is viewing)
   //   - dirty: derived flag set by user actions, not a value to compare
   const {
      initialSnapshot: _omitSnapshot,
      initialEtapaServerIds: _omitIds,
      selectedLocalId: _omitSelected,
      ...rest
   } = draft;
   void _omitSnapshot;
   void _omitIds;
   void _omitSelected;
   const cleanedEtapas = rest.etapas.map(
      ({ dirty: _omitDirty, ...etapaRest }) => {
         void _omitDirty;
         return etapaRest;
      }
   );
   return stableStringify({ ...rest, etapas: cleanedEtapas });
}

export function isDirty(draft: MissaoDraft): boolean {
   if (draft.initialSnapshot == null) return true;
   return serializeDraft(draft) !== draft.initialSnapshot;
}

function detailToOiItems(detail: EtapaDetail): DraftOIItem[] {
   return detail.oi_etapas.map((oi) => ({
      uid: crypto.randomUUID(),
      esf_aer_id: oi.esf_aer_id,
      tipo_missao_id: oi.tipo_missao_id,
      reg: oi.reg,
      tvoo: oi.tvoo,
      tvooDisplay: minutesToTime(oi.tvoo),
   }));
}

function detailToPqd(detail: EtapaDetail): DraftPqd[] {
   return (detail.pqd ?? []).map((p) => ({
      uid: crypto.randomUUID(),
      tipo: p.tipo,
      qtd: p.qtd,
   }));
}

function detailToRevo(detail: EtapaDetail): DraftRevo[] {
   return (detail.revo ?? []).map((r) => ({
      uid: crypto.randomUUID(),
      combTransf: r.comb_transf,
   }));
}

function detailToHeavyCds(detail: EtapaDetail): DraftHeavyCds[] {
   return (detail.heavy_cds ?? []).map((h) => ({
      uid: crypto.randomUUID(),
      tipo: h.tipo,
      peso: h.peso,
      dist: h.dist,
      radial: h.radial,
   }));
}

function detailToAssignedTrips(detail: EtapaDetail): DraftAssignedTrip[] {
   return detail.tripulantes.map((t) => ({
      tripId: t.trip_id,
      trig: t.trig,
      nomeGuerra: t.nome_guerra,
      pGraduacao: t.p_g,
      func: t.func as FuncType,
      funcBordo: t.func_bordo,
      ant: t.ant,
      ult_promo: t.ult_promo,
      ant_rel: t.ant_rel,
   }));
}

export function buildDraftEtapaFromDetail(detail: EtapaDetail): DraftEtapa {
   const form: EtapaFormData = {
      data: String(detail.data),
      origem: detail.origem,
      destino: detail.destino,
      dep: formatTime(detail.dep),
      arr: formatTime(detail.arr),
      anv: detail.anv,
      pousos: detail.pousos,
      tow: detail.tow ?? null,
      pax: detail.pax ?? null,
      carga: detail.carga ?? null,
      comb: detail.comb ?? null,
      lub: detail.lub != null ? Math.round(detail.lub * 10) / 10 : null,
      nivel: detail.nivel ?? "",
      sagem: detail.sagem,
      parte1: detail.parte1,
      obs: detail.obs ?? "",
   };
   const etapa: DraftEtapa = {
      localId: crypto.randomUUID(),
      serverId: detail.id,
      status: "ok",
      form,
      oiItems: detailToOiItems(detail),
      assignedTrips: detailToAssignedTrips(detail),
      pqd: detailToPqd(detail),
      revo: detailToRevo(detail),
      heavyCds: detailToHeavyCds(detail),
      dirty: false,
   };
   etapa.status = selectStatusByEtapa(etapa);
   return etapa;
}

export function buildDraftFromServer(
   missao: MissaoComEtapasDetail,
   selectEtapaServerId?: number
): MissaoDraft {
   const etapas: DraftEtapa[] = missao.etapas.map(buildDraftEtapaFromDetail);

   let selectedLocalId: string | null = null;
   if (selectEtapaServerId != null) {
      const found = etapas.find((e) => e.serverId === selectEtapaServerId);
      if (found) selectedLocalId = found.localId;
   }
   if (!selectedLocalId && etapas.length > 0) {
      selectedLocalId = etapas[0].localId;
   }

   const draft: MissaoDraft = {
      serverId: missao.id,
      titulo: missao.titulo,
      obs: missao.obs,
      is_simulador: missao.is_simulador,
      etapas,
      selectedLocalId,
      initialEtapaServerIds: etapas
         .filter((e) => e.serverId !== null)
         .map((e) => e.serverId as number),
      initialSnapshot: null,
   };
   draft.initialSnapshot = serializeDraft(draft);
   return draft;
}

export function emptyDraft(): MissaoDraft {
   const firstEtapa: DraftEtapa = {
      localId: crypto.randomUUID(),
      serverId: null,
      status: "rascunho",
      form: { ...DEFAULT_ETAPA_FORM },
      oiItems: [],
      assignedTrips: [],
      pqd: [],
      revo: [],
      heavyCds: [],
      dirty: false,
   };
   const draft: MissaoDraft = {
      serverId: null,
      titulo: null,
      obs: null,
      is_simulador: false,
      etapas: [firstEtapa],
      selectedLocalId: firstEtapa.localId,
      initialEtapaServerIds: [],
      initialSnapshot: null,
   };
   draft.initialSnapshot = serializeDraft(draft);
   return draft;
}
