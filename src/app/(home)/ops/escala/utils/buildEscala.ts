import {
   daysSinceLastFlight,
   filterRestricoesForDate,
} from "@/app/(home)/ops/indisp/utils/indispStatus";
import { formatPeriodoSemAno, isoStrToDate } from "utils/dateHandler";
import type {
   EscalaFuncSection,
   EscalaTripEntry,
} from "services/routes/ops/escala";
import type { BlockReason, SectionBucket, TripStatus } from "../types";

function buildTripStatus(trip: EscalaTripEntry, dateRef: Date): TripStatus {
   const ultVoo = trip.data_ult_voo ? isoStrToDate(trip.data_ult_voo) : null;
   const restricoesDerivadas = filterRestricoesForDate(
      trip.restricoes_derivadas,
      dateRef
   );
   const cemalRestricao = restricoesDerivadas.find(
      (restricao) => restricao.origem === "cemal"
   );
   const desadapt = restricoesDerivadas.some(
      (restricao) => restricao.codigo === "desadaptacao"
   );

   const reasons: BlockReason[] = [];

   if (cemalRestricao) {
      const label =
         cemalRestricao.codigo === "cemal_ausente"
            ? "CEMAL ausente"
            : `CEMAL vencido em ${formatPeriodoSemAno(trip.cemal_date!, trip.cemal_date!)}`;
      reasons.push({ kind: "cemal", label });
   }

   for (const indisp of trip.indisps) {
      // `ins` É a indisponibilidade de CEMAL. Com o cartão vencido, a linha
      // acima já diz isso — listar as duas fazia o mesmo impedimento contar
      // duas vezes no card. Quando o CEMAL está em dia, o `ins` continua
      // aparecendo: aí ele informa algo novo (afastado para fazer o exame).
      if (indisp.mtv === "ins" && cemalRestricao) continue;

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
      cemalValid: !cemalRestricao,
      isAvailable: !cemalRestricao && trip.indisps.length === 0,
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
