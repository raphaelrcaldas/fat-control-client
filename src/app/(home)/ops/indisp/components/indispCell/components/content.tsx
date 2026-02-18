import { useState } from "react";
import { isoDateToString } from "utils/dateHandler";
import { getIndisp } from "../../options";
import { IndispForm } from "../../indispForm";

export default function IndispContent({
   dateRef,
   trip,
   filterIndisp,
   isDesadaptado,
   isValidCEMAL,
}) {
   const [selectedIndisp, setSelectedIndisp] = useState(null);
   const [openIndispForm, setOpenIndispForm] = useState(false);

   const handleIndispClick = (indisp) => {
      setSelectedIndisp(indisp);
      setOpenIndispForm(true);
   };
   const diaSemana = dateRef.toLocaleDateString("pt-BR", { weekday: "long" });
   const dataFormatada = isoDateToString(dateRef);

   return (
      <div className="w-72 text-sm">
         <div className="border-b border-gray-200 bg-linear-to-r from-gray-50 to-gray-100 px-4 py-3">
            <h3 className="text-center text-base font-bold text-gray-900 uppercase">
               {`${trip.user.posto.short} ${trip.user.nome_guerra}`}
            </h3>
         </div>

         <div className="border-b border-gray-200 bg-gray-50 px-3 py-2">
            <p className="text-center font-medium text-gray-700 capitalize">
               {diaSemana}
            </p>
            <p className="text-center font-semibold text-gray-900">
               {dataFormatada}
            </p>
         </div>

         <div className="max-h-80 overflow-y-auto">
            {filterIndisp.length > 0 ? (
               <div className="space-y-2 p-2">
                  {filterIndisp.map((indisp, index) => (
                     <IndispBody
                        key={index}
                        indisp={indisp}
                        onClick={() => handleIndispClick(indisp)}
                     />
                  ))}
               </div>
            ) : (
               <div className="p-4 text-center">
                  <p className="text-gray-500">Sem indisponibilidades</p>
               </div>
            )}

            {!isValidCEMAL && (
               <div className="m-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                  <p className="text-center text-xs font-bold text-red-700 uppercase">
                     ⚠️ CEMAL INVÁLIDO
                  </p>
               </div>
            )}

            {isDesadaptado && (
               <div className="m-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2">
                  <p className="text-center text-xs font-bold text-orange-700 uppercase">
                     ⚠️ DESADAPTADO
                  </p>
               </div>
            )}
         </div>

         {selectedIndisp && (
            <IndispForm
               open={openIndispForm}
               setOpen={setOpenIndispForm}
               trip={trip}
               indisp={selectedIndisp}
            />
         )}
      </div>
   );
}

function IndispBody({ indisp, onClick }) {
   const indispProps = getIndisp(indisp.mtv);
   const dateStart = isoDateToString(indisp.date_start);
   const dateEnd = isoDateToString(indisp.date_end);
   const createdAt = new Date(indisp.created_at).toLocaleString("pt-br", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
   });
   const bgColor = indispProps.color.bg;
   const resp = indisp.user_created;

   return (
      <div
         className={`relative flex flex-col gap-2 rounded-lg border px-3 py-3 shadow-sm ${bgColor} cursor-pointer border-gray-300 transition-all hover:shadow-md`}
         onClick={onClick}
      >
         <span className="absolute top-1 left-2 text-xs text-gray-500">
            ID: {indisp.id}
         </span>

         <div className="flex items-center justify-center">
            <span className="text-center text-sm font-bold text-gray-900 uppercase">
               {indispProps.label}
            </span>
         </div>

         <div className="text-center">
            <p className="text-xs font-semibold text-gray-800">
               {dateStart} <span className="text-gray-600">até</span> {dateEnd}
            </p>
         </div>

         {indisp.obs && (
            <div className="mt-1 rounded px-2 py-1.5">
               <p className="leading-relaxed whitespace-pre-line text-gray-700">
                  {indisp.obs}
               </p>
            </div>
         )}

         <div className="mt-1 flex gap-1 border-t border-gray-400/30 pt-2">
            <p className="text-xs text-gray-600 uppercase">{createdAt}</p>
            <p className="text-xs font-medium text-gray-700 uppercase">
               {resp.posto.short} {resp.nome_guerra}
            </p>
         </div>
      </div>
   );
}
