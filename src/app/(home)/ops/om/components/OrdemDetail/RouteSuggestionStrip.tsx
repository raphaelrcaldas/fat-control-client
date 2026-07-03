import { Spinner } from "flowbite-react";
import { HiLightningBolt } from "react-icons/hi";
import clsx from "clsx";
import type { RouteSuggestion } from "services/routes/om/ordens";
import { minutesToTime } from "utils/dateHandler";
import type { SuggestionType } from "./hooks/useRouteSuggestionAutofill";

function SuggestionChip({
   tone,
   label,
   value,
}: {
   tone: "emerald" | "amber";
   label: string;
   value: string;
}) {
   return (
      <span
         className={clsx(
            "rounded-full px-2 py-0.5 text-[11px] ring-1",
            tone === "emerald"
               ? "bg-emerald-50 text-emerald-700 ring-emerald-200/70"
               : "bg-amber-50 text-amber-700 ring-amber-200/70"
         )}
      >
         {label}: <span className="font-mono font-semibold">{value}</span>
      </span>
   );
}

interface RouteSuggestionStripProps {
   isLoading: boolean;
   suggestionType: SuggestionType;
   suggestion: RouteSuggestion | null | undefined;
}

// Faixa de sugestão de rota do EtapaModal: loading, sugestão completa
// (rota já voada), parcial (só dados do destino) ou vazio
export function RouteSuggestionStrip({
   isLoading,
   suggestionType,
   suggestion,
}: RouteSuggestionStripProps) {
   return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-slate-100 bg-slate-50/70 px-4 py-2.5">
         {isLoading ? (
            <>
               <Spinner size="sm" color="info" />
               <span className="text-xs text-slate-500">
                  Buscando dados da rota...
               </span>
            </>
         ) : suggestionType === "full" && suggestion ? (
            <>
               <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                  <HiLightningBolt className="h-3.5 w-3.5" />
                  Sugestão aplicada — rota já voada
               </span>
               {suggestion.alternativa && (
                  <SuggestionChip
                     tone="emerald"
                     label="Alt"
                     value={suggestion.alternativa}
                  />
               )}
               {suggestion.tvoo_alt != null && (
                  <SuggestionChip
                     tone="emerald"
                     label="Tvoo Alt"
                     value={minutesToTime(suggestion.tvoo_alt)}
                  />
               )}
               {suggestion.qtd_comb != null && (
                  <SuggestionChip
                     tone="emerald"
                     label="Combustível"
                     value={`${suggestion.qtd_comb.toLocaleString("pt-BR")}T`}
                  />
               )}
               {suggestion.tvoo_etp != null && suggestion.tvoo_etp > 0 && (
                  <SuggestionChip
                     tone="emerald"
                     label="T. voo da rota"
                     value={minutesToTime(suggestion.tvoo_etp)}
                  />
               )}
            </>
         ) : suggestionType === "partial" && suggestion ? (
            <>
               <span className="flex items-center gap-1.5 text-xs font-medium text-amber-700">
                  <HiLightningBolt className="h-3.5 w-3.5" />
                  Sugestão parcial — dados do destino
               </span>
               {suggestion.alternativa && (
                  <SuggestionChip
                     tone="amber"
                     label="Alt"
                     value={suggestion.alternativa}
                  />
               )}
               {suggestion.tvoo_alt != null && (
                  <SuggestionChip
                     tone="amber"
                     label="Tvoo Alt"
                     value={minutesToTime(suggestion.tvoo_alt)}
                  />
               )}
            </>
         ) : (
            <span className="text-xs text-slate-400">
               Nenhuma sugestão para esta rota
            </span>
         )}
      </div>
   );
}
