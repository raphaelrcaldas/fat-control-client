import { dateIsIn, dateToIso, startOfDay } from "utils/dateHandler";
import { CrewIndispList, IndispType } from "services/routes/indisps";
import type { RestricaoDerivada } from "services/routes/ops/restricoes";
import {
   INDISP_OPTIONS,
   getIndispOption,
} from "@/constants/ops/indisponibilidades";

/** Indicador visual; a regra de desadaptação vem exclusivamente da API. */
export function daysSinceLastFlight(
   ultVoo: Date | null,
   dateRef: Date
): number | null {
   if (!(ultVoo instanceof Date) || isNaN(ultVoo.getTime())) return null;
   return Math.floor((startOfDay(dateRef) - startOfDay(ultVoo)) / 86_400_000);
}

export function filterIndispsForDate(
   indisps: IndispType[],
   dateRef: Date
): IndispType[] {
   return indisps.filter(
      (i) => !i.deleted_at && dateIsIn(dateRef, i.date_start, i.date_end)
   );
}

export function filterRestricoesForDate(
   restricoes: RestricaoDerivada[],
   dateRef: Date
): RestricaoDerivada[] {
   const date = dateToIso(dateRef);
   return restricoes.filter(
      ({ inicio, fim }) => (!inicio || inicio <= date) && (!fim || fim >= date)
   );
}

export function getStatusColor(
   filteredIndisps: IndispType[],
   restricoes: RestricaoDerivada[]
): string {
   for (const option of INDISP_OPTIONS) {
      if (filteredIndisps.some((i) => i.mtv == option.value)) {
         return getIndispOption(option.value)?.color?.button ?? "bg-slate-500";
      }
   }
   if (restricoes.some((r) => r.origem === "cemal")) {
      return "bg-purple-600 enabled:hover:bg-purple-800";
   }
   if (restricoes.some((r) => r.codigo === "desadaptacao")) {
      return "bg-slate-600 enabled:hover:bg-slate-800";
   }
   return "bg-emerald-600";
}

export interface IndispStatus {
   filterIndisp: IndispType[];
   restricoesDerivadas: RestricaoDerivada[];
   color: string;
   canOpen: boolean;
}

export function computeIndispStatus(
   tripData: CrewIndispList,
   dateRef: Date
): IndispStatus {
   const filterIndisp = filterIndispsForDate(tripData.indisps, dateRef);
   const restricoesDerivadas = filterRestricoesForDate(
      tripData.restricoes_derivadas,
      dateRef
   );
   return {
      filterIndisp,
      restricoesDerivadas,
      color: getStatusColor(filterIndisp, restricoesDerivadas),
      canOpen: filterIndisp.length > 0 || restricoesDerivadas.length > 0,
   };
}
