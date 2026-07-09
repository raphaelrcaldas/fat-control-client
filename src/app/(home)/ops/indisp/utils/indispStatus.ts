import { dateIsIn, isoStrToDate, startOfDay } from "utils/dateHandler";
import {
   CrewIndisp,
   CrewIndispList,
   IndispType,
} from "services/routes/indisps";
import {
   INDISP_OPTIONS,
   getIndispOption,
} from "@/constants/ops/indisponibilidades";

export const MIN_DESADAPTA_DAYS = 45;

/**
 * Dias decorridos (em dias inteiros) desde o último voo até a data de
 * referência, ignorando a hora. `null` quando não há data válida.
 */
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

export function isCemalValid(cemal: Date | null, dateRef: Date): boolean {
   return (
      cemal instanceof Date &&
      !isNaN(cemal.getTime()) &&
      startOfDay(cemal) >= startOfDay(dateRef)
   );
}

export function isElegivelDesadapta(trip: CrewIndisp): boolean {
   return trip?.func !== "oe" && trip?.func !== "os" && trip?.oper !== "al";
}

export function isDesadaptado(
   ultVoo: Date | null,
   dateRef: Date,
   trip: CrewIndisp
): boolean {
   const days = daysSinceLastFlight(ultVoo, dateRef);
   return (
      days !== null && days >= MIN_DESADAPTA_DAYS && isElegivelDesadapta(trip)
   );
}

export function getStatusColor(
   filteredIndisps: IndispType[],
   hasValidCemal: boolean,
   desadaptado: boolean
): string {
   for (const option of INDISP_OPTIONS) {
      if (filteredIndisps.some((i) => i.mtv == option.value)) {
         return getIndispOption(option.value)?.color?.button ?? "bg-slate-500";
      }
   }
   if (!hasValidCemal) return "bg-purple-600 enabled:hover:bg-purple-800";
   if (desadaptado) return "bg-slate-600 enabled:hover:bg-slate-800";
   return "bg-emerald-600";
}

export interface IndispStatus {
   filterIndisp: IndispType[];
   isValidCEMAL: boolean;
   isDesadaptado: boolean;
   color: string;
   canOpen: boolean;
}

export function parseTripDates(trip: CrewIndisp) {
   return {
      cemal: trip.cemal ? isoStrToDate(trip.cemal) : null,
      ultVoo: trip.data_ult_voo ? isoStrToDate(trip.data_ult_voo) : null,
   };
}

export function computeIndispStatus(
   tripData: CrewIndispList,
   dateRef: Date
): IndispStatus {
   const { cemal, ultVoo } = parseTripDates(tripData.trip);
   const filterIndisp = filterIndispsForDate(tripData.indisps, dateRef);
   const validCemal = isCemalValid(cemal, dateRef);
   const desadapt = isDesadaptado(ultVoo, dateRef, tripData.trip);
   return {
      filterIndisp,
      isValidCEMAL: validCemal,
      isDesadaptado: desadapt,
      color: getStatusColor(filterIndisp, validCemal, desadapt),
      canOpen: filterIndisp.length > 0 || !validCemal || desadapt,
   };
}
