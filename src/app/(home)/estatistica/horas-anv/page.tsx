"use client";

import { useState } from "react";
import { Button, Select, Label } from "flowbite-react";
import { TbPlaneInflight } from "react-icons/tb";
import clsx from "clsx";
import { useHorasAnv } from "@/hooks/queries";
import { YEAR_OPTIONS } from "./constants";
import { HorasAnvTable } from "./components/HorasAnvTable";
import { HorasAnvStats } from "./components/HorasAnvStats";
import { HorasAnvSkeleton } from "./components/HorasAnvSkeleton";

export default function HorasAnvPage() {
   const currentYear = new Date().getFullYear();
   const [anoRef, setAnoRef] = useState(currentYear);

   const {
      data,
      isLoading,
      isPending,
      isFetching,
      isPlaceholderData,
      isError,
      error,
      refetch,
   } = useHorasAnv(anoRef);

   // Ano dos dados na tela: com keepPreviousData, durante a troca de ano os
   // dados ainda são do ano anterior; só adota o novo ano quando eles chegam.
   const [anoExibido, setAnoExibido] = useState(currentYear);
   if (!isPlaceholderData && data && anoExibido !== anoRef) {
      setAnoExibido(anoRef);
   }

   const isRefetching = !isLoading && isFetching;
   const hasData = !!data && data.items.length > 0;

   return (
      <div className="flex flex-col space-y-2">
         {/* Masthead — linguagem tática padrão do sistema */}
         <header className="relative overflow-hidden rounded border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
            <span
               aria-hidden
               className="bg-primary-600 absolute top-0 left-0 h-full w-1"
            />

            <div className="relative flex flex-wrap items-center justify-between gap-4">
               <div className="flex min-w-0 items-center gap-4">
                  <div className="bg-primary-50 text-primary-600 ring-primary-100 grid h-12 w-12 shrink-0 place-items-center rounded-md ring-1 ring-inset">
                     <TbPlaneInflight className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                     <span className="text-primary-600 block font-mono text-[10px] font-bold tracking-[0.3em] uppercase">
                        Estatística
                     </span>
                     <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                        <span className="hidden sm:inline">
                           Horas por Aeronave
                        </span>
                        <span className="sm:hidden">Horas por ANV</span>
                     </h1>
                  </div>
               </div>

               <div className="flex shrink-0 items-center gap-2.5">
                  <Label
                     htmlFor="anoRef"
                     className="sr-only font-mono text-[11px] font-bold tracking-wider text-slate-400 uppercase sm:not-sr-only"
                  >
                     Ano
                  </Label>
                  <Select
                     id="anoRef"
                     value={anoRef}
                     onChange={(e) => setAnoRef(Number(e.target.value))}
                     className="w-24"
                  >
                     {YEAR_OPTIONS.map((year) => (
                        <option key={year} value={year}>
                           {year}
                        </option>
                     ))}
                  </Select>
               </div>
            </div>
         </header>

         {isPending ? (
            <HorasAnvSkeleton />
         ) : isError && !hasData ? (
            <div
               role="alert"
               className="flex flex-col items-center justify-center gap-1 rounded border border-slate-200 bg-white px-6 py-16 text-center shadow-sm"
            >
               <p className="text-sm font-semibold text-red-800">
                  Não foi possível carregar as horas por aeronave
               </p>
               <p className="max-w-md text-xs text-slate-500">
                  {error instanceof Error ? error.message : "Erro desconhecido"}
               </p>
               <Button
                  color="light"
                  size="sm"
                  className="mt-3"
                  onClick={() => refetch()}
                  disabled={isFetching}
               >
                  Tentar novamente
               </Button>
            </div>
         ) : !hasData ? (
            <div className="rounded border border-dashed border-slate-300 bg-slate-50 px-4 py-16 text-center">
               <p className="text-sm font-semibold text-slate-600">
                  Nenhuma aeronave na frota
               </p>
               <p className="mt-1 text-xs text-slate-400">
                  A organização não tem aeronaves ativas para exibir.
               </p>
            </div>
         ) : (
            <>
               {isError && (
                  <div
                     role="status"
                     className="flex flex-wrap items-center justify-between gap-2 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800"
                  >
                     <span>
                        Não foi possível atualizar as horas por aeronave.
                        Exibindo a última consulta.
                     </span>
                     <Button
                        color="light"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={isFetching}
                     >
                        Tentar novamente
                     </Button>
                  </div>
               )}
               <div
                  className={clsx(
                     "space-y-2 transition-opacity duration-200",
                     isRefetching && "pointer-events-none opacity-50"
                  )}
               >
                  <HorasAnvStats data={data} ano={anoExibido} />
                  <HorasAnvTable data={data} anoRef={anoExibido} />
               </div>
            </>
         )}
      </div>
   );
}
