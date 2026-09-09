"use client";

import {
   TimelineBody,
   TimelineContent,
   TimelineItem,
   TimelinePoint,
   TimelineTime,
   TimelineTitle,
} from "flowbite-react";
import { formatDateTime, formatNaiveDateTime } from "utils/dateHandler";
import { LogUser } from "services/routes/logs";

// Valores de log chegam como string crua: uns são data ISO, outros são texto
// (motivo, observação). Só os que casam com o formato de data são convertidos.
const ISO_DATE_REGEX =
   /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/;

/**
 * `formatNaiveDateTime` faz o parsing por string, sem `new Date()`: as datas do
 * log (`date_start`/`date_end`) são dias puros, e convertê-las por fuso movia o
 * dia exibido em quem lança perto da meia-noite — o histórico passava a
 * contradizer o período que o próprio formulário mostrava.
 */
function formatValueIfDate(value: string): string {
   if (!value || !ISO_DATE_REGEX.test(value)) return value;
   return formatNaiveDateTime(value) || value;
}

export type HistoricoItemType = "create" | "update" | "delete";

export interface HistoricoItemProps {
   /** Tipo do item: criação, alteração ou deleção */
   type: HistoricoItemType;
   /** Data/hora do evento (ISO string) */
   timestamp: string | null | undefined;
   /** Usuário que realizou a ação */
   user?: LogUser | null;
   /** Campos alterados (para type="update") */
   changes?: {
      field: string;
      label: string;
      oldValue: string;
      newValue: string;
   }[];
}

/**
 * A cor mora na BOLINHA, não no cartão: é o único elemento que se repete em
 * toda a coluna, então percorrer a linha do tempo de cima a baixo já diz onde
 * o registro nasceu, onde mudou e onde morreu, sem ler texto.
 *
 * Vai pelo `theme`, e não por `className`: o `className` do `TimelinePoint`
 * cai no wrapper (vazio e sem tamanho), enquanto a bolinha é um filho interno
 * que só o tema alcança. Pintar pelo `className` não muda pixel nenhum.
 */
const TIPO = {
   create: { label: "Criado", dot: "bg-emerald-500" },
   update: { label: "Alterado", dot: "bg-amber-500" },
   delete: { label: "Removido", dot: "bg-red-600" },
} as const satisfies Record<HistoricoItemType, { label: string; dot: string }>;

export function HistoricoItem({
   type,
   timestamp,
   user,
   changes,
}: HistoricoItemProps) {
   const formattedTime = formatDateTime(timestamp);
   const { label, dot } = TIPO[type];

   if (!formattedTime) return null;

   // Log sem usuário existe (ação de sistema, registro antigo): sem a guarda,
   // `user.p_g` derrubava o modal inteiro.
   const autor = user ? `${user.p_g} ${user.nome_guerra}` : "Sistema";
   const titulo = `${label} · ${autor}`;
   const temMudancas = type === "update" && changes && changes.length > 0;

   return (
      <TimelineItem>
         <TimelinePoint theme={{ marker: { base: { vertical: dot } } }} />
         <TimelineContent>
            <TimelineTime>{formattedTime}</TimelineTime>
            {/* Truncado com `title`: nome de guerra longo quebrava o cabeçalho
                em duas linhas e desalinhava a coluna de bolinhas. */}
            <TimelineTitle className="truncate uppercase" title={titulo}>
               {titulo}
            </TimelineTitle>
            {temMudancas && (
               <TimelineBody>
                  <ul className="space-y-0.5">
                     {changes.map((change) => (
                        <li key={change.field} className="text-slate-600">
                           <span className="font-medium">{change.label}:</span>{" "}
                           {change.oldValue ? (
                              <>
                                 <span className="text-slate-400 line-through">
                                    {formatValueIfDate(change.oldValue)}
                                 </span>
                                 {" → "}
                              </>
                           ) : null}
                           <span className="font-medium text-slate-800">
                              {change.newValue
                                 ? formatValueIfDate(change.newValue)
                                 : "(vazio)"}
                           </span>
                        </li>
                     ))}
                  </ul>
               </TimelineBody>
            )}
         </TimelineContent>
      </TimelineItem>
   );
}
