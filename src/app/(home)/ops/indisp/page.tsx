"use client";

import { ReactNode } from "react";
import clsx from "clsx";
import { usePersistedState } from "@/hooks/usePersistedState";
import { useCrewIndisps } from "@/hooks/queries";
import { FUNC_LABELS_SHORT, FUNCOES_PRINCIPAIS } from "@/constants/tripulantes";
import { CrewIndispList } from "services/routes/indisps";
import { IndispModalProvider } from "./context/indispModalContext";
import { IndispModal } from "./components/IndispModal";
import { IndispFormHost } from "./components/IndispFormHost";
import { IndispHeader } from "./components/IndispHeader";
import { IndispControls } from "./components/IndispControls";
import { ColorLegend } from "./components/ColorLegend";
import { IndispTable } from "./components/IndispTable";
import { IndispTableSkeleton } from "./components/IndispTableSkeleton";
import { LastIndisps } from "./components/LastIndisps";
import { LastIndispsSkeleton } from "./components/LastIndispsSkeleton";
import { useDateNavigation } from "./hooks/useDateNavigation";

const funcOptions = FUNCOES_PRINCIPAIS.map((f) => ({
   value: f,
   label: FUNC_LABELS_SHORT[f],
}));

export default function IndispPage() {
   const [indispFunc, setIndispFunc] = usePersistedState(
      "indisp.indispFunc",
      "mc"
   );

   const { dates, shift, goToday, canBack, canForward, windowFrom, windowTo } =
      useDateNavigation();

   const {
      data: indisps,
      isLoading,
      isError,
      isFetching,
      refetch,
   } = useCrewIndisps(indispFunc, windowFrom, windowTo);

   return (
      <IndispModalProvider>
         <div className="flex flex-1 flex-col overflow-hidden">
            <IndispHeader />

            <IndispContent
               isLoading={isLoading}
               isError={isError}
               isFetching={isFetching}
               indisps={indisps}
               dates={dates}
               onRetry={refetch}
               controls={
                  <IndispControls
                     func={indispFunc}
                     funcOptions={funcOptions}
                     onFuncChange={setIndispFunc}
                     onShift={shift}
                     onToday={goToday}
                     canBack={canBack}
                     canForward={canForward}
                  />
               }
            />
         </div>
         <IndispModal indisps={indisps} />
         <IndispFormHost />
      </IndispModalProvider>
   );
}

interface IndispContentProps {
   isLoading: boolean;
   isError: boolean;
   isFetching: boolean;
   indisps: CrewIndispList[] | undefined;
   dates: Date[];
   onRetry: () => void;
   controls: ReactNode;
}

function IndispContent({
   isLoading,
   isError,
   isFetching,
   indisps,
   dates,
   onRetry,
   controls,
}: IndispContentProps) {
   // 1. Primeira carga — espelha o layout de conteúdo (tabela + painel lateral).
   if (isLoading) {
      return (
         <div className="flex min-h-0 flex-1 overflow-hidden">
            <div className="flex min-h-0 flex-1 justify-between gap-2">
               <IndispTableSkeleton
                  cols={dates.length}
                  controls={controls}
                  legend={<ColorLegend />}
               />
               <div className="hidden flex-1 justify-center lg:grid">
                  <LastIndispsSkeleton />
               </div>
            </div>
         </div>
      );
   }

   // 2. Erro — com retry (controles no topo para trocar de função).
   if (isError) {
      return (
         <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
            {controls}
            <div className="m-auto max-w-md rounded border border-rose-200 bg-rose-50 px-4 py-8 text-center">
               <p className="text-sm font-semibold text-rose-700">
                  Erro ao carregar as indisponibilidades
               </p>
               <button
                  type="button"
                  onClick={onRetry}
                  className="mt-2 text-xs font-semibold text-rose-600 underline"
               >
                  Tentar novamente
               </button>
            </div>
         </div>
      );
   }

   // 3. Vazio — função sem tripulantes (controles no topo para trocar).
   if (!indisps || indisps.length === 0) {
      return (
         <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
            {controls}
            <div className="m-auto max-w-md rounded border border-dashed border-slate-300 bg-slate-50 px-4 py-12 text-center">
               <p className="text-sm font-semibold text-slate-600">
                  Nenhuma indisponibilidade para esta função
               </p>
               <p className="mt-1 text-xs text-slate-400">
                  Troque a função ou o período para ver os registros.
               </p>
            </div>
         </div>
      );
   }

   // 4. Conteúdo — controles e legenda dentro do card; refetch esmaece sem bloquear.
   return (
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
         <div
            aria-busy={isFetching}
            className={clsx(
               "flex min-h-0 flex-1 justify-between gap-2 transition-opacity duration-200",
               isFetching && "pointer-events-none opacity-50"
            )}
         >
            <IndispTable
               indisps={indisps}
               dates={dates}
               controls={controls}
               legend={<ColorLegend />}
            />
            <div className="hidden flex-1 justify-center lg:grid">
               <LastIndisps indisps={indisps} />
            </div>
         </div>
      </div>
   );
}
