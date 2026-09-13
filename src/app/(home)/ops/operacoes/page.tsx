"use client";

import { useMemo, useState } from "react";
import { Button } from "flowbite-react";
import { HiPlus, HiOutlineRefresh } from "react-icons/hi";
import { TbPlaneInflight } from "react-icons/tb";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import { useOperacoes } from "@/hooks/queries/useOperacoes";
import { PermBased } from "../../hooks/usePermBased";
import { OperacoesTable } from "./components/OperacoesTable";
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

   const { data, isLoading, isFetching, error, refetch } = useOperacoes(params);

   const items = data?.items ?? [];
   const counts = data?.counts ?? EMPTY_COUNTS;
   const showSkeleton = isLoading || (isFetching && !data);

   // Busca/tipo/período em uso: muda a saída do vazio — quem filtrou quer
   // limpar, não criar.
   const filtrando =
      filters.q.trim().length > 0 ||
      filters.tipo !== null ||
      filters.status !== null ||
      filters.date_start !== defaults.date_start ||
      filters.date_end !== defaults.date_end;

   return (
      <div className="flex flex-col space-y-2">
         {/* Masthead — referência canônica de cabeçalho do sistema */}
         <header className="relative overflow-hidden rounded border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
            {/* Espinha vermelha — ecoa a espinha das linhas */}
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
                        Gestão Operacional
                     </span>
                     <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                        Operações
                     </h1>
                  </div>
               </div>

               <PermBased resource="ops.operacoes" requiredPerm="create">
                  <Button
                     color="primary"
                     onClick={() => setShowForm(true)}
                     className="font-semibold whitespace-nowrap"
                  >
                     <HiPlus className="mr-2 h-4 w-4" />
                     Nova Operação
                  </Button>
               </PermBased>
            </div>
         </header>

         {/* Superfície única: trilho de status, filtros e tabela. A tabela não
             leva moldura própria — card dentro de card rouba a largura que
             falta às colunas. */}
         <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
            <OperacoesFilters
               value={filters}
               onChange={setFilters}
               counts={counts}
               defaultDates={{
                  start: defaults.date_start,
                  end: defaults.date_end,
               }}
            />

            {showSkeleton ? (
               <OperacoesSkeleton />
            ) : error ? (
               /* Erro e vazio são estados diferentes: mostrar "nenhuma
                  operação" quando a consulta falhou faz concluir que não há
                  operação quando na verdade não se sabe. */
               <div
                  role="alert"
                  className="flex flex-col items-center gap-1 px-6 py-12 text-center"
               >
                  <p className="text-sm font-semibold text-red-800">
                     Não foi possível carregar as operações
                  </p>
                  <p className="text-xs text-slate-500">
                     {(error as Error).message}
                  </p>
                  <Button
                     color="light"
                     size="sm"
                     className="mt-3"
                     onClick={() => refetch()}
                  >
                     <HiOutlineRefresh className="mr-2 h-4 w-4" />
                     Tentar novamente
                  </Button>
               </div>
            ) : items.length === 0 ? (
               <div className="flex flex-col items-center gap-1 px-6 py-12 text-center">
                  <TbPlaneInflight
                     aria-hidden
                     className="mb-2 h-7 w-7 text-slate-300"
                  />
                  {filtrando ? (
                     <>
                        <p className="text-sm font-semibold text-slate-700">
                           Nenhuma operação encontrada
                        </p>
                        <p className="text-xs text-slate-500">
                           A busca cobre nome e documento de referência.
                        </p>
                        <Button
                           color="light"
                           size="sm"
                           className="mt-3"
                           onClick={() => setFilters(defaults)}
                        >
                           Limpar filtros
                        </Button>
                     </>
                  ) : (
                     <>
                        <p className="text-sm font-semibold text-slate-700">
                           Nenhuma operação no período
                        </p>
                        <p className="text-xs text-slate-500">
                           Amplie o período ou crie a primeira operação.
                        </p>
                     </>
                  )}
               </div>
            ) : (
               <div
                  className={
                     isFetching ? "opacity-60 transition-opacity" : undefined
                  }
               >
                  <OperacoesTable items={items} />
               </div>
            )}
         </div>

         <OperacaoFormModal
            show={showForm}
            onClose={() => setShowForm(false)}
            editing={null}
         />
      </div>
   );
}
