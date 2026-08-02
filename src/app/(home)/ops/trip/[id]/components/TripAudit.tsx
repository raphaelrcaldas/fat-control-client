import { Spinner } from "flowbite-react";
import { HiClock, HiDocumentText } from "react-icons/hi";
import { useTripLogs } from "@/hooks/queries/useTrips";
import { getFuncLabel } from "@/constants/tripulantes/funcoes";
import { OPER_LABELS } from "@/constants/tripulantes/operacionalidade";
import type { FuncType, OperType } from "@/constants/tripulantes/types";
import { formatNaiveDate } from "utils/dateHandler";
import { Historico } from "@/app/(home)/ops/indisp/components/Historico";
import { TRIP_FIELD_LABELS } from "./tripFieldLabels";

/**
 * Traduz os valores crus do log de auditoria do tripulante para linguagem
 * humana. `func`/`oper` resolvem pelas mesmas fontes usadas no formulário
 * (FuncFields/TripReadView); `data_op` é `date` puro (sem hora) — formatado
 * por parsing de string (`formatNaiveDate`), nunca via `new Date()`, para não
 * arriscar deslocar o dia por fuso.
 */
function formatTripFieldValue(field: string, value: string): string {
   const str = String(value ?? "");
   if (!str) return str;

   switch (field) {
      case "func": {
         const label = getFuncLabel(str as FuncType);
         return label ? `${str.toUpperCase()} - ${label}` : str.toUpperCase();
      }
      case "oper": {
         const label = OPER_LABELS[str as OperType];
         return label ? `${str.toUpperCase()} - ${label}` : str.toUpperCase();
      }
      case "active":
         return str === "true" ? "Ativo" : "Inativo";
      case "proj":
         return str.toUpperCase();
      case "data_op":
         return formatNaiveDate(str) || str;
      default:
         return str;
   }
}

export function TripAudit({ tripId }: { tripId: number }) {
   const { data: logs = [], isLoading, error } = useTripLogs(tripId);

   if (isLoading)
      return (
         <div className="flex flex-col items-center justify-center py-16">
            <Spinner size="xl" color="primary" />
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
            <h2 className="mb-2 text-lg font-semibold text-gray-900">
               Sem registros de alteração
            </h2>
            <p className="max-w-sm text-center text-gray-500">
               O registro de alterações deste tripulante começou a ser guardado
               agora — mudanças feitas antes deste momento não entraram na
               auditoria.
            </p>
         </div>
      );
   }

   return (
      <Historico
         logs={logs}
         fieldLabels={TRIP_FIELD_LABELS}
         formatFieldValue={formatTripFieldValue}
         title="Histórico de Alterações"
         maxHeight="max-h-[600px]"
      />
   );
}
