import type { EtapaItem } from "services/routes/estatistica/etapas";
import type { DuplaPilot } from "../types";
import { compareByAntiguidade } from "@/../utils/sortByAntiguidade";

type PilotAntiguidade = Pick<
   DuplaPilot,
   "trip_id" | "ant" | "ult_promo" | "ant_rel"
>;
export function comparePilotos(
   first: PilotAntiguidade,
   second: PilotAntiguidade
): number {
   return (
      compareByAntiguidade(
         {
            posto: { ant: first.ant ?? Number.MAX_SAFE_INTEGER },
            ult_promo: first.ult_promo,
            ant_rel: first.ant_rel,
         },
         {
            posto: { ant: second.ant ?? Number.MAX_SAFE_INTEGER },
            ult_promo: second.ult_promo,
            ant_rel: second.ant_rel,
         }
      ) || first.trip_id - second.trip_id
   );
}
export function sortPilotos<T extends PilotAntiguidade>(pilotos: T[]): T[] {
   return [...pilotos].sort(comparePilotos);
}

/** Ordena etapas por data + horário de decolagem (ascendente), sem mutar a entrada. */
export function sortEtapas(etapas: EtapaItem[]): EtapaItem[] {
   return etapas
      .slice()
      .sort((a, b) => `${a.data}T${a.dep}`.localeCompare(`${b.data}T${b.dep}`));
}

/** Monta o rótulo "P_G NOME · P_G NOME" dos pilotos da dupla. */
export function formatPilotNames(
   pilots: { p_g: string; nome_guerra: string }[]
): string {
   if (pilots.length === 0) return "Sem pilotos";
   return pilots.map((p) => `${p.p_g} ${p.nome_guerra}`).join(" · ");
}

export function collectPilotos(etapas: EtapaItem[]): DuplaPilot[] {
   const pilotos = new Map<number, DuplaPilot>();

   for (const etapa of etapas) {
      for (const trip of etapa.tripulantes) {
         if (!pilotos.has(trip.trip_id)) {
            pilotos.set(trip.trip_id, {
               trip_id: trip.trip_id,
               trig: trip.trig,
               nome_guerra: trip.nome_guerra,
               p_g: trip.p_g,
               func: trip.func,
               func_bordo: trip.func_bordo,
               ant: trip.ant,
               ult_promo: trip.ult_promo,
               ant_rel: trip.ant_rel,
            });
         }
      }
   }

   return sortPilotos(Array.from(pilotos.values()));
}
