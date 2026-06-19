"use client";

import { useMemo, useState } from "react";
import { Button } from "flowbite-react";
import { HiPlus } from "react-icons/hi";
import { TbPlaneInflight } from "react-icons/tb";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import { useOperacoes } from "@/hooks/queries/useOperacoes";
import { PermBased } from "../../hooks/usePermBased";
import { OperacaoCard } from "./components/OperacaoCard";
import { OperacoesFilters } from "./components/OperacoesFilters";
import { OperacoesSkeleton } from "./components/OperacoesSkeleton";
import { OperacaoFormModal } from "./components/OperacaoFormModal";
import { useOperacoesFilters } from "./hooks/useOperacoesFilters";
import type { OperacoesFiltersState } from "./components/OperacoesFilters";
import type { GetOperacoesParams } from "services/routes/ops/operacoes";

const EMPTY_COUNTS = {
   todas: 0,
   andamento: 0,
   encerrada: 0,
   planejada: 0,
   cancelada: 0,
};

export default function OperacoesPage() {
   // Padrão: ano corrente (1º jan → 31 dez), persistido + na URL.
   const defaults = useMemo<OperacoesFiltersState>(() => {
      const ano = new Date().getFullYear();
      return {
         status: null,
         tipo: null,
         date_start: `${ano}-01-01`,
         date_end: `${ano}-12-31`,
         q: "",
      };
   }, []);

   const [filters, setFilters] = useOperacoesFilters(defaults);
   const [showForm, setShowForm] = useState(false);
   const debouncedQ = useDebouncedValue(filters.q, 400);

   const params = useMemo<GetOperacoesParams>(
      () => ({
         status: filters.status ?? undefined,
         tipo: filters.tipo ?? undefined,
         date_start: filters.date_start || undefined,
         date_end: filters.date_end || undefined,
         q: debouncedQ.trim() || undefined,
      }),
      [
         filters.status,
         filters.tipo,
         filters.date_start,
         filters.date_end,
         debouncedQ,
      ]
   );

   const { data, isLoading, isFetching, error } = useOperacoes(params);

   const items = data?.items ?? [];
   const counts = data?.counts ?? EMPTY_COUNTS;
   const showSkeleton = isLoading || (isFetching && !data);

   return (
      <div className="flex flex-col space-y-2">
         {/* Masthead — claro, mesma linguagem tática dos cards */}
         <header className="relative overflow-hidden rounded border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
            {/* Espinha vermelha — ecoa a espinha dos cards */}
            <span
               aria-hidden
               className="absolute top-0 left-0 h-full w-1 bg-red-600"
            />

            <div className="relative flex flex-wrap items-center justify-between gap-4">
               <div className="flex min-w-0 items-center gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-red-50 text-red-600 ring-1 ring-red-100 ring-inset">
                     <TbPlaneInflight className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                     <span className="block font-mono text-[10px] font-bold tracking-[0.3em] text-red-500 uppercase">
                        Gestão Operacional
                     </span>
                     <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                        Operações
                     </h1>
                  </div>
               </div>

               <PermBased resource="operacoes" requiredPerm="create">
                  <Button
                     color="red"
                     onClick={() => setShowForm(true)}
                     className="font-semibold whitespace-nowrap"
                  >
                     <HiPlus className="mr-2 h-4 w-4" />
                     Nova Operação
                  </Button>
               </PermBased>
            </div>
         </header>

         <OperacoesFilters
            value={filters}
            onChange={setFilters}
            counts={counts}
            defaultDates={{
               start: defaults.date_start,
               end: defaults.date_end,
            }}
         />

         {error && (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
               {(error as Error).message}
            </div>
         )}

         {!showSkeleton && (
            <p className="text-xs font-medium text-slate-400">
               {items.length}{" "}
               {items.length === 1
                  ? "operação encontrada"
                  : "operações encontradas"}
            </p>
         )}

         {showSkeleton ? (
            <OperacoesSkeleton />
         ) : items.length === 0 ? (
            <div className="rounded border border-dashed border-slate-300 bg-slate-50 px-4 py-16 text-center">
               <p className="text-sm font-semibold text-slate-600">
                  Nenhuma operação encontrada
               </p>
               <p className="mt-1 text-xs text-slate-400">
                  Ajuste os filtros ou crie uma nova operação.
               </p>
            </div>
         ) : (
            <div
               className={`flex flex-col gap-2.5 transition-opacity ${
                  isFetching ? "opacity-60" : ""
               }`}
            >
               {items.map((op) => (
                  <OperacaoCard key={op.id} op={op} />
               ))}
            </div>
         )}

         <OperacaoFormModal
            show={showForm}
            onClose={() => setShowForm(false)}
            editing={null}
         />
      </div>
   );
}
