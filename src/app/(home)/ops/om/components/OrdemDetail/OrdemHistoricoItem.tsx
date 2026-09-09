"use client";

import clsx from "clsx";
import {
   TimelineBody,
   TimelineContent,
   TimelineItem,
   TimelinePoint,
   TimelineTime,
   TimelineTitle,
} from "flowbite-react";
import { formatDateTime } from "utils/dateHandler";
import { PONTO_POR_ACAO, pontoTheme } from "@/components/audit/timelineTheme";
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

/**
 * Soma de caracteres (antigo + novo) a partir da qual o par vira bloco
 * empilhado em vez de "antigo → novo" em linha. Calibrado na medida de
 * leitura real: acima disso o par já não cabe em duas linhas.
 */
const LIMIAR_TEXTO_LONGO = 120;

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
   const antes = before ?? VALOR_VAZIO;

   /**
    * Ordem especial é campo de texto livre e chega com parágrafos inteiros.
    * Em linha, o valor ANTIGO — riscado, vermelho, caixa alta — ocupava
    * quatro linhas de ponta a ponta e enterrava o valor novo, que é o que
    * interessa: o evento passava a gritar o que deixou de valer.
    *
    * Acima do limiar os dois valores viram blocos empilhados e cada um é
    * cortado em três linhas, com o texto inteiro no `title`. O diff continua
    * completo para quem precisar; o que sai da tela é a repetição.
    */
   const longo = antes.length + after.length > LIMIAR_TEXTO_LONGO;

   if (longo) {
      return (
         <span className="mt-0.5 block space-y-0.5">
            <span
               title={antes}
               className="line-clamp-3 text-red-600 line-through"
            >
               {antes}
            </span>
            <span className="sr-only"> para </span>
            <span title={after} className="line-clamp-3 text-green-700">
               {after}
            </span>
         </span>
      );
   }

   return (
      <>
         <span className="text-red-600 tabular-nums line-through">{antes}</span>
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
   const label = ACTION_LABEL[event.action];
   const timestamp = formatDateTime(event.timestamp);
   const autor = event.user
      ? `${event.user.p_g} ${event.user.nome_guerra}`
      : "Sistema";
   const titulo = `${label} · ${autor}`;

   return (
      <TimelineItem>
         <TimelinePoint theme={pontoTheme(PONTO_POR_ACAO[event.action])} />
         <TimelineContent>
            {/* Carimbo e autoria continuam no DOM quando repetem: some da
                tela o ruído, não a informação — cada evento precisa se
                explicar sozinho para quem lê por leitor de tela. */}
            <div className={clsx(repeatsHeader && "sr-only")}>
               {/* O TimelineTime já É um <time>; só falta o dateTime. */}
               {timestamp && (
                  <TimelineTime dateTime={event.timestamp}>
                     {timestamp}
                  </TimelineTime>
               )}
               {/* Truncado com `title`: nome de guerra longo quebrava o
                   cabeçalho em duas linhas e desalinhava a coluna de pontos. */}
               <TimelineTitle className="truncate uppercase" title={titulo}>
                  {titulo}
               </TimelineTitle>
            </div>

            {/* `max-w-4xl` era do cartão que a Timeline substituiu; sem ele o
                diff atravessava os 950px do container e a linha ficava longa
                demais para o olho voltar ao começo. */}
            <TimelineBody className="max-w-4xl space-y-2">
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
            </TimelineBody>
         </TimelineContent>
      </TimelineItem>
   );
}
