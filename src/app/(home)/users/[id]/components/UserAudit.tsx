import { useMemo } from "react";
import { useUserLogs, useUnidadeOptions } from "@/hooks/queries";
import type { UnidadeOption } from "@/hooks/queries";
import { postoGradRecords } from "@/constants/militar/postos";
import { Spinner } from "flowbite-react";
import { HiClock, HiDocumentText } from "react-icons/hi";
import { Historico } from "@/app/(home)/ops/indisp/components/Historico";
import { cpf as cpfValidator } from "cpf-cnpj-validator";
import { formatCpf } from "@/constants/formats";
import { USER_FIELD_LABELS } from "./userFieldLabels";

/**
 * Cria o formatador de valores de campo. Recebe as opções de unidade
 * (diretório de organizações) para resolver `unidade` → label.
 */
function makeFormatUserFieldValue(unidadeOptions: UnidadeOption[]) {
   return function formatUserFieldValue(field: string, value: string): string {
      const str = String(value ?? "");
      if (!str) return str;

      switch (field) {
         case "p_g": {
            const posto = postoGradRecords.find((p) => p.short === str);
            return posto ? posto.long : str;
         }
         case "unidade": {
            const und = unidadeOptions.find((u) => u.value === str);
            return und ? und.label : str;
         }
         case "cpf":
            return cpfValidator.isValid(str) ? formatCpf(str) : str;
         case "active":
            return str === "true" ? "Ativo" : "Inativo";
         case "password":
            return "••••••••";
         case "_senha":
            return "Redefinida";
         default:
            return str;
      }
   };
}

/**
 * Pré-processa logs para tratar ações especiais (ex: change-pwd sem before/after)
 */
function preprocessLogs(logs: ReturnType<typeof useUserLogs>["data"]) {
   if (!logs) return [];
   return logs.map((log) => {
      if (log.action === "change-pwd") {
         return {
            ...log,
            action: "update",
            after: JSON.stringify({ _senha: "redefinida" }),
         };
      }
      return log;
   });
}

export function UserAudit({ userId }: { userId?: number }) {
   const { data: rawLogs = [], isLoading, error } = useUserLogs(userId);
   const unidadeOptions = useUnidadeOptions();
   const formatFieldValue = useMemo(
      () => makeFormatUserFieldValue(unidadeOptions),
      [unidadeOptions]
   );
   const logs = preprocessLogs(rawLogs);

   if (!userId) return null;

   if (isLoading)
      return (
         <div className="flex flex-col items-center justify-center py-16">
            <Spinner size="xl" color="failure" />
            <p className="mt-4 text-gray-500">Carregando histórico...</p>
         </div>
      );

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

   if (!logs.length) {
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
         logs={logs}
         fieldLabels={USER_FIELD_LABELS}
         formatFieldValue={formatFieldValue}
         title="Histórico de Alterações"
         maxHeight="max-h-[600px]"
      />
   );
}
