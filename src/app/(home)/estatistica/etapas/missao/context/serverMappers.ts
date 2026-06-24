import type { FuncType } from "@/constants/tripulantes/funcoes";
import { formatTime, minutesToTime } from "@/../utils/dateHandler";
import type {
   EtapaDetail,
   MissaoComEtapasDetail,
} from "services/routes/estatistica/etapas";

import { DEFAULT_ETAPA_FORM } from "./factories";
import { selectStatusByEtapa } from "./selectors";
import { serializeDraft } from "./serialization";
import type {
   DraftAssignedTrip,
   DraftEtapa,
   DraftHeavyCds,
   DraftOIItem,
   DraftPqd,
   DraftRevo,
   EtapaFormData,
   MissaoDraft,
} from "./types";

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
