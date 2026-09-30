import type { DuplaPilot } from "../types";

export interface SessaoDraft {
   data: string;
   origem: string;
   destino: string;
   dep: string;
   arr: string;
   pousos: number;
   sagem: boolean;
   parte1: boolean;
   reg: "d" | "n" | "v";
   tipoMissaoId: number | null;
   sessionPilots: DuplaPilot[];
}

/** Formulário de nova dupla ainda intocado: referência do `isDirty`. */
export const EMPTY_SESSAO_DRAFT: SessaoDraft = {
   data: "",
   origem: "",
   destino: "",
   dep: "",
   arr: "",
   pousos: 0,
   sagem: false,
   parte1: false,
   reg: "d",
   tipoMissaoId: null,
   sessionPilots: [],
};

/** Compara apenas campos editáveis; nomes e ordem retornados por refetch não são alterações. */
export function serializeSessaoDraft(
   draft: SessaoDraft,
   defaultTipoMissaoId: number | null
): string {
   return JSON.stringify({
      ...draft,
      tipoMissaoId: draft.tipoMissaoId ?? defaultTipoMissaoId,
      sessionPilots: draft.sessionPilots
         .map(({ trip_id, func, func_bordo }) => ({
            trip_id,
            func,
            func_bordo,
         }))
         .sort((a, b) => a.trip_id - b.trip_id),
   });
}
