import {
   type EtapaCreateNestedPayload,
   type EtapaUpdateNestedPayload,
   type MissaoComEtapasCreatePayload,
   type MissaoComEtapasUpdatePayload,
} from "services/routes/estatistica/etapas";

import { selectEtapaTotals } from "./helpers";
import type { DraftEtapa, MissaoDraft } from "./types";

export function toHHmmss(value: string): string {
   // Garante HH:mm:ss; aceita HH:mm e completa com :00
   if (!value) return value;
   return value.length === 5 ? `${value}:00` : value;
}

export function nullIfEmpty(value: string | null | undefined): string | null {
   if (value == null) return null;
   const trimmed = value.trim();
   return trimmed.length === 0 ? null : trimmed;
}

export function buildEtapaNested(etapa: DraftEtapa): EtapaCreateNestedPayload {
   const totals = selectEtapaTotals(etapa);
   return {
      data: etapa.form.data,
      origem: etapa.form.origem.toUpperCase(),
      destino: etapa.form.destino.toUpperCase(),
      dep: toHHmmss(etapa.form.dep),
      arr: toHHmmss(etapa.form.arr),
      tvoo: totals.tvoo,
      anv: etapa.form.anv.toUpperCase(),
      pousos: etapa.form.pousos,
      tow: etapa.form.tow,
      pax: etapa.form.pax,
      carga: etapa.form.carga,
      comb: etapa.form.comb,
      lub: etapa.form.lub,
      nivel: nullIfEmpty(etapa.form.nivel),
      sagem: etapa.form.sagem,
      parte1: etapa.form.parte1,
      obs: nullIfEmpty(etapa.form.obs),
      tripulantes: etapa.assignedTrips.map((t) => ({
         trip_id: t.tripId,
         func: t.func,
         func_bordo: t.funcBordo,
      })),
      oi_etapas: etapa.oiItems
         .filter((oi) => oi.esf_aer_id != null && oi.tipo_missao_id != null)
         .map((oi) => ({
            esf_aer_id: oi.esf_aer_id as number,
            tipo_missao_id: oi.tipo_missao_id as number,
            reg: oi.reg,
            tvoo: oi.tvoo,
         })),
      pqd: etapa.pqd.map((p) => ({ tipo: p.tipo, qtd: p.qtd ?? 0 })),
      revo: etapa.revo.map((r) => ({ comb_transf: r.combTransf ?? 0 })),
      heavy_cds: etapa.heavyCds.map((h) => ({
         tipo: h.tipo,
         peso: h.peso ?? 0,
         dist: h.dist ?? 0,
         radial: h.radial ?? 0,
      })),
   };
}

export function buildMissaoPayload(
   draft: MissaoDraft
): MissaoComEtapasCreatePayload {
   return {
      titulo: nullIfEmpty(draft.titulo),
      obs: nullIfEmpty(draft.obs),
      is_simulador: draft.is_simulador,
      etapas: draft.etapas.map(buildEtapaNested),
   };
}

export function buildUpdatePayload(
   draft: MissaoDraft
): MissaoComEtapasUpdatePayload {
   const currentServerIds = new Set(
      draft.etapas
         .filter((e) => e.serverId !== null)
         .map((e) => e.serverId as number)
   );
   const delete_ids = draft.initialEtapaServerIds.filter(
      (id) => !currentServerIds.has(id)
   );

   const update: EtapaUpdateNestedPayload[] = draft.etapas
      .filter((e) => e.serverId !== null && e.dirty)
      .map((e) => ({ id: e.serverId as number, ...buildEtapaNested(e) }));

   const create: EtapaCreateNestedPayload[] = draft.etapas
      .filter((e) => e.serverId === null)
      .map(buildEtapaNested);

   // titulo/obs vao crus no update (sem nullIfEmpty), ao contrario do create
   return {
      titulo: draft.titulo,
      obs: draft.obs,
      delete_ids,
      update,
      create,
   };
}
