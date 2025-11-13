import { useMemo } from "react";

export interface SituacaoConfig {
   label: string;
   bgColor: string;
   borderColor: string;
   textColor: string;
   badgeColor: string;
   hoverBg: string;
   hoverBorder: string;
}

export function useSituacaoConfig(sit: string): SituacaoConfig {
   return useMemo(() => {
      switch (sit) {
         case "c":
            return {
               label: "Comissionado",
               bgColor: "bg-blue-50",
               borderColor: "border-blue-300",
               textColor: "text-blue-800",
               badgeColor: "bg-blue-500",
               hoverBg: "hover:bg-blue-100",
               hoverBorder: "hover:border-blue-400",
            };
         case "d":
            return {
               label: "Diária",
               bgColor: "bg-green-50",
               borderColor: "border-green-300",
               textColor: "text-green-800",
               badgeColor: "bg-green-500",
               hoverBg: "hover:bg-green-100",
               hoverBorder: "hover:border-green-400",
            };
         case "g":
            return {
               label: "Grat Rep",
               bgColor: "bg-orange-50",
               borderColor: "border-orange-300",
               textColor: "text-orange-800",
               badgeColor: "bg-orange-500",
               hoverBg: "hover:bg-orange-100",
               hoverBorder: "hover:border-orange-400",
            };
         default:
            return {
               label: "",
               bgColor: "bg-gray-50",
               borderColor: "border-gray-300",
               textColor: "text-gray-800",
               badgeColor: "bg-gray-500",
               hoverBg: "hover:bg-gray-100",
               hoverBorder: "hover:border-gray-400",
            };
      }
   }, [sit]);
}
