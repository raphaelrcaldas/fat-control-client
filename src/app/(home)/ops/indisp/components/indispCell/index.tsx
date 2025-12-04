import IndispContent from "./components/content";
import { Button, Popover } from "flowbite-react";
import { dateIsIn } from "utils/dateHandler";
import { indispsOptions, getIndisp } from "../options";
import { CrewIndispList, IndispType } from "services/routes/indisps";
import clsx from "clsx";

export default function IndispCell({
   dateRef,
   tripData,
   cemal,
   ultVoo,
   update,
}: {
   dateRef: Date;
   tripData: CrewIndispList;
   cemal: Date | null;
   ultVoo: Date | null;
   update: () => void;
}) {
   const indisps = tripData.indisps;
   const trip = tripData.trip;

   const startOfDay = (d: Date) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate()).valueOf();

   // FILTRA INDISP QUE ESTEJA DENTRO DA DATA REFERENTE
   const filterIndisp = indisps.filter((indisp) =>
      dateIsIn(dateRef, indisp.date_start, indisp.date_end)
   );

   const isValidCEMAL =
      cemal instanceof Date &&
      !isNaN(cemal.getTime()) &&
      startOfDay(cemal) >= startOfDay(dateRef);

   const daysSinceLastFlightMs =
      ultVoo instanceof Date && !isNaN(ultVoo.getTime())
         ? startOfDay(dateRef) - startOfDay(ultVoo)
         : null;

   const MIN_DESADAPTA_MS = 45 * 24 * 60 * 60 * 1000; // 45 dias
   const isDesadaptado =
      daysSinceLastFlightMs !== null &&
      daysSinceLastFlightMs >= MIN_DESADAPTA_MS &&
      trip?.func?.func !== "oe" &&
      trip?.func?.func !== "os" &&
      trip?.func?.oper !== "al";

   const btnClass = colorBtn(filterIndisp, isValidCEMAL, isDesadaptado);
   const btn = (
      <Button
         className={clsx("size-10 transition-all duration-200 hover:scale-110 hover:shadow-lg", btnClass)}
         aria-label="Status de disponibilidade"
      >
         {""}
      </Button>
   );

   if (filterIndisp.length < 1 && isValidCEMAL && !isDesadaptado) return btn;

   return (
      <Popover
         content={
            <IndispContent
               trip={trip}
               filterIndisp={filterIndisp}
               dateRef={dateRef}
               isValidCEMAL={isValidCEMAL}
               isDesadaptado={isDesadaptado}
               update={update}
            />
         }
      >
         {btn}
      </Popover>
   );
}

function colorBtn(
   dataIndisp: IndispType[],
   hasValidCemal: boolean,
   isDesadaptado: boolean
) {
   // prioridade: tipos de indisponibilidade
   for (let index = 0; index < indispsOptions.length; index++) {
      const option = indispsOptions[index];

      const filterOption = dataIndisp.filter(
         (indisp) => indisp.mtv == option.value
      );

      if (filterOption.length > 0) {
         const indispProps = getIndisp(option.value);
         return indispProps?.color?.button ?? "bg-slate-500";
      }
   }

   // sem indisps: tratar CEMAL / desadaptado / disponível
   if (!hasValidCemal) {
      return "bg-purple-600 enabled:hover:bg-purple-800";
   }

   if (isDesadaptado) {
      return "bg-slate-600 enabled:hover:bg-slate-800";
   }

   return "bg-emerald-600";
}
