"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LogUser } from "services/routes/logs";

// Formata datetime de forma segura (retorna null se inválido)
export function formatDateTimeSafe(
   dateStr: string | null | undefined
): string | null {
   if (!dateStr) return null;
   const date = new Date(dateStr.endsWith("Z") ? dateStr : dateStr + "Z");
   if (isNaN(date.getTime())) return null;
   return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR });
}

// Regex para detectar data ISO (YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ss)
const ISO_DATE_REGEX =
   /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/;

// Formata valor se for uma data ISO, senão retorna o valor original
// Usa valores UTC para evitar conversão de timezone
function formatValueIfDate(value: string): string {
   if (!value || !ISO_DATE_REGEX.test(value)) return value;

   const date = new Date(value.endsWith("Z") ? value : value + "Z");
   if (isNaN(date.getTime())) return value;

   const day = String(date.getUTCDate()).padStart(2, "0");
   const month = String(date.getUTCMonth() + 1).padStart(2, "0");
   const year = date.getUTCFullYear();

   // Se tem componente de hora (não é meia-noite UTC), mostra data e hora
   const hasTime =
      date.getUTCHours() !== 0 ||
      date.getUTCMinutes() !== 0 ||
      date.getUTCSeconds() !== 0;

   if (hasTime) {
      const hours = String(date.getUTCHours()).padStart(2, "0");
      const minutes = String(date.getUTCMinutes()).padStart(2, "0");
      return `${day}/${month}/${year} ${hours}:${minutes}`;
   }
   return `${day}/${month}/${year}`;
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

const typeConfig: Record<
   HistoricoItemType,
   { label: string; borderColor: string; bgColor: string; textColor: string }
> = {
   create: {
      label: "Criado",
      borderColor: "border-green-400",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
   },
   update: {
      label: "Alterado",
      borderColor: "border-yellow-400",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-700",
   },
   delete: {
      label: "Deletado",
      borderColor: "border-red-400",
      bgColor: "bg-red-50",
      textColor: "text-red-700",
   },
};

export function HistoricoItem({
   type,
   timestamp,
   user,
   changes,
}: HistoricoItemProps) {
   const formattedTime = formatDateTimeSafe(timestamp);
   const config = typeConfig[type];

   if (!formattedTime) return null;

   return (
      <div
         className={`rounded-lg border ${config.borderColor} ${config.bgColor} p-3 text-sm shadow`}
      >
         <div className="mb-1 flex items-center justify-between">
            <span className={`font-medium ${config.textColor}`}>
               {config.label}
            </span>
            <span className="text-xs text-gray-500">{formattedTime}</span>
         </div>

         {user && (
            <div className="text-gray-600 uppercase">
               {user.p_g} {user.nome_guerra}
            </div>
         )}

         {type === "update" && changes && changes.length > 0 && (
            <ul className="mt-2 space-y-1">
               {changes.map((change) => (
                  <li key={change.field} className="text-gray-600">
                     <span className="font-medium">{change.label}:</span>{" "}
                     <span className="text-red-600 line-through">
                        {change.oldValue
                           ? formatValueIfDate(change.oldValue)
                           : "(vazio)"}
                     </span>
                     {" → "}
                     <span className="text-green-600">
                        {change.newValue
                           ? formatValueIfDate(change.newValue)
                           : "(vazio)"}
                     </span>
                  </li>
               ))}
            </ul>
         )}
      </div>
   );
}
