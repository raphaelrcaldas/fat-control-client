import type { FormData } from "./types";

export const DEFAULT_FORM: FormData = {
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

/** Limites dos campos numéricos conforme colunas do banco. */
export const FIELD_LIMITS = {
   pousos: { min: 0, max: 20, label: "Pousos" },
   tow: { min: 52000, max: 87000, label: "TOW" },
   pax: { min: 0, max: 84, label: "PAX" },
   carga: { min: 0, max: 30000, label: "Carga" },
   comb: { min: 1, max: 32767, label: "Combustível" },
   lub: { min: 0, max: 99.9, label: "Lubrificante" },
} as const;
