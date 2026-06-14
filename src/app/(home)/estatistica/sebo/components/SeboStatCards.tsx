import clsx from "clsx";
import type { SeboStats } from "../types";

interface SeboStatCardsProps {
   stats: SeboStats;
}

const CARDS: {
   label: string;
   key: "min" | "media" | "max";
   accent?: boolean;
}[] = [
   { label: "Mínimo", key: "min" },
   { label: "Média", key: "media", accent: true },
   { label: "Máximo", key: "max" },
];

/** Trio de estatísticas (mín/média/máx) das horas de voo, data-driven e sóbrio. */
export function SeboStatCards({ stats }: SeboStatCardsProps) {
   return (
      <div className="grid grid-cols-3 gap-3">
         {CARDS.map((c) => (
            <div
               key={c.key}
               className="rounded border border-slate-200 bg-white p-3 shadow-sm"
            >
               <div className="font-mono text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">
                  {c.label}
               </div>
               <div
                  className={clsx(
                     "text-lg font-bold tabular-nums",
                     c.accent ? "text-red-600" : "text-slate-900"
                  )}
               >
                  {stats[c.key]}
               </div>
            </div>
         ))}
      </div>
   );
}
