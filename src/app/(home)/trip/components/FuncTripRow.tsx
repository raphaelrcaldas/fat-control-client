import clsx from "clsx";
import type { CrewFunc } from "../types/trip.types";

type FuncTripRowProps = {
   func: CrewFunc;
};

export function FuncTripRow({ func }: FuncTripRowProps) {
   const oper = func.oper;

   const getOperColor = () => {
      switch (oper) {
         case "al":
            return "text-emerald-700 bg-emerald-100";
         case "op":
            return "text-orange-700 bg-orange-100";
         case "ba":
            return "text-yellow-700 bg-yellow-100";
         case "in":
            return "text-red-700 bg-red-100";
         default:
            return "text-gray-700 bg-gray-100";
      }
   };

   const getOperLabel = () => {
      switch (oper) {
         case "al":
            return "Aluno";
         case "op":
            return "Operacional";
         case "ba":
            return "Básico";
         case "in":
            return "Instrutor";
         default:
            return oper;
      }
   };

   const getFuncLabel = () => {
      switch (func.func) {
         case "pil":
            return "Piloto";
         case "mc":
            return "Mecânico";
         case "lm":
            return "LoadMaster";
         case "tf":
            return "Comissário";
         case "os":
            return "Observador-SAR";
         case "oe":
            return "OE-3";
         default:
            return func.func;
      }
   };

   return (
      <div
         className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow'
         title={`${getFuncLabel()}: ${getOperLabel()}`}
      >
         <span className='text-gray-700'>{func.func}</span>
         <span className='text-gray-400'>•</span>
         <span className={clsx("px-1.5 py-0.5 rounded", getOperColor())}>
            {oper}
         </span>
      </div>
   );
}
