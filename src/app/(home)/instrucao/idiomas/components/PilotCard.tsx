"use client";

import clsx from "clsx";
import { memo, useState, useCallback } from "react";
import type { TripIdiomasOut } from "services/routes/instrucao/idiomas";
import type { IdiomStatus } from "../types";
import {
   getIdiomStatus,
   getStatusColors,
   getDiffDays,
   getDaysLabel,
   formatDate,
} from "../utils/idiomaStatus";

// ========================================
// StatusBadge
// ========================================

function StatusBadge({
   label,
   status,
   daysLabel,
}: {
   label: string;
   status: IdiomStatus;
   daysLabel: string;
}) {
   const colors = getStatusColors(status);
   return (
      <span
         className="inline-flex w-44 shrink-0 items-center justify-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium whitespace-nowrap"
         style={{
            backgroundColor: colors.badgeBg,
            border: `0.5px solid ${colors.badgeBorder}`,
            color: colors.text,
         }}
      >
         <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: colors.dot }}
         />
         {label} · {status === "empty" ? "—" : daysLabel}
      </span>
   );
}

// ========================================
// FieldRow
// ========================================

function FieldRow({
   label,
   dateStr,
}: {
   label: string;
   dateStr: string | null | undefined;
}) {
   if (!dateStr) {
      return (
         <div className="flex items-center justify-between border-b border-gray-100 py-1 last:border-0">
            <span className="text-xs text-gray-500">{label}</span>
            <span className="text-xs font-normal text-gray-300">—</span>
         </div>
      );
   }
   const status = getIdiomStatus(dateStr);
   const colors = getStatusColors(status);
   return (
      <div className="flex items-center justify-between border-b border-gray-100 py-1 last:border-0">
         <span className="text-xs text-gray-500">{label}</span>
         <span className="flex items-center gap-1.5 text-xs font-medium">
            <span
               className="inline-block shrink-0 rounded-full"
               style={{ backgroundColor: colors.dot, width: 7, height: 7 }}
            />
            <span className="font-mono text-sm">{formatDate(dateStr)}</span>
            <span className="text-xs text-gray-400">
               ({getDaysLabel(dateStr)})
            </span>
         </span>
      </div>
   );
}

// ========================================
// LangCard
// ========================================

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
// Cor fixa por posição do pip (0=esquerda/A1 → 5=direita/C2)
const PIP_POSITION_COLORS = [
   "#EF9F27",
   "#F5C542",
   "#5DCAA5",
   "#1D9E75",
   "#0E7C5E",
   "#0A5640",
];

function LangCard({
   lang,
   level,
   validity,
}: {
   lang: string;
   level: string | null;
   validity: string | null;
}) {
   if (!level) {
      return (
         <div className="mb-2 rounded-lg bg-gray-50 px-3 py-2.5">
            <div className="text-xs font-medium text-gray-700">{lang}</div>
            <div className="mt-0.5 text-[11px] text-gray-400">
               Não cadastrado
            </div>
         </div>
      );
   }

   const levelIdx = LEVELS.indexOf(level as (typeof LEVELS)[number]);
   const status = getIdiomStatus(validity);
   const colors = getStatusColors(status);

   return (
      <div className="mb-2 rounded-lg bg-gray-50 px-3 py-2.5">
         <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700">{lang}</span>
            <span
               className="rounded px-1.5 py-0.5 text-[11px] font-medium"
               style={{
                  backgroundColor: colors.badgeBg,
                  border: `0.5px solid ${colors.badgeBorder}`,
                  color: colors.text,
               }}
            >
               {level}
            </span>
         </div>
         <div className="mb-1 flex gap-1">
            {PIP_POSITION_COLORS.map((color, i) => (
               <div
                  key={i}
                  className="rounded-[3px]"
                  style={{
                     width: 18,
                     height: 6,
                     backgroundColor: i <= levelIdx ? color : "#e5e7eb",
                  }}
               />
            ))}
         </div>
         <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400">A1 → C2</span>
            {validity && (
               <span className="text-[11px]" style={{ color: colors.text }}>
                  {formatDate(validity)} · {getDaysLabel(validity)}
               </span>
            )}
         </div>
      </div>
   );
}

// ========================================
// PilotCard
// ========================================

interface PilotCardProps {
   pilot: TripIdiomasOut;
   onEdit: (pilot: TripIdiomasOut) => void;
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

   const ptaiStatus = getIdiomStatus(pilot.idiomas?.ptai_validade);
   const taiSStatus = getIdiomStatus(pilot.idiomas?.tai_s_validade);

   return (
      <div
         className={clsx(
            "cursor-pointer rounded-xl border bg-white px-3 py-2 transition-all",
            isExpanded
               ? "border-red-200 shadow-md shadow-red-100"
               : "border-gray-200"
         )}
      >
         {/* Header */}
         <div
            role="button"
            tabIndex={0}
            aria-expanded={isExpanded}
            onClick={toggleExpanded}
            onKeyDown={handleKeyDown}
         >
            <div className="flex items-center gap-3">
               {/* Avatar */}
               <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-[13px] font-medium text-red-600">
                  {pilot.p_g.toUpperCase()}
               </div>

               {/* Info */}
               <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-gray-900">
                     {pilot.nome_guerra.toUpperCase()}
                  </div>
               </div>

               {/* Badges — visíveis apenas em telas maiores */}
               <div className="hidden gap-1.5 sm:flex">
                  <StatusBadge
                     label="PTAI"
                     status={ptaiStatus}
                     daysLabel={getDaysLabel(pilot.idiomas?.ptai_validade)}
                  />
                  <StatusBadge
                     label="TAI S"
                     status={taiSStatus}
                     daysLabel={getDaysLabel(pilot.idiomas?.tai_s_validade)}
                  />
                  <StatusBadge
                     label="TAI S1"
                     status={getIdiomStatus(pilot.idiomas?.tai_s1_validade)}
                     daysLabel={getDaysLabel(pilot.idiomas?.tai_s1_validade)}
                  />
                  <StatusBadge
                     label={`ESP ${pilot.idiomas?.hab_espanhol ?? "—"}`}
                     status={getIdiomStatus(pilot.idiomas?.val_espanhol)}
                     daysLabel={getDaysLabel(pilot.idiomas?.val_espanhol)}
                  />
                  <StatusBadge
                     label={`ING ${pilot.idiomas?.hab_ingles ?? "—"}`}
                     status={getIdiomStatus(pilot.idiomas?.val_ingles)}
                     daysLabel={getDaysLabel(pilot.idiomas?.val_ingles)}
                  />
               </div>

               {/* Expand icon */}
               <span
                  className="shrink-0 text-sm text-gray-400 transition-transform duration-250 ease-in-out"
                  style={{ transform: isExpanded ? "rotate(90deg)" : "" }}
               >
                  ▶
               </span>
            </div>

            {/* Badges — visíveis apenas em telas pequenas, abaixo do nome */}
            <div className="mt-2 flex flex-wrap gap-1.5 pl-12 sm:hidden">
               <StatusBadge
                  label="PTAI"
                  status={ptaiStatus}
                  daysLabel={getDaysLabel(pilot.idiomas?.ptai_validade)}
               />
               <StatusBadge
                  label="TAI S"
                  status={taiSStatus}
                  daysLabel={getDaysLabel(pilot.idiomas?.tai_s_validade)}
               />
               <StatusBadge
                  label="TAI S1"
                  status={getIdiomStatus(pilot.idiomas?.tai_s1_validade)}
                  daysLabel={getDaysLabel(pilot.idiomas?.tai_s1_validade)}
               />
               <StatusBadge
                  label={`ESP ${pilot.idiomas?.hab_espanhol ?? "—"}`}
                  status={getIdiomStatus(pilot.idiomas?.val_espanhol)}
                  daysLabel={getDaysLabel(pilot.idiomas?.val_espanhol)}
               />
               <StatusBadge
                  label={`ING ${pilot.idiomas?.hab_ingles ?? "—"}`}
                  status={getIdiomStatus(pilot.idiomas?.val_ingles)}
                  daysLabel={getDaysLabel(pilot.idiomas?.val_ingles)}
               />
            </div>
         </div>

         {/* Expanded body — grid-rows trick for height animation */}
         <div
            className="grid transition-[grid-template-rows] duration-250 ease-in-out"
            style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}
         >
            <div className="overflow-hidden">
               <div className="mt-3.5 border-t border-gray-100 pt-3.5">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                     {/* Left: Provas e validações */}
                     <div>
                        <div className="mb-2 text-sm font-medium tracking-wider text-gray-500 uppercase">
                           Provas e validações
                        </div>
                        <FieldRow
                           label="PTAI"
                           dateStr={pilot.idiomas?.ptai_validade}
                        />
                        <FieldRow
                           label="TAI S"
                           dateStr={pilot.idiomas?.tai_s_validade}
                        />
                        <FieldRow
                           label="TAI S1"
                           dateStr={pilot.idiomas?.tai_s1_validade}
                        />
                     </div>

                     {/* Right: Habilidades linguísticas */}
                     <div>
                        <div className="mb-2 text-sm font-medium tracking-wider text-gray-500 uppercase">
                           Habilidades linguísticas
                        </div>
                        <LangCard
                           lang="Espanhol"
                           level={pilot.idiomas?.hab_espanhol ?? null}
                           validity={pilot.idiomas?.val_espanhol ?? null}
                        />
                        <LangCard
                           lang="Inglês"
                           level={pilot.idiomas?.hab_ingles ?? null}
                           validity={pilot.idiomas?.val_ingles ?? null}
                        />
                        <div className="mt-3 flex justify-end">
                           <button
                              onClick={(e) => {
                                 e.stopPropagation();
                                 onEdit(pilot);
                              }}
                              className="text-sm text-blue-600 hover:underline"
                           >
                              Editar
                           </button>
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
