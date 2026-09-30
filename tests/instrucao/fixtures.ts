import type { EtapaItem } from "services/routes/estatistica/etapas";

export function etapa(id = 1): EtapaItem {
   return {
      id,
      data: "2026-09-19",
      origem: "SBGL",
      destino: "SBGL",
      dep: "10:00:00",
      arr: "11:00:00",
      tvoo: 60,
      anv: "SIM",
      pousos: 1,
      sagem: false,
      parte1: false,
      obs: null,
      tow: null,
      pax: null,
      carga: null,
      comb: null,
      lub: null,
      nivel: null,
      oi_etapas: [
         {
            esf_aer_id: 1,
            tipo_missao_id: 1,
            esf_aer: "SML",
            tipo_missao_cod: "SIM",
            reg: "d",
            tvoo: 60,
         },
      ],
      tripulantes: [
         {
            trip_id: 1,
            trig: "ABC",
            nome_guerra: "Piloto",
            p_g: "CAP",
            func: "pil",
            func_bordo: "1P",
            ant: 1,
            ult_promo: null,
            ant_rel: null,
         },
      ],
      pqd: [],
      revo: [],
      heavy_cds: [],
   };
}
