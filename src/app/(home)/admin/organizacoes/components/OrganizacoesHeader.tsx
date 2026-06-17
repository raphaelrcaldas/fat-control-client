"use client";

import { Badge, Button } from "flowbite-react";
import { FaPlus, FaBuilding } from "react-icons/fa6";

interface OrganizacoesHeaderProps {
   count?: number;
   onCreate: () => void;
}

export function OrganizacoesHeader({
   count,
   onCreate,
}: OrganizacoesHeaderProps) {
   return (
      <header className="relative overflow-hidden rounded border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
         {/* Espinha vermelha — ecoa a espinha dos cards */}
         <span
            aria-hidden
            className="absolute top-0 left-0 h-full w-1 bg-red-600"
         />

         <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
               <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-red-50 text-red-600 ring-1 ring-red-100 ring-inset">
                  <FaBuilding className="h-6 w-6" />
               </div>
               <div className="min-w-0">
                  <span className="block font-mono text-[10px] font-bold tracking-[0.3em] text-red-500 uppercase">
                     Administração
                  </span>
                  <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                     Organizações
                  </h1>
               </div>
            </div>

            <div className="flex items-center gap-3">
               {count !== undefined && (
                  <Badge color="red" size="lg">
                     {count} {count === 1 ? "organização" : "organizações"}
                  </Badge>
               )}
               <Button
                  color="red"
                  onClick={onCreate}
                  className="font-semibold whitespace-nowrap"
               >
                  <FaPlus className="mr-2 h-4 w-4" />
                  Nova Organização
               </Button>
            </div>
         </div>
      </header>
   );
}
