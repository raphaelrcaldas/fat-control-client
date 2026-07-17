import { FaPlaneDeparture, FaPlaneArrival, FaClock } from "react-icons/fa";
import { minutesToTime, formatTime } from "@/../utils/dateHandler";

interface RouteVisualizationProps {
   origem: string;
   destino: string;
   dep: string;
   arr: string;
   tvoo: number;
}

export function RouteVisualization({
   origem,
   destino,
   dep,
   arr,
   tvoo,
}: RouteVisualizationProps) {
   return (
      <div className="text-primary-900 flex items-center gap-3">
         <div className="text-center">
            <p className="text-2xl font-black tracking-wider uppercase sm:text-3xl">
               {origem}
            </p>
            <div className="mt-1 flex items-center justify-center gap-1.5">
               <FaPlaneDeparture className="size-4" />
               <span className="font-mono font-semibold">
                  {formatTime(dep)}Z
               </span>
            </div>
         </div>

         <div className="flex flex-1 flex-col items-center gap-1">
            <div className="relative flex w-full items-center">
               <div className="border-primary-300 h-px flex-1 border-t border-dashed" />
               <div className="ring-primary-200 mx-1 flex items-center justify-center gap-2 rounded bg-white px-3 py-1.5 font-semibold shadow-sm ring-1">
                  <FaClock /> {minutesToTime(tvoo)}
               </div>
               <div className="border-primary-300 h-px flex-1 border-t border-dashed" />
            </div>
         </div>

         <div className="text-center">
            <p className="text-2xl font-black tracking-wider uppercase sm:text-3xl">
               {destino}
            </p>
            <div className="mt-1 flex items-center justify-center gap-1.5">
               <FaPlaneArrival className="size-4" />
               <span className="font-mono font-semibold">
                  {formatTime(arr)}Z
               </span>
            </div>
         </div>
      </div>
   );
}
