"use client";

import type { ComponentProps, FC, ReactNode } from "react";
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
import { PONTO_POR_ACAO, pontoTheme } from "./timelineTheme";

export type AuditTone = keyof typeof PONTO_POR_ACAO;

export interface AuditTimelineItemProps {
   /** Tom do evento: define a cor da bolinha (nasce, muda, morre). */
   tone: AuditTone;
   /**
    * O que aconteceu, já no gênero e no vocabulário do domínio — "Criada"
    * (a OM), "Criado" (o registro), "Cartão cadastrado". Por isso o rótulo
    * vem de fora: só a COR é compartilhada entre as trilhas.
    */
   label: string;
   /** ISO do evento; item sem data válida não é renderizado. */
   timestamp: string | null | undefined;
   user?: { p_g: string; nome_guerra: string } | null;
   /**
    * Ícone opcional ao lado do rótulo. Fica no título, e não na bolinha:
    * o marcador com ícone do Flowbite mede 24px mais um anel de 8px, o que
    * numa trilha de vinte eventos engorda a lista sem dizer nada que o
    * rótulo já não diga.
    */
   icon?: FC<ComponentProps<"svg">>;
   /**
    * Mesmo autor e mesmo minuto do evento anterior: o cabeçalho sai da tela
    * mas fica no DOM — cada evento precisa se explicar sozinho para quem lê
    * por leitor de tela.
    */
   repeatsHeader?: boolean;
   /** O diff do domínio: cada trilha monta o seu. */
   children?: ReactNode;
}

/**
 * Um evento de uma trilha de auditoria. É a casca comum das quatro trilhas do
 * sistema (indisponibilidade, OM, comissionamento, missão e cartão de saúde):
 * bolinha colorida pelo tom, carimbo, "ação · autor" e o corpo do diff.
 *
 * Existe porque as cinco superfícies tinham a mesma casca copiada, e as cópias
 * já haviam divergido: comissionamento pintava toda ação de cinza, missão
 * pintava toda ação de vermelho — nenhuma distinguia criação de alteração, e o
 * vermelho fixo ainda brigava com a regra de reservar `red-*` a perigo.
 */
export function AuditTimelineItem({
   tone,
   label,
   timestamp,
   user,
   icon: Icon,
   repeatsHeader = false,
   children,
}: AuditTimelineItemProps) {
   const formatado = formatDateTime(timestamp);
   if (!formatado) return null;

   const autor = user ? `${user.p_g} ${user.nome_guerra}` : "Sistema";
   const titulo = `${label} · ${autor}`;

   return (
      <TimelineItem>
         <TimelinePoint theme={pontoTheme(PONTO_POR_ACAO[tone])} />
         <TimelineContent>
            <div className={clsx(repeatsHeader && "sr-only")}>
               <TimelineTime dateTime={timestamp ?? undefined}>
                  {formatado}
               </TimelineTime>
               {/* Truncado com `title`: nome de guerra longo quebrava o
                   cabeçalho em duas linhas e desalinhava a coluna de pontos. */}
               <TimelineTitle
                  className="flex items-center gap-1.5 truncate uppercase"
                  title={titulo}
               >
                  {Icon && <Icon aria-hidden className="h-4 w-4 shrink-0" />}
                  <span className="truncate">{titulo}</span>
               </TimelineTitle>
            </div>
            {children && (
               /* `max-w-4xl`: sem limite, o diff atravessa a largura inteira
                  do container e a linha fica longa demais para o olho voltar
                  ao começo. */
               <TimelineBody className="max-w-4xl space-y-2">
                  {children}
               </TimelineBody>
            )}
         </TimelineContent>
      </TimelineItem>
   );
}
