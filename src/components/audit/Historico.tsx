"use client";

import { useMemo } from "react";
import { Button, Timeline } from "flowbite-react";
import { HiExclamationCircle } from "react-icons/hi";
import { formatDateTime } from "utils/dateHandler";
import { UserActionLog, LogUser } from "services/routes/logs";
import { HistoricoItem, HistoricoItemType } from "./HistoricoItem";
import { AuditTimelineSkeleton } from "./AuditTimelineSkeleton";
import { TIMELINE_DENSO } from "./timelineTheme";

/**
 * `before`/`after` chegam como texto cru do backend. A maioria é objeto JSON
 * (`{"campo": "valor"}`), mas alguns eventos gravam texto livre (ex.: o
 * `access_denied` de `security.py`) — e texto que não é JSON derrubava a aba
 * inteira em `JSON.parse`. Aqui qualquer coisa que não seja objeto (string,
 * array, JSON inválido) vira `{}` em vez de propagar o erro ou virar
 * `Object.keys` de caractere em caractere.
 */
function parseLogPayload(raw: string | null): Record<string, unknown> {
   if (!raw) return {};
   try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
         return parsed as Record<string, unknown>;
      }
   } catch {
      // texto livre (ex.: motivo de acesso negado) — sem diff, só o evento.
   }
   return {};
}

export interface HistoricoProps {
   /** Logs de alteração do recurso */
   logs: UserActionLog[];
   /** Data de criação do recurso (ISO string) */
   createdAt?: string | null;
   /** Usuário que criou o recurso */
   createdBy?: LogUser | null;
   /** Labels amigáveis para os campos (ex: { date_start: "Data Início" }) */
   fieldLabels?: Record<string, string>;
   /** Função para formatar valores de campos específicos */
   formatFieldValue?: (field: string, value: string) => string;
   /** Rótulos específicos por ação (ex: reset-pwd → Senha redefinida). */
   actionLabels?: Record<string, string>;
   /** Título da seção (padrão: "Histórico") */
   title?: string;
   /** Altura máxima do container (padrão: "max-h-48") */
   maxHeight?: string;
   /** Indica se os logs estão carregando */
   isLoading?: boolean;
   /** A carga dos logs falhou — a seção diz isso, em vez de sumir */
   isError?: boolean;
   /** Nova tentativa de carga, quando o consumidor souber refazê-la */
   onRetry?: () => void;
}

export function Historico({
   logs,
   createdAt,
   createdBy,
   fieldLabels = {},
   formatFieldValue,
   actionLabels = {},
   title = "Histórico",
   maxHeight = "max-h-48",
   isLoading = false,
   isError = false,
   onRetry,
}: HistoricoProps) {
   const hasCreatedAt = Boolean(formatDateTime(createdAt));
   const hasContent = hasCreatedAt || logs.length > 0;

   // Ordena logs por timestamp em ordem cronológica (mais antigo primeiro).
   // O backend desempata timestamp igual por `id desc`; aqui, ascendente, o
   // desempate é por `id` também — sem ele, dois eventos no mesmo instante
   // podiam sair com o mais novo antes do mais antigo.
   const sortedLogs = useMemo(
      () =>
         [...logs].sort((a, b) => {
            const diff =
               new Date(a.timestamp).getTime() -
               new Date(b.timestamp).getTime();
            return diff !== 0 ? diff : a.id - b.id;
         }),
      [logs]
   );

   // A falha tem de sobreviver a esta guarda: sem `isError` aqui, a seção
   // sumia inteira e a tela dizia "nunca foi alterado" para o que na verdade
   // não carregou.
   if (!hasContent && !isLoading && !isError) return null;

   return (
      <section className="space-y-2">
         <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
         <div className={`${maxHeight} min-h-20 overflow-y-auto`}>
            {isLoading ? (
               // Espelha a trilha real (linha, bolinha, carimbo e mudanças)
               // dentro da mesma moldura, em vez de um spinner que muda de
               // altura quando os dados chegam. Dois eventos cabem no
               // `max-h-48` padrão sem scroll interno.
               <AuditTimelineSkeleton linhasPorEvento={[2, 3]} />
            ) : isError ? (
               <div
                  role="alert"
                  className="flex flex-wrap items-center gap-3 py-4 text-sm text-red-600"
               >
                  <span className="flex items-center gap-2">
                     <HiExclamationCircle className="h-5 w-5 shrink-0" />
                     Não foi possível carregar o histórico.
                  </span>
                  {onRetry && (
                     <Button size="xs" color="light" onClick={onRetry}>
                        Tentar novamente
                     </Button>
                  )}
               </div>
            ) : (
               <Timeline theme={TIMELINE_DENSO}>
                  {/* Item de criação (sempre o mais antigo) */}
                  {hasCreatedAt && (
                     <HistoricoItem
                        type="create"
                        timestamp={createdAt}
                        user={createdBy}
                     />
                  )}

                  {/* Logs de alteração em ordem cronológica */}
                  {sortedLogs.map((log) => {
                     const before = parseLogPayload(log.before);
                     const after = parseLogPayload(log.after);
                     const type: HistoricoItemType =
                        log.action === "create"
                           ? "create"
                           : log.action === "delete"
                             ? "delete"
                             : "update";

                     // `delete` não tem "para onde foi"; `create` e `update`
                     // listam os campos de `after` — em `create`, `before`
                     // fica vazio e cada campo aparece só com o valor novo.
                     const changes =
                        type === "delete"
                           ? undefined
                           : Object.keys(after).map((field) => {
                                let oldVal = String(before[field] ?? "");
                                let newVal = String(after[field] ?? "");

                                if (formatFieldValue) {
                                   oldVal = formatFieldValue(field, oldVal);
                                   newVal = formatFieldValue(field, newVal);
                                }

                                return {
                                   field,
                                   label: fieldLabels[field] || field,
                                   oldValue: oldVal,
                                   newValue: newVal,
                                };
                             });

                     return (
                        <HistoricoItem
                           key={log.id}
                           type={type}
                           label={actionLabels[log.action]}
                           timestamp={log.timestamp}
                           user={log.user}
                           changes={changes}
                        />
                     );
                  })}
               </Timeline>
            )}
         </div>
      </section>
   );
}
