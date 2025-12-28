import { Badge } from "flowbite-react";

/**
 * Formats a number as Brazilian Real currency
 */
export const formatCurrency = (value: number): string => {
   return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
   }).format(value);
};

/**
 * Formats a date string to Brazilian locale format
 */
export const formatDate = (dateStr: string | null): string => {
   if (!dateStr) return "-";
   return new Date(dateStr + "T00:00:00").toLocaleDateString("pt-BR");
};

/**
 * Returns a status badge component based on the status string
 */
export const getStatusBadge = (status: string | null): React.ReactNode => {
   switch (status) {
      case "vigente":
         return (
            <Badge color="success" className="w-fit">
               <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                  Vigente
               </span>
            </Badge>
         );
      case "proximo":
         return (
            <Badge color="info" className="w-fit">
               <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Proximo
               </span>
            </Badge>
         );
      case "anterior":
         return (
            <Badge color="gray" className="w-fit">
               <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-gray-400" />
                  Anterior
               </span>
            </Badge>
         );
      default:
         return null;
   }
};

/**
 * Gets the display name for a cidade group
 */
export const getCidadeDisplayName = (
   grupoCid: number,
   cidades: Array<{ cidade?: { nome: string } | null }>
): string => {
   if (grupoCid === 3) return "Demais Localidades";
   if (grupoCid === 2) return "Demais Capitais";
   return (
      cidades
         .map((c) => c.cidade?.nome)
         .filter(Boolean)
         .join(", ") || "-"
   );
};
