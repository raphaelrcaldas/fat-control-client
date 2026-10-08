"use client";

import { Badge, Button } from "flowbite-react";
import { FaPlus, FaUserShield } from "react-icons/fa6";

interface AcessosHeaderProps {
   /** Vínculos visíveis (após o filtro) */
   count?: number;
   /** Total de vínculos; difere de `count` quando há filtro ativo */
   total?: number;
   onAdd: () => void;
   /** Perfis/organizações ainda não carregaram (ou falharam): o modal abriria com selects vazios */
   addDisabled?: boolean;
}

export function AcessosHeader({
   count,
   total,
   onAdd,
   addDisabled = false,
}: AcessosHeaderProps) {
   return (
      <header className="relative overflow-hidden rounded border border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-6 sm:py-5">
         {/* Espinha na cor da marca — ecoa a espinha dos cards */}
         <span
            aria-hidden
            className="bg-primary-600 absolute top-0 left-0 h-full w-1"
         />

         <div className="relative flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
               <div className="bg-primary-50 text-primary-600 ring-primary-100 grid h-10 w-10 shrink-0 place-items-center rounded-md ring-1 ring-inset sm:h-12 sm:w-12">
                  <FaUserShield aria-hidden className="h-6 w-6" />
               </div>
               <div className="min-w-0">
                  <span className="text-primary-600 block font-mono text-[10px] font-bold tracking-[0.3em] uppercase">
                     Administração
                  </span>
                  <h1 className="truncate text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                     Acessos
                  </h1>
               </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
               {count !== undefined && total !== undefined && (
                  <Badge
                     color="primary"
                     size="lg"
                     className="whitespace-nowrap"
                  >
                     <span aria-hidden className="sm:hidden">
                        {count === total ? count : `${count}/${total}`}
                     </span>
                     <span className="sr-only sm:not-sr-only">
                        {count === total ? count : `${count} de ${total}`}{" "}
                        {total === 1 ? "vínculo" : "vínculos"}
                     </span>
                  </Badge>
               )}
               <Button
                  color="primary"
                  onClick={onAdd}
                  disabled={addDisabled}
                  className="font-semibold whitespace-nowrap"
               >
                  <FaPlus aria-hidden className="h-4 w-4 sm:mr-2" />
                  <span className="sr-only sm:not-sr-only">Adicionar</span>
               </Button>
            </div>
         </div>
      </header>
   );
}
