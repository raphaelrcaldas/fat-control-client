"use client";

import { Badge, Button } from "flowbite-react";
import { FaPlus, FaUserGroup } from "react-icons/fa6";

interface FuncoesHeaderProps {
   count?: number;
   onCreate: () => void;
}

export function FuncoesHeader({ count, onCreate }: FuncoesHeaderProps) {
   return (
      <header className="relative overflow-hidden rounded border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
         {/* Espinha neutra — escopo de admin de sistema, sem cor de marca */}
         <span
            aria-hidden
            className="absolute top-0 left-0 h-full w-1 bg-slate-600"
         />

         <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
               <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-600 ring-1 ring-slate-200 ring-inset">
                  <FaUserGroup className="h-6 w-6" />
               </div>
               <div className="min-w-0">
                  <span className="block font-mono text-[10px] font-bold tracking-[0.3em] text-slate-600 uppercase">
                     Administração
                  </span>
                  <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                     Funções
                  </h1>
               </div>
            </div>

            <div className="flex items-center gap-3">
               {count !== undefined && (
                  <Badge color="gray" size="lg">
                     {count} {count === 1 ? "função" : "funções"}
                  </Badge>
               )}
               <Button
                  color="light"
                  onClick={onCreate}
                  className="font-semibold whitespace-nowrap"
               >
                  <FaPlus className="mr-2 h-4 w-4" />
                  Nova função
               </Button>
            </div>
         </div>
      </header>
   );
}
