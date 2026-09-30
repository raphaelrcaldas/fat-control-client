import { MdErrorOutline } from "react-icons/md";
import { useUserLogs } from "@/hooks/queries/useUsers";
import { HiClock } from "react-icons/hi";
import { Historico } from "@/components/audit/Historico";
import {
   formatUserAuditFieldValue,
   USER_AUDIT_ACTION_LABELS,
   USER_ROLE_AUDIT_FIELD_LABELS,
} from "./userAuditFormat";
import { USER_FIELD_LABELS } from "./userFieldLabels";

/**
 * Rótulos da trilha: os campos do cadastro mais os que só aparecem nos
 * eventos de perfil. Os dois mapas não colidem — `role` e `organizacao` não
 * existem em `USER_FIELD_LABELS`.
 */
const AUDIT_FIELD_LABELS = {
   ...USER_FIELD_LABELS,
   ...USER_ROLE_AUDIT_FIELD_LABELS,
};

export function UserAudit({ userId }: { userId?: number }) {
   const {
      data: logsData,
      isLoading,
      error,
      isFetching,
      refetch,
   } = useUserLogs(userId);
   const rawLogs = logsData ?? [];

   if (!userId) return null;

   // Enquanto carrega, `Historico` mostra o esqueleto da trilha na mesma
   // moldura do resultado; o estado vazio só vale depois da resposta.
   if (!isLoading && !error && !rawLogs.length) {
      return (
         <div className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 rounded-full bg-gray-100 p-4">
               <HiClock className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">
               Nenhum histórico encontrado
            </h2>
            <p className="text-center text-gray-500">
               Ainda não há registro de alterações para este usuário.
            </p>
         </div>
      );
   }

   return (
      <div className="space-y-2">
         {!!error && !!logsData && (
            <p
               role="status"
               className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500"
            >
               <MdErrorOutline aria-hidden className="size-3.5 shrink-0" />
               <span className="min-w-0 flex-1 truncate">
                  Não foi possível atualizar o histórico
               </span>
               <button
                  type="button"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="min-h-[24px] shrink-0 font-semibold text-slate-900 underline underline-offset-2 disabled:opacity-50"
               >
                  Tentar novamente
               </button>
            </p>
         )}
         <Historico
            logs={rawLogs}
            isLoading={isLoading}
            isError={!!error && !logsData}
            onRetry={() => refetch()}
            isRetrying={isFetching}
            fieldLabels={AUDIT_FIELD_LABELS}
            formatFieldValue={formatUserAuditFieldValue}
            actionLabels={USER_AUDIT_ACTION_LABELS}
            title="Histórico de Alterações"
            maxHeight="max-h-[600px]"
         />
      </div>
   );
}
