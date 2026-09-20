import type { EtapaItem } from "services/routes/estatistica/etapas";
import { formatTime } from "@/../utils/dateHandler";
import type { DuplaPilot } from "../types";

export interface SessaoDraft {
   data: string;
   origem: string;
   destino: string;
   dep: string;
   arr: string;
   pousos: number;
   reg: "d" | "n" | "v";
   tipoMissaoId: number | null;
   sessionPilots: DuplaPilot[];
}

export type SessaoPreview = Pick<
   SessaoDraft,
   "data" | "origem" | "destino" | "dep" | "arr"
> & { tvoo: number };

export interface SessaoFormState {
   canSubmit: boolean;
   isPending: boolean;
   isDirty: boolean;
   preview: SessaoPreview | null;
}

export const EMPTY_SESSAO_FORM_STATE: SessaoFormState = {
   canSubmit: false,
   isPending: false,
   isDirty: false,
   preview: null,
};

export function createSessaoDraft(
   etapa: EtapaItem | null,
   pilots: DuplaPilot[]
): SessaoDraft {
   return {
      data: etapa?.data ?? "",
      origem: etapa?.origem ?? "",
      destino: etapa?.destino ?? "",
      dep: etapa ? formatTime(etapa.dep) : "",
      arr: etapa ? formatTime(etapa.arr) : "",
      pousos: etapa?.pousos ?? 0,
      reg: etapa?.oi_etapas[0]?.reg ?? "d",
      tipoMissaoId: etapa?.oi_etapas[0]?.tipo_missao_id ?? null,
      sessionPilots: etapa
         ? etapa.tripulantes.map(
              ({ trip_id, trig, nome_guerra, p_g, func, func_bordo }) => ({
                 trip_id,
                 trig,
                 nome_guerra,
                 p_g,
                 func,
                 func_bordo,
              })
           )
         : pilots.map((pilot, i) => ({
              ...pilot,
              func_bordo: i === 0 ? "1P" : "2P",
           })),
   };
}

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
