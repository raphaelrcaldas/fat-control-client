import { useEffect, useState } from "react";
import { isoStrToDate } from "utils/dateHandler";
import { getIndisp } from "./options";
import { IndispForm } from "./indispForm";

export function LastIndisps({ indisps, update }) {
   const [lastIndisps, setLastIndisp] = useState([]);
   const [selectedIndisp, setSelectedIndisp] = useState(null);
   const [openIndispForm, setOpenIndispForm] = useState(false);

   useEffect(() => {
      const oIndis = indisps
         .flatMap((item) =>
            item.indisps.map((idp) => ({
               ...idp,
               trig: item.trip.trig,
               trip: item.trip,
               // Prioridade: deleted_at > updated_at > created_at
               lastChange: idp.deleted_at || idp.updated_at || idp.created_at,
               wasModified: !!idp.updated_at,
               isDeleted: !!idp.deleted_at,
            }))
         )
         .sort(
            (a, b) =>
               new Date(b.lastChange).getTime() -
               new Date(a.lastChange).getTime()
         );
      setLastIndisp(oIndis);
   }, [indisps]);

   const handleIndispClick = (idp) => {
      setSelectedIndisp(idp);
      setOpenIndispForm(true);
   };

   return (
      <div className="h-fit w-fit rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
         <h3 className="mb-3 border-b border-gray-200 pb-2 text-center text-base font-bold whitespace-nowrap text-gray-900">
            Últimas Atualizações
         </h3>

         <div className="flex flex-col gap-0.5">
            {lastIndisps.slice(0, 15).map((idp, idx) => {
               const dateIni = isoStrToDate(idp.date_start).toLocaleDateString(
                  "pt-br",
                  {
                     day: "2-digit",
                     month: "2-digit",
                  }
               );
               const dateEnd = isoStrToDate(idp.date_end).toLocaleDateString(
                  "pt-br",
                  {
                     day: "2-digit",
                     month: "2-digit",
                  }
               );
               const lastChangeDate = new Date(
                  idp.lastChange
               ).toLocaleDateString("pt-br", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
               });

               const indispTheme = getIndisp(idp.mtv);

               return (
                  <div
                     className={`flex cursor-pointer items-center gap-2 rounded border-b border-gray-100 px-2 py-1 text-xs uppercase transition-colors select-none last:border-b-0 ${
                        idp.isDeleted
                           ? "bg-red-100 opacity-70"
                           : "hover:bg-blue-50"
                     }`}
                     key={idp.id || `${idp.trig}-${idp.created_at}-${idx}`}
                     onClick={() => handleIndispClick(idp)}
                  >
                     <span
                        className={`w-10 shrink-0 text-center font-bold ${
                           idp.isDeleted
                              ? "text-gray-500 line-through"
                              : "text-gray-900"
                        }`}
                     >
                        {idp.trig}
                     </span>
                     <span
                        className={`w-12 shrink-0 rounded border border-gray-300 px-2 py-0.5 text-center text-xs font-semibold ${
                           idp.isDeleted
                              ? "bg-gray-200 line-through"
                              : indispTheme.color.bg
                        }`}
                     >
                        {idp.mtv}
                     </span>
                     <span
                        className={`w-24 shrink-0 text-center text-xs font-medium whitespace-nowrap ${
                           idp.isDeleted
                              ? "text-gray-500 line-through"
                              : "text-gray-700"
                        }`}
                     >
                        {dateIni}{" "}
                        <span className="text-gray-500 lowercase">a</span>{" "}
                        {dateEnd}
                     </span>
                     <span className="w-24 shrink-0 text-center text-xs whitespace-nowrap text-gray-500">
                        {idp.isDeleted && <span title="Deletado">🗑️</span>}
                        {!idp.isDeleted && idp.wasModified && (
                           <span title="Modificado">✏️</span>
                        )}{" "}
                        {lastChangeDate}
                     </span>
                  </div>
               );
            })}
         </div>

         {selectedIndisp && (
            <IndispForm
               open={openIndispForm}
               setOpen={setOpenIndispForm}
               trip={selectedIndisp.trip}
               update={update}
               indisp={selectedIndisp}
               readOnly={selectedIndisp.isDeleted}
            />
         )}
      </div>
   );
}
