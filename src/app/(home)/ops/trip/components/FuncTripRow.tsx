import clsx from "clsx";
import {
   getFuncLabel as getFuncLabelFromConfig,
   getOperLabel as getOperLabelFromConfig,
   getOperColorClasses,
} from "@/constants/tripulantes";
import type { CrewFunc } from "../types/trip.types";

type FuncTripRowProps = {
   func: CrewFunc;
};

export function FuncTripRow({ func }: FuncTripRowProps) {
   const oper = func.oper;

   return (
      <div
         className="inline-flex w-24 items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold shadow-sm"
         title={`${getFuncLabelFromConfig(func.func, true)}: ${getOperLabelFromConfig(oper)}`}
      >
         <span className="text-slate-700">{func.func}</span>
         <span className="text-slate-400">•</span>
         <span
            className={clsx("rounded px-1.5 py-0.5", getOperColorClasses(oper))}
         >
            {oper}
         </span>
      </div>
   );
}
