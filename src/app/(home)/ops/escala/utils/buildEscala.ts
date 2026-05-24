import {
   isCemalValid,
   isDesadaptado,
} from "@/app/(home)/ops/indisp/utils/indispStatus";
import {
   formatPeriodo,
   formatPeriodoSemAno,
   isoStrToDate,
} from "utils/dateHandler";
import type {
   EscalaFuncSection,
   EscalaTripEntry,
} from "services/routes/ops/escala";

export interface BlockReason {
   kind: "cemal" | "indisp";
   label: string;
   detail?: string;
}

export interface TripStatus {
   trip: EscalaTripEntry;
   isDesadaptado: boolean;
   dsvDias: number | null;
   cemalValid: boolean;
   isAvailable: boolean;
   reasons: BlockReason[];
}

export interface SectionBucket {
   func: string;
   total: number;
   disponiveis: TripStatus[];
   indisponiveis: TripStatus[];
}

const MS_DIA = 24 * 60 * 60 * 1000;

function indispLabel(mtv: string): string {
   switch (mtv) {
      case "svc":
         return "Serviço";
      case "sde":
         return "Saúde";
      case "rep":
         return "Representação";
      case "fer":
         return "Férias";
      case "lic":
         return "Licença";
      case "mis":
         return "Missão";
      case "odm":
         return "Ordem de Missão";
      case "pes":
         return "Particular";
      case "ins":
         return "CEMAL";
      default:
         return mtv.toUpperCase();
   }
}

function buildTripStatus(trip: EscalaTripEntry, dateRef: Date): TripStatus {
   const cemal = trip.cemal_date ? isoStrToDate(trip.cemal_date) : null;
   const ultVoo = trip.data_ult_voo ? isoStrToDate(trip.data_ult_voo) : null;

   const tripForDesadaptado = {
      func: { func: trip.func, oper: trip.oper ?? "" },
   } as Parameters<typeof isDesadaptado>[2];

   const desadapt = isDesadaptado(ultVoo, dateRef, tripForDesadaptado);
   const cemalOk = isCemalValid(cemal, dateRef);

   const reasons: BlockReason[] = [];

   if (!cemalOk) {
      const label = trip.cemal_date
         ? `CEMAL vencido em ${formatPeriodoSemAno(trip.cemal_date, trip.cemal_date)}`
         : "CEMAL ausente";
      reasons.push({ kind: "cemal", label });
   }

   for (const indisp of trip.indisps) {
      reasons.push({
         kind: "indisp",
         label: indisp.mtv,
         detail: formatPeriodoSemAno(indisp.date_start, indisp.date_end),
      });
   }

   const dsvDias =
      ultVoo === null
         ? null
         : Math.floor((dateRef.getTime() - ultVoo.getTime()) / MS_DIA);

   return {
      trip,
      isDesadaptado: desadapt,
      dsvDias,
      cemalValid: cemalOk,
      isAvailable: cemalOk && trip.indisps.length === 0,
      reasons,
   };
}

export function buildBuckets(
   sections: EscalaFuncSection[],
   dateEnd: string
): SectionBucket[] {
   const dateRef = isoStrToDate(dateEnd);
   return sections.map((section) => {
      const statuses = section.trips.map((t) => buildTripStatus(t, dateRef));
      return {
         func: section.func,
         total: statuses.length,
         disponiveis: statuses.filter((s) => s.isAvailable),
         indisponiveis: statuses.filter((s) => !s.isAvailable),
      };
   });
}

export function formatRangeLabel(date_start: string, date_end: string): string {
   return formatPeriodo(date_start, date_end);
}
