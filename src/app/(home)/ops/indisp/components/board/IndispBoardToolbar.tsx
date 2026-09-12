"use client";

import { useEffect, useRef } from "react";
import { Button, ButtonGroup } from "flowbite-react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

interface FuncOption {
   value: string;
   label: string;
}

interface IndispBoardToolbarProps {
   func: string;
   funcOptions: FuncOption[];
   onFuncChange: (func: string) => void;
   onToday: () => void;
   onShiftDays: (days: number) => void;
   canBack: boolean;
   canForward: boolean;
}

/** Passo das setas: uma semana — a janela tem de 7 a 21 dias. */
const PASSO = 7;

/**
 * Controles da grade.
 *
 * No celular, apenas os chips de função: o arrasto navega no tempo.
 * Nas telas maiores, Hoje e as setas de semana continuam disponíveis.
 */
export function IndispBoardToolbar({
   func,
   funcOptions,
   onFuncChange,
   onToday,
   onShiftDays,
   canBack,
   canForward,
}: IndispBoardToolbarProps) {
   const selectedChip = useRef<HTMLButtonElement>(null);

   useEffect(() => {
      selectedChip.current?.scrollIntoView({
         block: "nearest",
         inline: "nearest",
      });
   }, [func, funcOptions]);

   return (
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-200 px-3 py-2 sm:gap-3">
         <div
            role="group"
            aria-label="Função"
            className="flex min-w-0 flex-1 [scrollbar-width:none] items-center gap-1.5 overflow-x-auto"
         >
            {funcOptions.map((f) => (
               <Button
                  key={f.value}
                  ref={func === f.value ? selectedChip : undefined}
                  type="button"
                  size="sm"
                  color={func === f.value ? "primary" : "light"}
                  aria-pressed={func === f.value}
                  title={f.label}
                  onClick={() => onFuncChange(f.value)}
                  className="shrink-0 rounded px-3 font-semibold uppercase focus:ring-2 focus:ring-inset"
               >
                  {f.value}
               </Button>
            ))}
         </div>

         <ButtonGroup
            className="hidden shrink-0 sm:flex"
            aria-label="Navegação do período"
         >
            <Button
               color="light"
               size="sm"
               disabled={!canBack}
               onClick={() => onShiftDays(-PASSO)}
               aria-label={
                  canBack
                     ? "Mostrar semana anterior"
                     : "Semana anterior indisponível: início da janela carregada"
               }
               title={
                  canBack
                     ? "Semana anterior"
                     : "Início da janela carregada alcançado"
               }
            >
               <HiChevronLeft className="h-4 w-4" aria-hidden />
            </Button>
            <Button color="primary" size="sm" onClick={onToday}>
               Hoje
            </Button>
            <Button
               color="light"
               size="sm"
               disabled={!canForward}
               onClick={() => onShiftDays(PASSO)}
               aria-label={
                  canForward
                     ? "Mostrar próxima semana"
                     : "Próxima semana indisponível: fim da janela carregada"
               }
               title={
                  canForward
                     ? "Próxima semana"
                     : "Fim da janela carregada alcançado"
               }
            >
               <HiChevronRight className="h-4 w-4" aria-hidden />
            </Button>
         </ButtonGroup>
      </div>
   );
}
