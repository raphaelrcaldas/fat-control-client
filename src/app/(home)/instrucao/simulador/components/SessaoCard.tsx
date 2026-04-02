import type { EtapaItem } from "services/routes/estatistica/etapas";
import { minutesToTime, formatTime } from "@/../utils/dateHandler";

const MONTHS = [
   "JAN",
   "FEV",
   "MAR",
   "ABR",
   "MAI",
   "JUN",
   "JUL",
   "AGO",
   "SET",
   "OUT",
   "NOV",
   "DEZ",
];

interface SessaoCardProps {
   etapa: EtapaItem;
   onClick: (etapa: EtapaItem) => void;
}

export default function SessaoCard({ etapa, onClick }: SessaoCardProps) {
   const date = new Date(etapa.data + "T12:00:00");
   const day = String(date.getDate()).padStart(2, "0");
   const month = MONTHS[date.getMonth()];

   return (
      <button
         type="button"
         onClick={() => onClick(etapa)}
         className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-red-300 transition-shadow hover:shadow"
      >
         <div className="flex w-full items-stretch gap-0">
            <div className="flex w-14 shrink-0 flex-col items-center justify-center bg-red-600 py-3">
               <span className="font-mono text-2xl leading-none font-bold text-white">
                  {day}
               </span>
               <span className="font-mono text-xs font-medium text-red-200">
                  {month}
               </span>
            </div>

            <div className="flex flex-1 items-center gap-4 px-4 py-3">
               <div className="flex flex-1 flex-col gap-0.5 font-mono">
                  <span className="text-sm font-bold text-gray-900">
                     {etapa.origem} &rarr; {etapa.destino}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                     <span>
                        DEP {formatTime(etapa.dep)} | ARR{" "}
                        {formatTime(etapa.arr)}
                     </span>
                  </div>
               </div>

               <div className="text-right">
                  <span className="font-mono text-sm font-bold text-slate-600">
                     {minutesToTime(etapa.tvoo)}
                  </span>
                  <p className="text-xs text-gray-400">T.Voo</p>
               </div>
            </div>
         </div>
      </button>
   );
}
