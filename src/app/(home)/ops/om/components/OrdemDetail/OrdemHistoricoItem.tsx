"use client";

import { AuditTimelineItem } from "@/components/audit/AuditTimelineItem";
import { AuditValueDelta } from "@/components/audit/AuditValueDelta";
import type {
   ListDiff,
   OrdemHistoricoAction,
   OrdemHistoricoEvent,
   ValueChange,
} from "./utils/ordemHistorico";
import { VALOR_VAZIO } from "./utils/ordemHistoricoLabels";

/**
 * O verbo é feminino aqui (a Ordem de Missão), masculino no histórico do
 * indisp (o registro) — por isso o rótulo não vem do módulo compartilhado.
 * A COR vem, porque o sinal tem de ser o mesmo nas duas trilhas.
 */
const ACTION_LABEL: Record<OrdemHistoricoAction, string> = {
   create: "Criada",
   update: "Alterada",
   delete: "Excluída",
};

function ChangeLine({ change }: { change: ValueChange }) {
   return (
      <li className="text-slate-600">
         <span className="font-medium text-slate-700">{change.label}:</span>{" "}
         <AuditValueDelta
            before={change.before}
            after={change.after ?? VALOR_VAZIO}
            vazio={VALOR_VAZIO}
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
   return (
      <AuditTimelineItem
         tone={event.action}
         label={ACTION_LABEL[event.action]}
         timestamp={event.timestamp}
         user={event.user}
         repeatsHeader={repeatsHeader}
      >
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
      </AuditTimelineItem>
   );
}
