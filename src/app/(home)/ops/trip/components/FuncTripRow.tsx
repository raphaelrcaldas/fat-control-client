import clsx from "clsx";
import {
   getFuncLabel as getFuncLabelFromConfig,
   getOperLabel as getOperLabelFromConfig,
   type OperType,
} from "@/constants/tripulantes";
import type { CrewFunc } from "../types/trip.types";

/** Mapeia cores do tema para classes Tailwind */
const OPER_COLOR_CLASSES: Record<OperType, string> = {
   al: "text-cyan-700 bg-cyan-100",
   op: "text-emerald-700 bg-emerald-100",
   ba: "text-amber-700 bg-amber-100",
   in: "text-red-700 bg-red-100",
};

type FuncTripRowProps = {
   func: CrewFunc;
};

export function FuncTripRow({ func }: FuncTripRowProps) {
   const oper = func.oper;

   const getOperColor = () => {
      return OPER_COLOR_CLASSES[oper] ?? "text-gray-700 bg-gray-100";
   };

   return (
      <div
         className="inline-flex w-24 items-center justify-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold shadow-sm transition-shadow hover:shadow-md"
         title={`${getFuncLabelFromConfig(func.func, true)}: ${getOperLabelFromConfig(oper)}`}
      >
         <span className="text-gray-700">{func.func}</span>
         <span className="text-gray-400">•</span>
         <span className={clsx("rounded px-1.5 py-0.5", getOperColor())}>
            {oper}
         </span>
      </div>
   );
}
