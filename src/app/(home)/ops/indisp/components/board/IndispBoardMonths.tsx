import clsx from "clsx";
import { MonthSegment } from "./utils/indispDays";
import { colWidth, TEXTO_VARREDURA, TRIG_COL } from "./utils/indispBoardLayout";

interface IndispBoardMonthsProps {
   segments: MonthSegment[];
   /** Total de colunas da janela — cada mês ocupa a fração que lhe cabe. */
   total: number;
}

/**
 * Faixa de mês acima da régua.
 *
 * Com a navegação por arrasto os saltos de mês saíram da barra de botões; sem
 * essa faixa, arrastar por semanas deixava de existir referência de onde se
 * está no calendário.
 */
export function IndispBoardMonths({ segments, total }: IndispBoardMonthsProps) {
   return (
      <div className="flex shrink-0 border-b border-slate-200 bg-white">
         <div className={clsx(TRIG_COL, "border-r-2 border-slate-300")} />
         <div className="flex flex-1">
            {segments.map((segment) => (
               <div
                  key={segment.key}
                  style={{ width: colWidth(segment.days, total) }}
                  className={clsx(
                     "overflow-hidden px-2 py-1",
                     !segment.first && "border-l border-slate-200"
                  )}
               >
                  <span
                     className={clsx(
                        "block truncate font-mono font-bold tracking-[0.14em] whitespace-nowrap text-slate-600",
                        TEXTO_VARREDURA
                     )}
                  >
                     {segment.days >= 8 ? segment.label : segment.shortLabel}
                  </span>
               </div>
            ))}
         </div>
      </div>
   );
}
