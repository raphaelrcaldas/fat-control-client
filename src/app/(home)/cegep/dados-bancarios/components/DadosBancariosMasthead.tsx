import { Button } from "flowbite-react";
import { HiOfficeBuilding, HiPlus } from "react-icons/hi";
import { PermBased } from "@/app/(home)/hooks/usePermBased";

interface DadosBancariosMastheadProps {
   onCreate: () => void;
}

export function DadosBancariosMasthead({
   onCreate,
}: DadosBancariosMastheadProps) {
   return (
      <header className="relative overflow-hidden rounded border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
         <span
            aria-hidden
            className="bg-primary-600 absolute top-0 left-0 h-full w-1"
         />

         <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
               <div className="bg-primary-50 text-primary-600 ring-primary-100 grid h-12 w-12 shrink-0 place-items-center rounded-md ring-1 ring-inset">
                  <HiOfficeBuilding className="h-6 w-6" />
               </div>
               <div className="min-w-0">
                  <span className="text-primary-600 block font-mono text-[10px] font-bold tracking-[0.3em] uppercase">
                     CEGEP
                  </span>
                  <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                     Dados Bancários
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                     Gerencie contas correntes dos militares
                  </p>
               </div>
            </div>

            <PermBased resource="dados_bancarios" requiredPerm="create">
               <Button
                  color="primary"
                  onClick={onCreate}
                  className="font-semibold whitespace-nowrap"
               >
                  <HiPlus className="mr-2 h-4 w-4" />
                  Cadastrar
               </Button>
            </PermBased>
         </div>
      </header>
   );
}
