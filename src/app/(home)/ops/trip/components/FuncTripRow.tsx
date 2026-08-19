import clsx from "clsx";
import {
   getOperLabel as getOperLabelFromConfig,
   getOperColorClasses,
} from "@/constants/tripulantes";
import { useFuncoes } from "@/hooks/queries";
import type { FuncType, OperType } from "../types/trip.types";

type FuncTripRowProps = {
   func: FuncType;
   oper: OperType;
};

export function FuncTripRow({ func, oper }: FuncTripRowProps) {
   const { labelShort } = useFuncoes();

   return (
      <div
         className="inline-flex w-24 items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold shadow-sm"
         title={`${labelShort(func)}: ${getOperLabelFromConfig(oper)}`}
      >
         <span className="text-slate-700">{func}</span>
         <span className="text-slate-400">•</span>
         <span
            className={clsx("rounded px-1.5 py-0.5", getOperColorClasses(oper))}
         >
            {oper}
         </span>
      </div>
   );
}
