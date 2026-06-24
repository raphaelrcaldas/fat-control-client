import type {
   DraftHeavyCds,
   DraftOIItem,
   DraftPqd,
   DraftRevo,
   EspecificoKind,
   EtapaFormData,
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
   return { uid: crypto.randomUUID(), tipo: "LV", qtd: 1 };
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
