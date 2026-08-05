"use client";

import clsx from "clsx";
import { MdFlightTakeoff } from "react-icons/md";
import type { AeronavePublic } from "services/routes/aeronaves";
import { SITUACOES, type SituacaoValue } from "../schemas/aeronaveSchema";

interface SituacaoSummaryProps {
   aeronaves: AeronavePublic[];
   selectedSituacao: SituacaoValue | null;
   onSelectSituacao: (situacao: SituacaoValue | null) => void;
}

// Botão precisa de foco visível e cursor de clique — sem isso, ao virar
// <button>, o browser não oferece nenhum affordance de interatividade.
const cardButtonBase =
   "w-full cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1";

export function SituacaoSummary({
   aeronaves,
   selectedSituacao,
   onSelectSituacao,
}: SituacaoSummaryProps) {
   // Os números são sempre o agregado da frota inteira — nunca do
   // resultado filtrado. Se encolhessem com o próprio filtro, o card
   // clicado viraria "1 de 1", perdendo o contexto do todo.
   const activeAeronaves = aeronaves.filter((a) => a.active);
   const totalActive = activeAeronaves.length;
   const totalInactive = aeronaves.length - totalActive;

   const counts = SITUACOES.map((situacao) => ({
      ...situacao,
      count: activeAeronaves.filter((a) => a.sit === situacao.value).length,
   }));

   return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
         {/* Total — funciona como "limpar filtro" */}
         <button
            type="button"
            onClick={() => onSelectSituacao(null)}
            aria-pressed={selectedSituacao === null}
            // O rótulo visível é a métrica ("Ativas"), mas a ação é limpar o
            // filtro e mostrar a frota inteira — inclusive as inativas. O
            // nome acessível PRECISA começar pelo texto visível (WCAG 2.5.3,
            // "Label in Name"), senão comando de voz por "Ativas" não acha o
            // botão e o leitor de tela anuncia algo que não está na tela.
            aria-label="Ativas: mostrar toda a frota"
            title="Mostrar toda a frota"
            className={clsx(
               cardButtonBase,
               "flex items-center justify-between rounded border px-3 py-2.5 shadow-sm transition-colors",
               selectedSituacao === null
                  ? "border-primary-500 ring-primary-600 bg-primary-50 ring-2"
                  : "border-slate-200 bg-white hover:border-slate-300"
            )}
         >
            <div className="min-w-0">
               <p className="text-[11px] font-medium tracking-wide text-gray-600 uppercase">
                  Ativas
               </p>
               <p className="mt-0.5 text-2xl font-semibold text-gray-900">
                  {totalActive}
                  {totalInactive > 0 && (
                     <span className="ml-1 text-sm font-normal text-gray-600">
                        / {aeronaves.length}
                     </span>
                  )}
               </p>
            </div>
            <MdFlightTakeoff className="h-5 w-5 shrink-0 text-gray-400" />
         </button>

         {/* Per situation */}
         {counts.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedSituacao === item.value;
            return (
               <button
                  type="button"
                  key={item.value}
                  onClick={() =>
                     onSelectSituacao(isSelected ? null : item.value)
                  }
                  aria-pressed={isSelected}
                  className={clsx(
                     cardButtonBase,
                     "relative flex items-center justify-between overflow-hidden rounded border px-3 py-2.5 shadow-sm transition-colors",
                     // O anel (>=3:1 sobre branco) é o que sustenta o estado
                     // selecionado: só a borda colorida dava 2,47:1 no verde,
                     // abaixo do mínimo de indicador de estado (WCAG 1.4.11).
                     // O `font-bold` na contagem soma um canal não-cromático,
                     // para não depender de matiz.
                     isSelected
                        ? [item.selected, "ring-2", item.ring]
                        : "border-slate-200 bg-white hover:border-slate-300"
                  )}
               >
                  <span
                     className={`absolute top-0 bottom-0 left-0 w-1 ${item.accent}`}
                     aria-hidden="true"
                  />
                  <div className="min-w-0 pl-1">
                     <p className="text-[11px] font-medium tracking-wide text-gray-600 uppercase">
                        {item.labelPlural}
                     </p>
                     <p
                        className={clsx(
                           "mt-0.5 text-2xl text-gray-900",
                           isSelected ? "font-bold" : "font-semibold"
                        )}
                     >
                        {item.count}
                     </p>
                  </div>
                  <Icon className={`h-5 w-5 shrink-0 ${item.iconColor}`} />
               </button>
            );
         })}
      </div>
   );
}
