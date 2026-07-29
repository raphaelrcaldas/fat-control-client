import { Button } from "flowbite-react";
import { HiPlus, HiCurrencyDollar } from "react-icons/hi";
import { SystemAdminOnly } from "../../../hooks/useSystemAdmin";

interface SoldosMastheadProps {
   onCreate: () => void;
   disabled?: boolean;
}

/** Cabeçalho da página no padrão Masthead canônico (ops/operacoes). */
export default function SoldosMasthead({
   onCreate,
   disabled,
}: SoldosMastheadProps) {
   return (
      <header className="relative overflow-hidden rounded border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
         {/* Espinha neutra — escopo de admin de sistema, sem cor de marca
             (primary é da org ativa, red é reservado a perigo) */}
         <span
            aria-hidden
            className="absolute top-0 left-0 h-full w-1 bg-slate-600"
         />

         <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
               <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-600 ring-1 ring-slate-200 ring-inset">
                  <HiCurrencyDollar className="h-6 w-6" />
               </div>
               <div className="min-w-0">
                  <span className="block font-mono text-[10px] font-bold tracking-[0.3em] text-slate-600 uppercase">
                     Administração
                  </span>
                  <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                     Soldos
                  </h1>
               </div>
            </div>

            <SystemAdminOnly>
               <Button
                  color="light"
                  onClick={onCreate}
                  disabled={disabled}
                  className="font-semibold whitespace-nowrap"
               >
                  <HiPlus className="mr-2 h-4 w-4" />
                  Novo Soldo
               </Button>
            </SystemAdminOnly>
         </div>
      </header>
   );
}
