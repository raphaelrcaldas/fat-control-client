"use client";

import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

interface PaginationProps {
   currentPage: number;
   totalPages: number;
   onPageChange: (page: number) => void;
}

export function Pagination({
   currentPage,
   totalPages,
   onPageChange,
}: PaginationProps) {
   const getPageNumbers = () => {
      const pages: (number | string)[] = [];
      const maxVisible = 5;

      if (totalPages <= maxVisible + 2) {
         for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else {
         pages.push(1);

         if (currentPage > 3) pages.push("...");

         const start = Math.max(2, currentPage - 1);
         const end = Math.min(totalPages - 1, currentPage + 1);

         for (let i = start; i <= end; i++) pages.push(i);

         if (currentPage < totalPages - 2) pages.push("...");

         pages.push(totalPages);
      }

      return pages;
   };

   const btnBase =
      "flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700";
   const btnNav =
      "flex items-center justify-center h-full py-1.5 px-3 text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500";
   const btnActive =
      "flex items-center justify-center text-sm z-10 py-2 px-3 leading-tight text-red-600 bg-red-50 border border-red-300 hover:bg-red-100 hover:text-red-700";

   return (
      <ul className="inline-flex items-stretch -space-x-px">
         {/* Anterior */}
         <li>
            <button
               onClick={() => onPageChange(currentPage - 1)}
               disabled={currentPage === 1}
               className={`${btnNav} rounded-l-lg`}
               title="Página anterior"
            >
               <span className="sr-only">Anterior</span>
               <HiChevronLeft className="w-5 h-5" />
            </button>
         </li>

         {/* Números */}
         {getPageNumbers().map((page, idx) => (
            <li key={typeof page === "number" ? page : `ellipsis-${idx}`}>
               {page === "..." ? (
                  <span className={btnBase}>...</span>
               ) : (
                  <button
                     onClick={() => onPageChange(page as number)}
                     className={currentPage === page ? btnActive : btnBase}
                     aria-current={currentPage === page ? "page" : undefined}
                  >
                     {page}
                  </button>
               )}
            </li>
         ))}

         {/* Próximo */}
         <li>
            <button
               onClick={() => onPageChange(currentPage + 1)}
               disabled={currentPage === totalPages}
               className={`${btnNav} rounded-r-lg`}
               title="Próxima página"
            >
               <span className="sr-only">Próximo</span>
               <HiChevronRight className="w-5 h-5" />
            </button>
         </li>
      </ul>
   );
}
