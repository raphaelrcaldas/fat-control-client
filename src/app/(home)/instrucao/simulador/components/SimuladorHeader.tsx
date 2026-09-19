import type { ReactNode } from "react";
import Link from "next/link";
import { Badge, Button } from "flowbite-react";
import { GiJoystick } from "react-icons/gi";
import { HiFilter, HiPlus } from "react-icons/hi";

import { PermBased } from "@/app/(home)/hooks/usePermBased";

interface SimuladorHeaderProps {
   showFilters: boolean;
   activeFilterCount: number;
   /** Ano de referencia da listagem; a nova sessao precisa cair nele. */
   anoRef: number;
   onToggleFilters: () => void;
   children: ReactNode;
}

export default function SimuladorHeader({
   showFilters,
   activeFilterCount,
   anoRef,
   onToggleFilters,
   children,
}: SimuladorHeaderProps) {
   return (
      <header className="relative overflow-hidden rounded border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
         <span
            aria-hidden
            className="bg-primary-600 absolute top-0 left-0 h-full w-1"
         />

         <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
               <div className="bg-primary-50 text-primary-600 ring-primary-100 grid h-12 w-12 shrink-0 place-items-center rounded-md ring-1 ring-inset">
                  <GiJoystick className="h-6 w-6" />
               </div>
               <div className="min-w-0">
                  <span className="text-primary-600 block font-mono text-[10px] font-bold tracking-[0.3em] uppercase">
                     Instrução
                  </span>
                  <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                     Simulador de Voo
                  </h1>
               </div>
            </div>

            <div className="flex items-center gap-2">
               <PermBased resource="estatistica.etapas" requiredPerm="create">
                  {/* No mobile fica so o icone, para a linha do masthead caber
                      sem quebrar. O rotulo segue no DOM sob `sr-only`: sem ele
                      o botao perde o nome acessivel. */}
                  <Button
                     as={Link}
                     href={`/instrucao/simulador/missao/nova?ano=${anoRef}`}
                     color="primary"
                     size="sm"
                  >
                     <HiPlus className="h-4 w-4 sm:mr-2" />
                     <span className="sr-only sm:not-sr-only">Nova Dupla</span>
                  </Button>
               </PermBased>
               <Button
                  color="light"
                  size="sm"
                  onClick={onToggleFilters}
                  aria-expanded={showFilters}
                  aria-controls="filtros-panel"
               >
                  <HiFilter className="h-4 w-4 sm:mr-2" />
                  <span className="sr-only sm:not-sr-only">Filtros</span>
                  {activeFilterCount > 0 && (
                     <Badge color="primary" size="sm" className="ml-2">
                        {activeFilterCount}
                     </Badge>
                  )}
               </Button>
            </div>
         </div>

         <div
            className={
               showFilters
                  ? "relative -mx-5 mt-4 -mb-4 sm:-mx-6 sm:mt-5 sm:-mb-5"
                  : "hidden"
            }
         >
            {children}
         </div>
      </header>
   );
}
