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
                        {change.oldValue || "(vazio)"}
                     </span>
                     {" → "}
                     <span className="text-green-600">
                        {change.newValue || "(vazio)"}
                     </span>
                  </li>
               ))}
            </ul>
         )}
      </div>
   );
}
