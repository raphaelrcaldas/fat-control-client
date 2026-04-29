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
         className="w-full rounded-lg border border-l-[3px] border-gray-200 border-l-red-600 bg-white text-left transition-all duration-150 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm"
      >
         <div className="flex items-center gap-4 px-4 py-2.5">
            <div className="w-10 shrink-0 text-left font-mono">
               <span className="text-sm leading-none font-bold text-gray-800">
                  {day}
               </span>
               <span className="ml-1 text-xs font-medium text-red-500">
                  {month}
               </span>
            </div>

            <div className="h-6 w-px shrink-0 bg-gray-200" />

            <div className="flex items-center gap-1 font-mono">
               <span className="text-sm font-bold text-gray-900">
                  {etapa.origem}
               </span>
               <span className="mx-1 text-xs text-red-400">&rarr;</span>
               <span className="text-sm font-bold text-gray-900">
                  {etapa.destino}
               </span>
            </div>

            <div className="flex flex-1 items-center gap-5 font-mono">
               <div className="text-right">
                  <span className="text-xs font-semibold text-gray-700">
                     {formatTime(etapa.dep)}
                  </span>
               </div>
               <div className="text-right">
                  <span className="text-xs font-semibold text-gray-700">
                     {formatTime(etapa.arr)}
                  </span>
               </div>
            </div>

            <div className="h-6 w-px shrink-0 bg-gray-200" />

            <div className="w-12 shrink-0 text-right font-mono">
               <span className="text-sm font-bold text-gray-800">
                  {minutesToTime(etapa.tvoo)}
               </span>
               <p className="text-[10px] font-medium tracking-wide text-gray-400 uppercase">
                  T.Voo
               </p>
            </div>
         </div>
      </button>
   );
}
