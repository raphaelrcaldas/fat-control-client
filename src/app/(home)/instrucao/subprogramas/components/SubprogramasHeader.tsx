"use client";

import { Badge, Button } from "flowbite-react";
import { FaPlus, FaBookOpen } from "react-icons/fa6";
import { PermBased } from "../../../hooks/usePermBased";

interface SubprogramasHeaderProps {
   count?: number;
   onCreate: () => void;
}

export function SubprogramasHeader({
   count,
   onCreate,
}: SubprogramasHeaderProps) {
   return (
      <header className="relative overflow-hidden rounded border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
         <span
            aria-hidden
            className="bg-primary-600 absolute top-0 left-0 h-full w-1"
         />

         <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
               <div className="bg-primary-50 text-primary-600 ring-primary-100 grid h-12 w-12 shrink-0 place-items-center rounded-md ring-1 ring-inset">
                  <FaBookOpen className="h-6 w-6" />
               </div>
               <div className="min-w-0">
                  <span className="text-primary-600 block font-mono text-[10px] font-bold tracking-[0.3em] uppercase">
                     Instrução
                  </span>
                  <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                     Subprogramas
                  </h1>
               </div>
            </div>

            <div className="flex items-center gap-3">
               {count !== undefined && (
                  <Badge color="gray" size="lg">
                     {count} {count === 1 ? "subprograma" : "subprogramas"}
                  </Badge>
               )}
               <PermBased
                  resource="instrucao-subprogramas"
                  requiredPerm="create"
               >
                  <Button
                     color="primary"
                     onClick={onCreate}
                     className="font-semibold whitespace-nowrap"
                  >
                     <FaPlus className="mr-2 h-4 w-4" />
                     Novo subprograma
                  </Button>
               </PermBased>
            </div>
         </div>
      </header>
   );
}
