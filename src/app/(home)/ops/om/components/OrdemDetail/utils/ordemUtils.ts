import type { OrdemMissaoOut, EtapaOut } from "services/routes/om/ordens";
import {
   calcularTempoVooMinutos,
   addMinutesToIsoDatetime,
} from "utils/dateHandler";

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
      esf_aer: esf_aer || "",
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
