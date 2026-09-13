import { useUserLogs } from "@/hooks/queries/useUsers";
import { HiClock, HiDocumentText } from "react-icons/hi";
import { Historico } from "@/components/audit/Historico";
import {
   formatUserAuditFieldValue,
   USER_AUDIT_ACTION_LABELS,
} from "./userAuditFormat";
import { USER_FIELD_LABELS } from "./userFieldLabels";

export function UserAudit({ userId }: { userId?: number }) {
   const { data: rawLogs = [], isLoading, error } = useUserLogs(userId);

   if (!userId) return null;

   if (error)
      return (
         <div className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 rounded-full bg-red-50 p-4">
               <HiDocumentText className="h-12 w-12 text-red-400" />
            </div>
            <p className="font-medium text-red-600">
               {error instanceof Error
                  ? error.message
                  : "Erro ao carregar auditoria"}
            </p>
         </div>
      );

   // Enquanto carrega, `Historico` mostra o esqueleto da trilha na mesma
   // moldura do resultado; o estado vazio só vale depois da resposta.
   if (!isLoading && !rawLogs.length) {
      return (
         <div className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 rounded-full bg-gray-100 p-4">
               <HiClock className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
               Nenhum histórico encontrado
            </h3>
            <p className="text-center text-gray-500">
               Ainda não há registro de alterações para este usuário.
            </p>
         </div>
      );
   }

   return (
      <Historico
         logs={rawLogs}
         isLoading={isLoading}
         fieldLabels={USER_FIELD_LABELS}
         formatFieldValue={formatUserAuditFieldValue}
         actionLabels={USER_AUDIT_ACTION_LABELS}
         title="Histórico de Alterações"
         maxHeight="max-h-[600px]"
      />
   );
}
