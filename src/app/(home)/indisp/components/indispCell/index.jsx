import IndispContent from "./components/content";
import { Button, Popover } from "flowbite-react";
import { dateIsIn } from "@/utils/dateHandler";
import { indispsOptions, getIndisp } from "../options";

export default function IndispCell({ dateRef, trip, indisps }) {
   // FILTRA INDISP QUE ESTEJA DENTRO DA DATA REFERENTE
   const filterIndisp = indisps.filter((indisp) =>
      dateIsIn(dateRef, indisp.date_start, indisp.date_end)
   );

   // const isValidCEMAL = isoStrToDate(trip.info.cemal).valueOf() >= dateRef.valueOf();
   // const isDesadaptado = (dateRef.valueOf() - isoStrToDate(trip.info.ult_voo).valueOf()) >= 3888000000;
   // 3888000000 = 45 dias

   return (
      <Popover
         content={
            <IndispContent
               trip={trip}
               filterIndisp={filterIndisp}
               dateRef={dateRef}
            />
         }
         placement='right'
      >
         <Button className={"h-10 w-10 " + colorBtn(filterIndisp)}>{""}</Button>
      </Popover>
   );
}

function colorBtn(dataIndisp, cemal, dasadaptado) {
   let colorBtn = "bg-green-500";

   // INDISPONIBILIDADES
   for (let index = 0; index < indispsOptions.length; index++) {
      const option = indispsOptions[index];

      const filterOption = dataIndisp.filter(
         (indisp) => indisp.mtv == option.value
      );

      if (filterOption.length > 0) {
         const indispProps = getIndisp(option.value);
         colorBtn = indispProps.color.button;
         break;
      }
   }

   // INFORMAÇÕES

   // if (!cemal) {
   //     return 'purple';
   // }

   // if (dasadaptado) {
   //     return 'dark';
   // }

   return colorBtn;
}
