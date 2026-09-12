"use client";

import { ReactNode } from "react";
import clsx from "clsx";
import { Button } from "flowbite-react";
import { CrewIndispList } from "services/routes/indisps";
import { IndispBoard } from "./board/IndispBoard";
import { IndispBoardSkeleton } from "./board/IndispBoardSkeleton";
import { LastIndisps } from "./panel/LastIndisps";
import { LastIndispsSkeleton } from "./panel/LastIndispsSkeleton";

interface IndispContentProps {
   isLoading: boolean;
   isError: boolean;
   isFetching: boolean;
   indisps: CrewIndispList[] | undefined;
   dates: Date[];
   onRetry: () => void;
   onShiftDays: (days: number) => void;
   toolbar: ReactNode;
   focusedIso: string | null;
   onFocusDay: (iso: string) => void;
}

/**
 * Painel lateral — largura fixa para a grade ficar com o resto da tela.
 *
 * Só existe a partir de `xl`. As cinco colunas, os gaps e o padding cabem
 * em 320px, inclusive com scrollbar. Crescer no monitor largo só afastava
 * os dados e tirava espaço da grade. O cartão acompanha a altura do conteúdo.
 */
const PAINEL = "hidden min-h-0 shrink-0 items-start xl:flex xl:w-[320px]";

/**
 * Máquina de estados da tela: carga, erro, vazio e conteúdo. A toolbar é a
 * mesma instância nos quatro — trocar de função tem que funcionar inclusive
 * quando a busca falhou.
 */
export function IndispContent({
   isLoading,
   isError,
   isFetching,
   indisps,
   dates,
   onRetry,
   onShiftDays,
   toolbar,
   focusedIso,
   onFocusDay,
}: IndispContentProps) {
   // 1. Primeira carga — espelha o layout de conteúdo (grade + painel lateral).
   if (isLoading) {
      return (
         <div className="flex min-h-0 flex-1 gap-2 overflow-hidden">
            <IndispBoardSkeleton
               dates={dates}
               focusedIso={focusedIso}
               onFocusDay={onFocusDay}
               toolbar={toolbar}
            />
            <div className={PAINEL}>
               <LastIndispsSkeleton />
            </div>
         </div>
      );
   }

   // 2. Erro — com retry.
   if (isError) {
      return (
         <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
            {toolbar}
            <div
               role="alert"
               className="m-auto max-w-md space-y-2 px-4 py-8 text-center"
            >
               <h2 className="text-sm font-semibold text-red-700">
                  Erro ao carregar as indisponibilidades
               </h2>
               <p className="text-xs text-slate-600">
                  Verifique a conexão e tente buscar os dados novamente.
               </p>
               <Button color="light" size="xs" onClick={onRetry}>
                  Tentar novamente
               </Button>
            </div>
         </div>
      );
   }

   // 3. Vazio — função sem tripulantes.
   if (!indisps || indisps.length === 0) {
      return (
         <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
            {toolbar}
            <section
               role="status"
               aria-labelledby="indisp-empty-title"
               className="m-auto max-w-md space-y-2 px-4 py-12 text-center"
            >
               <h2
                  id="indisp-empty-title"
                  className="text-sm font-semibold text-slate-700"
               >
                  Nenhum tripulante ativo nesta função
               </h2>
               <p className="text-xs text-slate-600">
                  Selecione outra função na barra acima para consultar a grade.
               </p>
            </section>
         </div>
      );
   }

   // 4. Conteúdo — refetch esmaece sem bloquear.
   return (
      <div
         aria-busy={isFetching}
         className="flex min-h-0 flex-1 gap-2 overflow-hidden"
      >
         <IndispBoard
            indisps={indisps}
            dates={dates}
            focusedIso={focusedIso}
            onFocusDay={onFocusDay}
            onShiftDays={onShiftDays}
            toolbar={toolbar}
            isFetching={isFetching}
         />
         <div
            className={clsx(
               PAINEL,
               "transition-opacity",
               isFetching && "opacity-50"
            )}
         >
            <LastIndisps indisps={indisps} />
         </div>
      </div>
   );
}
