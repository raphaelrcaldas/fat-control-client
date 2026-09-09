"use client";

import { Button, ButtonGroup, Label, Select } from "flowbite-react";
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
 * As quatro setas antigas (dia e mês) saíram quando a navegação virou arrasto.
 * Este par voltou por um motivo específico: o arrasto não se anuncia — não há
 * texto, não há botão, e no tablet nem cursor existe para mudar para mãozinha.
 * O botão ENSINA o gesto (clica, vê a grade deslizar, entende que a superfície
 * se move) além de servir a quem prefere clicar. O passo é de uma semana; o
 * dia a dia continua no arrasto e nas setas do teclado.
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
   return (
      <div className="flex shrink-0 flex-col gap-2 border-b border-slate-200 px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
         <div className="flex min-w-0 items-center gap-2">
            <Label htmlFor="indisp-func" className="shrink-0 text-sm">
               Função
            </Label>
            <Select
               id="indisp-func"
               className="min-w-0 flex-1 sm:w-40 sm:flex-none"
               value={func}
               disabled={funcOptions.length === 0}
               onChange={(e) => onFuncChange(e.target.value)}
            >
               {funcOptions.map((f) => (
                  <option key={f.value} value={f.value}>
                     {f.label}
                  </option>
               ))}
            </Select>
         </div>

         <ButtonGroup
            className="grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:flex sm:w-auto"
            aria-label="Navegação do período"
         >
            <Button
               color="light"
               size="sm"
               className="pointer-coarse:min-h-[44px]"
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
            <Button
               color="primary"
               size="sm"
               className="pointer-coarse:min-h-[44px]"
               onClick={onToday}
            >
               Hoje
            </Button>
            <Button
               color="light"
               size="sm"
               className="pointer-coarse:min-h-[44px]"
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
