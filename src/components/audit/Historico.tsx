"use client";

import { useMemo } from "react";
import { Button, Spinner, Timeline } from "flowbite-react";
import { HiExclamationCircle } from "react-icons/hi";
import { formatDateTime } from "utils/dateHandler";
import { UserActionLog, LogUser } from "services/routes/logs";
import { HistoricoItem, HistoricoItemType } from "./HistoricoItem";

/**
 * O tema padrão da Timeline foi desenhado para post de blog: `mb-10` por item
 * (35px aqui, com a raiz em 87.5%) e título em `text-lg`. Numa trilha de
 * auditoria dentro de modal isso rende três eventos por tela de rolagem. A
 * densidade cai para o mesmo passo do resto do sistema, e o gap entre eventos
 * passa a ser um só — o `mb` do item — em vez de somar com o `mb-4` do corpo.
 */
const TIMELINE_DENSO = {
   item: {
      root: { vertical: "mb-4 ml-4" },
      content: {
         title: { base: "text-sm font-semibold text-slate-800" },
         body: { base: "mb-0 text-sm font-normal text-slate-600" },
         time: {
            base: "mb-0.5 text-xs font-normal leading-none text-slate-400",
         },
      },
   },
};

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
   title = "Histórico",
   maxHeight = "max-h-48",
   isLoading = false,
   isError = false,
   onRetry,
}: HistoricoProps) {
   const hasCreatedAt = Boolean(formatDateTime(createdAt));
   const hasContent = hasCreatedAt || logs.length > 0;

   // Ordena logs por timestamp em ordem cronológica (mais antigo primeiro)
   const sortedLogs = useMemo(
      () =>
         [...logs].sort(
            (a, b) =>
               new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
         ),
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
               <div className="flex h-20 items-center justify-center">
                  <Spinner color="primary" size="md" />
                  <span className="ml-2 text-sm text-slate-500">
                     Carregando histórico...
                  </span>
               </div>
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
                     const before = log.before ? JSON.parse(log.before) : {};
                     const after = log.after ? JSON.parse(log.after) : {};
                     const isDeleteAction = log.action === "delete";

                     const type: HistoricoItemType = isDeleteAction
                        ? "delete"
                        : "update";

                     const changes = isDeleteAction
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
