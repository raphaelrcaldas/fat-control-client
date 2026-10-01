import clsx from "clsx";
import { minutesToTime } from "@/../utils/dateHandler";
import { MONTH_LABELS } from "../constants";
import { formatSignedMinutes, getDescricaoTone } from "../utils";

interface DivergenciaPopoverContentProps {
   descricao: string;
   mes: number;
   sagem: number;
   voado: number;
}

/**
 * Corpo do popover aberto sobre a célula localizada na tabela principal.
 * Define a própria cor/alinhamento e volta para `font-sans` porque o Popover
 * do Flowbite é renderizado dentro da `<td>` e herdaria o estilo dela (mono,
 * centralizado, cinza claro nas células zeradas). Só os valores (`dd`) voltam
 * para mono.
 */
export function DivergenciaPopoverContent({
   descricao,
   mes,
   sagem,
   voado,
}: DivergenciaPopoverContentProps) {
   const diff = voado - sagem;
   const tone = getDescricaoTone(descricao);

   return (
      <div className="w-max min-w-56 p-3 text-left font-sans text-sm font-normal text-slate-700">
         <div className="flex min-w-0 items-center gap-2">
            <span
               aria-hidden
               className={clsx("h-2.5 w-2.5 shrink-0 rounded-full", tone.dot)}
            />
            <p
               className={clsx(
                  "min-w-0 font-semibold whitespace-nowrap",
                  tone.text
               )}
            >
               {descricao}
            </p>
         </div>
         <p className="mb-2 text-xs text-slate-500">{MONTH_LABELS[mes]}</p>
         <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1">
            <dt>SAGEM</dt>
            <dd className="text-right font-mono">{minutesToTime(sagem)}</dd>
            <dt>FATCONTROL</dt>
            <dd className="text-right font-mono">{minutesToTime(voado)}</dd>
            <dt className="font-medium">Diferença</dt>
            <dd
               className={clsx("text-right font-mono font-semibold", {
                  "text-green-700": diff > 0,
                  "text-red-600": diff < 0,
               })}
            >
               {formatSignedMinutes(diff)}
            </dd>
         </dl>
      </div>
   );
}
