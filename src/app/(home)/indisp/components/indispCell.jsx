import { Button, Popover } from "flowbite-react";
import { dateIsIn, isoDateToString, isoStrToDate } from "@/utils/dateHandler";
import { indispsOptions, getIndisp } from "./options";

function colorBtn(dataIndisp, cemal, dasadaptado) {
   let colorBtn = "success";

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

export function IndispCell({ dateRef, trip, indisps }) {
   // FILTRA INDISP QUE ESTEJA DENTRO DA DATA REFERENTE
   const filterIndisp = indisps.filter((indisp) =>
      dateIsIn(dateRef, indisp.date_start, indisp.date_end)
   );

   const isDisp = filterIndisp.length == 0;
   // const isValidCEMAL = isoStrToDate(trip.info.cemal).valueOf() >= dateRef.valueOf();
   // const isDesadaptado = (dateRef.valueOf() - isoStrToDate(trip.info.ult_voo).valueOf()) >= 3888000000;
   // 3888000000 = 45 dias

   const btnIndisp = (
      <Button fullSized color={colorBtn(filterIndisp)} className='h-10'>
         {""}
      </Button>
   );

   if (isDisp) {
      return btnIndisp;
   }

   const popoverContent = (
      <div className='w-64 text-sm text-gray-500'>
         <div className='border-b border-gray-200 bg-gray-100 px-3 py-2'>
            <h3 className='text-center font-semibold uppercase text-gray-900'>
               {`${trip.user.posto.short} ${trip.user.nome_guerra}`}
            </h3>
         </div>
         <h3 className='m-2 font-semibold text-center'>
            {isoDateToString(dateRef)}
         </h3>
         {filterIndisp.map((indisp, index) => {
            const indispProps = getIndisp(indisp.mtv);
            const dateStart = isoDateToString(indisp.date_start);
            const dateEnd = isoDateToString(indisp.date_end);
            const createdAt = new Date(indisp.created_at).toLocaleString();
            const bgColor = indispProps.color.bg;

            return (
               <div
                  key={index}
                  className={`flex flex-col gap-2 m-2 px-3 py-2 rounded-lg ${bgColor}`}
               >
                  <p>ID: {indisp.id}</p>
                  <p className='uppercase font-semibold'>{indispProps.label}</p>
                  <p>{`${dateStart} a ${dateEnd}`}</p>
                  <p>{indisp.obs}</p>
                  <div>
                     <p>Criado em:</p>
                     <p>{createdAt}</p>
                  </div>
               </div>
            );
         })}

         {/* {
                !isValidCEMAL && (
                    <div className="bg-gray-100 m-2 px-3 py-2 rounded-lg">
                        <p className="uppercase text-red-600 font-semibold">CEMAL INVÁLIDO</p>
                    </div>
                )
            }

            {
                isDesadaptado && (
                    <div className="bg-gray-100 m-2 px-3 py-2 rounded-lg">
                        <p className="uppercase text-orange-500 font-semibold">DESADAPTADO</p>
                    </div>
                )
            } */}
      </div>
   );

   return (
      <Popover content={popoverContent} placement='right'>
         {btnIndisp}
      </Popover>
   );
}
