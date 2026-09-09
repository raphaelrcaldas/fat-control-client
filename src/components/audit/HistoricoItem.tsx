"use client";

import { formatNaiveDateTime } from "utils/dateHandler";
import { AuditTimelineItem } from "./AuditTimelineItem";
import { AuditValueDelta } from "./AuditValueDelta";
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

const LABEL: Record<HistoricoItemType, string> = {
   create: "Criado",
   update: "Alterado",
   delete: "Removido",
};

export function HistoricoItem({
   type,
   timestamp,
   user,
   changes,
}: HistoricoItemProps) {
   const temMudancas = type === "update" && changes && changes.length > 0;

   return (
      <AuditTimelineItem
         tone={type}
         label={LABEL[type]}
         timestamp={timestamp}
         user={user}
      >
         {temMudancas && (
            <ul className="space-y-0.5">
               {changes.map((change) => (
                  <li key={change.field} className="text-slate-600">
                     <span className="font-medium text-slate-700">
                        {change.label}:
                     </span>{" "}
                     <AuditValueDelta
                        before={
                           change.oldValue
                              ? formatValueIfDate(change.oldValue)
                              : null
                        }
                        after={
                           change.newValue
                              ? formatValueIfDate(change.newValue)
                              : ""
                        }
                     />
                  </li>
               ))}
            </ul>
         )}
      </AuditTimelineItem>
   );
}
