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

/**
 * Monta o estado inicial do formulário.
 *
 * Em edição (`etapa`), espelha a sessão. Em criação, repete da última sessão
 * o que costuma se repetir entre sessões da mesma dupla — mesmo critério de
 * `buildLastEtapaSeed` em `estatistica/etapas`: `data`, `reg`, `tipo_missao_id`
 * e a **origem encadeada do destino anterior**.
 *
 * `destino`, `dep`/`arr` e `pousos` ficam de fora. Os horários são o que
 * distingue uma sessão da seguinte, e como são obrigatórios para submeter,
 * deixá-los vazios força a revisão. `pousos` seria o oposto: herdado, passaria
 * na validação sem ninguém reparar.
 */
export function createSessaoDraft(
   etapa: EtapaItem | null,
   pilots: DuplaPilot[],
   ultimaEtapa: EtapaItem | null = null
): SessaoDraft {
   const seed = etapa ?? ultimaEtapa;
   return {
      data: seed?.data ?? "",
      // Encadeia a rota: a sessao nova parte de onde a anterior terminou.
      origem: etapa ? etapa.origem : (ultimaEtapa?.destino ?? ""),
      // Nao herda, como em `estatistica/etapas`: o destino e o que o usuario
      // decide agora. No simulador quase sempre repete a origem, mas cravar
      // isso aqui assumiria o caso comum como se fosse regra.
      destino: etapa?.destino ?? "",
      dep: etapa ? formatTime(etapa.dep) : "",
      arr: etapa ? formatTime(etapa.arr) : "",
      // Nao herda: e contagem propria da sessao e, ao contrario de dep/arr,
      // um valor herdado passaria na validacao sem o usuario rever.
      pousos: etapa?.pousos ?? 0,
      reg: seed?.oi_etapas[0]?.reg ?? "d",
      tipoMissaoId: seed?.oi_etapas[0]?.tipo_missao_id ?? null,
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
