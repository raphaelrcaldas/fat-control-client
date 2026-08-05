import {
   daysSinceLastFlight,
   isCemalValid,
   isDesadaptado,
   type ElegibilidadeDesadapta,
} from "@/app/(home)/ops/indisp/utils/indispStatus";
import { formatPeriodoSemAno, isoStrToDate } from "utils/dateHandler";
import type {
   EscalaFuncSection,
   EscalaTripEntry,
} from "services/routes/ops/escala";
import type { BlockReason, SectionBucket, TripStatus } from "../types";

function buildTripStatus(trip: EscalaTripEntry, dateRef: Date): TripStatus {
   const cemal = trip.cemal_date ? isoStrToDate(trip.cemal_date) : null;
   const ultVoo = trip.data_ult_voo ? isoStrToDate(trip.data_ult_voo) : null;

   const tripForDesadaptado: ElegibilidadeDesadapta = {
      func: trip.func,
      oper: trip.oper ?? "",
   };

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
      // `ins` É a indisponibilidade de CEMAL. Com o cartão vencido, a linha
      // acima já diz isso — listar as duas fazia o mesmo impedimento contar
      // duas vezes no card. Quando o CEMAL está em dia, o `ins` continua
      // aparecendo: aí ele informa algo novo (afastado para fazer o exame).
      if (indisp.mtv === "ins" && !cemalOk) continue;

      reasons.push({
         kind: "indisp",
         label: indisp.mtv,
         detail: formatPeriodoSemAno(indisp.date_start, indisp.date_end),
      });
   }

   // Mesma conta de `daysSinceLastFlight` (que este módulo já importava):
   // a versão de lá normaliza com `startOfDay`, então não erra por uma hora
   // na virada do horário de verão.
   const dsvDias = daysSinceLastFlight(ultVoo, dateRef);

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
