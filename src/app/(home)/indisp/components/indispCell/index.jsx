import IndispContent from "./components/content";
import { Button, Popover } from "flowbite-react";
import { dateIsIn, isoStrLocalToDate } from "@/utils/dateHandler";
import { indispsOptions, getIndisp } from "../options";

export default function IndispCell({ dateRef, trip, indisps, cemal, ultVoo }) {
   // FILTRA INDISP QUE ESTEJA DENTRO DA DATA REFERENTE
   const filterIndisp = indisps.filter((indisp) =>
      dateIsIn(dateRef, indisp.date_start, indisp.date_end)
   );

   const isValidCEMAL = isoStrLocalToDate(cemal).valueOf() >= dateRef.valueOf();
   const isDesadaptado =
      trip.func.func != "oe" &&
      trip.func.func != "os" &&
      dateRef.valueOf() - isoStrLocalToDate(ultVoo).valueOf() >= 3888000000 &&
      trip.func.oper != "al";
   // 3888000000 = 45 dias

   const btn = (
      <Button
         className={
            "size-10 p-0 font-bold " +
            colorBtn(filterIndisp, isValidCEMAL, isDesadaptado)
         }
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
            />
         }
         placement='right'
      >
         {btn}
      </Popover>
   );
}

function colorBtn(dataIndisp, cemal, dasadaptado) {
   // INDISPONIBILIDADES
   for (let index = 0; index < indispsOptions.length; index++) {
      const option = indispsOptions[index];

      const filterOption = dataIndisp.filter(
         (indisp) => indisp.mtv == option.value
      );

      if (filterOption.length > 0) {
         const indispProps = getIndisp(option.value);
         return indispProps.color.button;
      }
   }
   // INFORMAÇÕES

   if (!cemal) {
      return "bg-purple-600 enabled:hover:bg-purple-800";
   }

   if (dasadaptado) {
      return "bg-slate-600 enabled:hover:bg-slate-800";
   }

   return "bg-emerald-600";
}
