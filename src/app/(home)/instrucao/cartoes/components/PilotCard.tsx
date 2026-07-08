"use client";

import clsx from "clsx";
import { memo, useState, useCallback } from "react";
import { Button } from "flowbite-react";
import { HiChevronRight, HiPencil } from "react-icons/hi";
import type { TripCartoesOut } from "services/routes/instrucao/cartoes";
import { PROVA_FIELDS, LANG_FIELDS } from "../cartoes.config";
import { getCartaoStatus, getDaysLabel } from "../utils/cartaoStatus";
import StatusBadge from "./StatusBadge";
import FieldRow from "./FieldRow";
import LangCard from "./LangCard";

interface PilotCardProps {
   pilot: TripCartoesOut;
   onEdit: (pilot: TripCartoesOut) => void;
}

const PilotCard = memo(function PilotCard({ pilot, onEdit }: PilotCardProps) {
   const [isExpanded, setIsExpanded] = useState(false);

   const toggleExpanded = useCallback(() => setIsExpanded((v) => !v), []);

   const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
         if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleExpanded();
         }
      },
      [toggleExpanded]
   );

   const cartao = pilot.cartao;

   // Faixa de badges — provas seguidas dos idiomas, mesma lista nas duas
   // quebras (desktop / mobile). Deriva das mesmas fontes do corpo expandido.
   const badges = [
      ...PROVA_FIELDS.map((f) => {
         const validade = f.validade(cartao);
         return (
            <StatusBadge
               key={f.key}
               label={f.label}
               status={getCartaoStatus(validade)}
               daysLabel={getDaysLabel(validade)}
            />
         );
      }),
      ...LANG_FIELDS.map((f) => {
         const validade = f.validity(cartao);
         const level = f.level(cartao);
         return (
            <StatusBadge
               key={f.key}
               label={`${f.abbr} ${level ?? "—"}`}
               status={getCartaoStatus(validade)}
               daysLabel={getDaysLabel(validade)}
            />
         );
      }),
   ];

   return (
      <div
         className={clsx(
            "rounded border bg-white px-3 py-2 transition-all",
            isExpanded ? "border-red-300 shadow" : "border-slate-200 shadow-sm"
         )}
      >
         {/* Header */}
         <div
            role="button"
            tabIndex={0}
            aria-expanded={isExpanded}
            onClick={toggleExpanded}
            onKeyDown={handleKeyDown}
            className="cursor-pointer"
         >
            <div className="flex items-center gap-3">
               {/* Avatar */}
               <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-[13px] font-medium text-red-600">
                  {pilot.p_g.toUpperCase()}
               </div>

               {/* Info — min-w garante que o nome de guerra (fundamental)
                   nunca seja espremido pelas badges em telas médias. */}
               <div className="min-w-28 flex-1">
                  <div className="text-sm font-medium text-gray-900">
                     {pilot.nome_guerra.toUpperCase()}
                  </div>
               </div>

               {/* Badges — visíveis apenas em telas maiores.
                   min-w-0 + flex-wrap deixam a faixa encolher e quebrar,
                   preservando o espaço do nome de guerra. */}
               <div className="hidden min-w-0 flex-wrap justify-end gap-1.5 md:flex">
                  {badges}
               </div>

               {/* Expand icon */}
               <HiChevronRight
                  className={clsx(
                     "h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ease-in-out",
                     isExpanded && "rotate-90"
                  )}
               />
            </div>

            {/* Badges — visíveis apenas em telas pequenas, abaixo do nome */}
            <div className="mt-2 flex flex-wrap gap-1.5 pl-12 md:hidden">
               {badges}
            </div>
         </div>

         {/* Expanded body — grid-rows trick for height animation */}
         <div
            className="grid transition-[grid-template-rows] duration-250 ease-in-out"
            style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}
         >
            <div className="overflow-hidden">
               <div className="mt-3.5 border-t border-slate-100 pt-3.5">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                     {/* Left: Provas e validações */}
                     <div>
                        <div className="mb-2 text-sm font-medium tracking-wider text-gray-500 uppercase">
                           Provas e validações
                        </div>
                        {PROVA_FIELDS.map((f) => (
                           <FieldRow
                              key={f.key}
                              label={f.label}
                              dateStr={f.validade(cartao)}
                           />
                        ))}
                     </div>

                     {/* Right: Habilidades linguísticas */}
                     <div>
                        <div className="mb-2 text-sm font-medium tracking-wider text-gray-500 uppercase">
                           Habilidades linguísticas
                        </div>
                        <div className="space-y-2">
                           {LANG_FIELDS.map((f) => (
                              <LangCard
                                 key={f.key}
                                 lang={f.lang}
                                 level={f.level(cartao)}
                                 validity={f.validity(cartao)}
                              />
                           ))}
                        </div>
                        <div className="mt-3 flex justify-end">
                           <Button
                              size="xs"
                              color="light"
                              onClick={(e) => {
                                 e.stopPropagation();
                                 onEdit(pilot);
                              }}
                           >
                              <HiPencil className="mr-1.5 h-3.5 w-3.5" />
                              Editar
                           </Button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
});

export default PilotCard;
