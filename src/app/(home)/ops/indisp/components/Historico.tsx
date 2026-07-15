"use client";

import { useMemo } from "react";
import { Spinner } from "flowbite-react";
import { UserActionLog, LogUser } from "services/routes/logs";
import {
   HistoricoItem,
   HistoricoItemType,
   formatDateTimeSafe,
} from "./HistoricoItem";

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
}: HistoricoProps) {
   const formattedCreatedAt = formatDateTimeSafe(createdAt);
   const hasContent = formattedCreatedAt || logs.length > 0;

   // Ordena logs por timestamp em ordem cronológica (mais antigo primeiro)
   const sortedLogs = useMemo(
      () =>
         [...logs].sort(
            (a, b) =>
               new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
         ),
      [logs]
   );

   if (!hasContent && !isLoading) return null;

   return (
      <div className="mt-6 border-t border-slate-200 pt-4">
         <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-700">
            <span>📝</span> {title}
         </h4>
         <div className={`${maxHeight} min-h-20 space-y-3 overflow-y-auto`}>
            {isLoading ? (
               <div className="flex h-full items-center justify-center">
                  <Spinner color="primary" size="md" />
                  <span className="ml-2 text-sm text-gray-500">
                     Carregando histórico...
                  </span>
               </div>
            ) : (
               <>
                  {/* Item de criação (sempre o mais antigo) */}
                  {formattedCreatedAt && (
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
                     const changedFields = Object.keys(after);
                     const isDeleteAction = log.action === "delete";

                     const type: HistoricoItemType = isDeleteAction
                        ? "delete"
                        : "update";

                     const changes = !isDeleteAction
                        ? changedFields.map((field) => {
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
                          })
                        : undefined;

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
               </>
            )}
         </div>
      </div>
   );
}
