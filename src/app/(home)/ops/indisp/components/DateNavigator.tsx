"use client";

import { Button, Tooltip } from "flowbite-react";
import {
   HiChevronLeft,
   HiChevronRight,
   HiChevronDoubleLeft,
   HiChevronDoubleRight,
} from "react-icons/hi";

interface DateNavigatorProps {
   onShift: (days: number, months: number) => void;
   onToday: () => void;
   canBack?: boolean;
   canForward?: boolean;
}

const navBtn =
   "inline-flex items-center justify-center rounded p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-600 pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px]";

export function DateNavigator({
   onShift,
   onToday,
   canBack = true,
   canForward = true,
}: DateNavigatorProps) {
   return (
      <div className="flex flex-col items-center gap-2">
         <div className="flex flex-row items-center gap-1 rounded border border-slate-200 bg-white p-1 shadow-sm">
            <Tooltip content="Mês anterior">
               <button
                  onClick={() => onShift(0, -1)}
                  disabled={!canBack}
                  className={navBtn}
                  aria-label="Mês anterior"
               >
                  <HiChevronDoubleLeft className="text-lg" />
               </button>
            </Tooltip>
            <Tooltip content="Dia anterior">
               <button
                  onClick={() => onShift(-1, 0)}
                  disabled={!canBack}
                  className={navBtn}
                  aria-label="Dia anterior"
               >
                  <HiChevronLeft className="text-lg" />
               </button>
            </Tooltip>

            <Button
               color="primary"
               size="sm"
               onClick={onToday}
               className="mx-1 font-medium"
               aria-label="Ir para hoje"
            >
               Hoje
            </Button>

            <Tooltip content="Próximo dia">
               <button
                  onClick={() => onShift(1, 0)}
                  disabled={!canForward}
                  className={navBtn}
                  aria-label="Próximo dia"
               >
                  <HiChevronRight className="text-lg" />
               </button>
            </Tooltip>
            <Tooltip content="Próximo mês">
               <button
                  onClick={() => onShift(0, 1)}
                  disabled={!canForward}
                  className={navBtn}
                  aria-label="Próximo mês"
               >
                  <HiChevronDoubleRight className="text-lg" />
               </button>
            </Tooltip>
         </div>
      </div>
   );
}
