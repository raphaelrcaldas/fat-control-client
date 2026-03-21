import {
   MdCheckCircle,
   MdWarning,
   MdError,
   MdCancel,
   MdRemoveCircleOutline,
} from "react-icons/md";

export type DateStatus = "valid" | "warning" | "critical" | "expired" | "empty";

export function getDateStatus(
   dateStr: string | null | undefined
): DateStatus {
   if (!dateStr) return "empty";
   const today = new Date();
   today.setHours(0, 0, 0, 0);
   const date = new Date(dateStr + "T00:00:00");
   const diffMs = date.getTime() - today.getTime();
   const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
   if (diffDays < 0) return "expired";
   if (diffDays <= 30) return "critical";
   if (diffDays <= 90) return "warning";
   return "valid";
}

export function getStatusConfig(status: DateStatus) {
   switch (status) {
      case "valid":
         return {
            color: "text-green-600",
            bg: "bg-green-50",
            border: "border-green-200",
            barColor: "green" as const,
            icon: MdCheckCircle,
            label: "Regular",
         };
      case "warning":
         return {
            color: "text-yellow-600",
            bg: "bg-yellow-50",
            border: "border-yellow-200",
            barColor: "yellow" as const,
            icon: MdWarning,
            label: "Atenção",
         };
      case "critical":
         return {
            color: "text-orange-600",
            bg: "bg-orange-50",
            border: "border-orange-200",
            barColor: "red" as const,
            icon: MdError,
            label: "Crítico",
         };
      case "expired":
         return {
            color: "text-red-600",
            bg: "bg-red-50",
            border: "border-red-200",
            barColor: "red" as const,
            icon: MdCancel,
            label: "Vencido",
         };
      case "empty":
         return {
            color: "text-gray-400",
            bg: "bg-gray-50",
            border: "border-gray-200",
            barColor: "gray" as const,
            icon: MdRemoveCircleOutline,
            label: "Sem data",
         };
   }
}

export function formatDate(dateStr: string | null | undefined): string {
   if (!dateStr) return "---";
   const date = new Date(dateStr + "T00:00:00");
   return date.toLocaleDateString("pt-BR");
}

export function getDaysRemaining(
   dateStr: string | null | undefined
): string {
   if (!dateStr) return "";
   const today = new Date();
   today.setHours(0, 0, 0, 0);
   const date = new Date(dateStr + "T00:00:00");
   const diffMs = date.getTime() - today.getTime();
   const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
   if (diffDays < 0) return `${Math.abs(diffDays)}d atrás`;
   if (diffDays === 0) return "Hoje";
   return `${diffDays}d`;
}
