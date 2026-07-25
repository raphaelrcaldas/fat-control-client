"use client";

import clsx from "clsx";
import { formatDateTime } from "utils/dateHandler";
import type {
   ListDiff,
   OrdemHistoricoAction,
   OrdemHistoricoEvent,
   ValueChange,
} from "./utils/ordemHistorico";
import { VALOR_VAZIO } from "./utils/ordemHistoricoLabels";

const ACTION_META: Record<
   OrdemHistoricoAction,
   { label: string; accentClass: string; textClass: string }
> = {
   create: {
      label: "Criada",
      accentClass: "border-l-green-500",
      textClass: "text-green-700",
   },
   update: {
      label: "Alterada",
      accentClass: "border-l-amber-500",
      textClass: "text-amber-700",
   },
   delete: {
      label: "Excluída",
      accentClass: "border-l-red-500",
      textClass: "text-red-700",
   },
};

// "antigo → novo": convenção de diff (vermelho riscado / verde), a mesma do
// histórico de indisponibilidade. Ausência de valor vira "(vazio)" — nunca
// "undefined", já que o backend omite chaves em branco (ex.: doc_ref).
function ValueDelta({
   before,
   after,
}: {
   before: string | null;
   after: string;
}) {
   return (
      <>
         <span className="text-red-600 tabular-nums line-through">
            {before ?? VALOR_VAZIO}
         </span>
         {/* slate-500 (4,76:1) e não slate-400 (2,63:1): a seta é o único
             sinal visual da direção da mudança e precisa cumprir AA */}
         <span aria-hidden className="text-slate-500">
            {" → "}
         </span>
         <span className="sr-only"> para </span>
         <span className="text-green-700 tabular-nums">{after}</span>
      </>
   );
}

function ChangeLine({ change }: { change: ValueChange }) {
   return (
      <li className="text-slate-600">
         <span className="font-medium text-slate-700">{change.label}:</span>{" "}
         <ValueDelta
            before={change.before}
            after={change.after ?? VALOR_VAZIO}
         />
      </li>
   );
}

function ListDiffBlock({ diff }: { diff: ListDiff }) {
   return (
      <div className="space-y-1">
         {/* Legenda de bloco, não estrutura do documento: como <p>, não
             duplica "Etapas"/"Tripulação" (nomes das seções reais da tela)
             no índice de títulos do leitor de tela nem quebra a ordem h2→h4 */}
         <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            {diff.label}
         </p>
         <ul aria-label={diff.label} className="space-y-1">
            {diff.added.map((item) => (
               <li key={`add-${item.key}`} className="text-green-700">
                  <span aria-hidden className="font-mono">
                     +{" "}
                  </span>
                  <span className="sr-only">Adicionado: </span>
                  {item.text}
               </li>
            ))}
            {diff.removed.map((item) => (
               <li key={`rem-${item.key}`} className="text-red-600">
                  <span aria-hidden className="font-mono">
                     −{" "}
                  </span>
                  <span className="sr-only">Removido: </span>
                  {item.text}
               </li>
            ))}
            {diff.changed.map((item) => (
               <li key={`chg-${item.key}`} className="text-slate-600">
                  <span className="font-medium text-slate-700">
                     {item.label}
                  </span>
                  <ul className="space-y-0.5 pl-4">
                     {item.fields.map((field) => (
                        <ChangeLine key={field.field} change={field} />
                     ))}
                  </ul>
               </li>
            ))}
         </ul>
      </div>
   );
}

interface OrdemHistoricoItemProps {
   event: OrdemHistoricoEvent;
   /**
    * Mesmo autor e mesmo minuto do cartão anterior: o cabeçalho vira ruído
    * repetido na tela, mas continua no DOM para leitor de tela — cada cartão
    * precisa se explicar sozinho fora do contexto visual.
    */
   repeatsHeader?: boolean;
}

/** Um evento do histórico de auditoria da OM (criação, alteração ou exclusão). */
export function OrdemHistoricoItem({
   event,
   repeatsHeader = false,
}: OrdemHistoricoItemProps) {
   const meta = ACTION_META[event.action];
   const timestamp = formatDateTime(event.timestamp);

   return (
      <article
         className={clsx(
            "max-w-4xl space-y-2 rounded border border-l-2 border-slate-200 bg-white p-3 text-sm shadow-sm",
            meta.accentClass
         )}
      >
         <header
            className={clsx(
               "flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1",
               repeatsHeader && "sr-only"
            )}
         >
            <div className="flex flex-wrap items-baseline gap-x-2">
               <span
                  className={clsx(
                     "text-xs font-bold tracking-wider uppercase",
                     meta.textClass
                  )}
               >
                  {meta.label}
               </span>
               {event.user && (
                  <span className="text-xs text-slate-600 uppercase">
                     {event.user.p_g} {event.user.nome_guerra}
                  </span>
               )}
            </div>
            {timestamp && (
               <time
                  dateTime={event.timestamp}
                  className="font-mono text-xs text-slate-500"
               >
                  {timestamp}
               </time>
            )}
         </header>

         {event.summary && (
            <div className="space-y-1">
               <p className="font-mono text-slate-700">
                  {event.summary.identificacao}
               </p>
               <p className="text-xs text-slate-500">
                  {event.summary.counts.join(" · ")}
               </p>
            </div>
         )}

         {event.scalars.length > 0 && (
            <ul className="space-y-1">
               {event.scalars.map((change) => (
                  <ChangeLine key={change.field} change={change} />
               ))}
            </ul>
         )}

         {event.lists.map((diff) => (
            <ListDiffBlock key={diff.key} diff={diff} />
         ))}

         {!event.hasDetail && (
            <p className="text-slate-500">
               Registro sem detalhamento de alterações.
            </p>
         )}
      </article>
   );
}
