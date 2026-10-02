import type { OrdemMissaoOut, EtapaOut } from "services/routes/om/ordens";
import {
   calcularTempoVooMinutos,
   addMinutesToIsoDatetime,
} from "utils/dateHandler";

// Mesmo conjunto de whitespace de EtapaBase na API, incluindo NEL e BOM.
const ESFORCO_AEREO_WHITESPACE =
   /[\u0009-\u000d\u001c-\u0020\u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/g;

// Limpa as extremidades e reduz sequências internas a um espaço.
export const normalizeEtapaEsforcoAereo = (value?: string | null): string =>
   (value ?? "").replace(ESFORCO_AEREO_WHITESPACE, " ").trim();

// Calcula o esforço aéreo total (soma dos tempos de voo das etapas)
export const calcularEsfAer = (etapas: EtapaOut[]): number => {
   return etapas.reduce((acc, etapa) => {
      if (etapa.dt_dep && etapa.dt_arr) {
         return acc + calcularTempoVooMinutos(etapa.dt_dep, etapa.dt_arr);
      }
      return acc;
   }, 0);
};

export const createNextEtapa = (
   referenceEtapa: EtapaOut
): Partial<EtapaOut> => {
   const { dest, esf_aer, dt_arr, dt_dep } = referenceEtapa;

   // Base datetime for the calculation
   const baseDateTime = dt_arr || dt_dep;

   const nextDateTime = baseDateTime
      ? addMinutesToIsoDatetime(baseDateTime, 120)
      : "";

   return {
      dt_dep: nextDateTime,
      origem: dest || "",
      dt_arr: "",
      dest: "",
      alternativa: "",
      tvoo_alt: 0,
      qtd_comb: 0,
      esf_aer: normalizeEtapaEsforcoAereo(esf_aer),
   };
};

export const createDefaultOrdem = (): Partial<OrdemMissaoOut> => ({
   id: 0,
   doc_ref: "",
   matricula_anv: "",
   projeto: "kc-390",
   tipo: "",
   status: "rascunho",
   esf_aer: 0,
   etapas: [], // Inicia sem etapas - usuário adiciona via modal
   etiquetas: [],
});
