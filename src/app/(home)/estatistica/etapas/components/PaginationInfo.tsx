interface PaginationInfoProps {
   page: number;
   perPage: number;
   total: number;
   totalItems?: number;
   viewMode: "grouped" | "flat";
}

export function PaginationInfo({
   page,
   perPage,
   total,
   totalItems,
   viewMode,
}: PaginationInfoProps) {
   // Modo grouped: sem paginacao, mostra apenas totais
   if (viewMode === "grouped") {
      return (
         <span className="text-sm font-normal text-gray-500">
            <span className="font-semibold text-gray-900">{total}</span>{" "}
            {total === 1 ? "missao" : "missoes"}
            {totalItems != null && (
               <span className="ml-1 font-normal">
                  ({totalItems} {totalItems === 1 ? "etapa" : "etapas"})
               </span>
            )}
         </span>
      );
   }

   // Modo flat: paginado
   const start = (page - 1) * perPage + 1;
   const end = Math.min(page * perPage, total);
   const label = total === 1 ? "etapa" : "etapas";

   return (
      <span className="text-sm font-normal text-gray-500">
         Mostrando{" "}
         <span className="font-semibold text-gray-900">
            {start}–{end}
         </span>{" "}
         de <span className="font-semibold text-gray-900">{total}</span> {label}
      </span>
   );
}
