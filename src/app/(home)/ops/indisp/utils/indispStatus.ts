import { dateIsIn, isoStrToDate } from "utils/dateHandler";
import {
   CrewIndisp,
   CrewIndispList,
   IndispType,
} from "services/routes/indisps";
import { indispsOptions, getIndisp } from "../components/options";

export const MIN_DESADAPTA_MS = 45 * 24 * 60 * 60 * 1000; // 45 dias

export const startOfDay = (d: Date) =>
   new Date(d.getFullYear(), d.getMonth(), d.getDate()).valueOf();

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

export function isDesadaptado(
   ultVoo: Date | null,
   dateRef: Date,
   trip: CrewIndisp
): boolean {
   if (!(ultVoo instanceof Date) || isNaN(ultVoo.getTime())) return false;
   const diff = startOfDay(dateRef) - startOfDay(ultVoo);
   return (
      diff >= MIN_DESADAPTA_MS &&
      trip?.func?.func !== "oe" &&
      trip?.func?.func !== "os" &&
      trip?.func?.oper !== "al"
   );
}

export function getStatusColor(
   filteredIndisps: IndispType[],
   hasValidCemal: boolean,
   desadaptado: boolean
): string {
   for (const option of indispsOptions) {
      if (filteredIndisps.some((i) => i.mtv == option.value)) {
         return getIndisp(option.value)?.color?.button ?? "bg-slate-500";
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
