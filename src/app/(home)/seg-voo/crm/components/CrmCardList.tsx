"use client";

import { memo } from "react";
import clsx from "clsx";
import type { TripCrmOut } from "services/routes/seg-voo/crm";
import { useFuncoes } from "@/hooks/queries";
import { getDateStatus, getStatusConfig, formatDate } from "@/utils/dateStatus";
import EmptyState from "./EmptyState";

// ========================================
// CrmCard
// ========================================

const CrmCard = memo(function CrmCard({
   item,
   funcLabel,
   funcBadge,
   onClick,
}: {
   item: TripCrmOut;
   funcLabel: string;
   funcBadge: string;
   onClick: (item: TripCrmOut) => void;
}) {
   const status = getDateStatus(item.crm?.data_validade);
   const config = getStatusConfig(status);
   const Icon = config.icon;

   return (
      <div
         role="button"
         tabIndex={0}
         onClick={() => onClick(item)}
         onKeyDown={(e) => {
            if (e.key !== "Enter" && e.key !== " ") return;
            // Espaço rola a página se o default não for barrado.
            e.preventDefault();
            onClick(item);
         }}
         className="flex cursor-pointer overflow-hidden rounded border border-slate-200 bg-white shadow-sm transition-colors pointer-fine:hover:bg-gray-50"
      >
         <span className={clsx("w-1 shrink-0", config.dot)}>
            <span className="sr-only">{`Status: ${config.label}`}</span>
         </span>
         <div className="min-w-0 flex-1 space-y-1.5 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
               <span className="truncate text-sm font-semibold text-gray-900 uppercase">
                  {item.p_g} {item.nome_guerra}
               </span>
               <span className="flex shrink-0 items-center gap-1.5">
                  <span className="font-mono text-xs font-semibold tracking-wide text-slate-500 uppercase">
                     {item.trig}
                  </span>
                  <span
                     className={clsx(
                        "inline-grid w-12 place-items-center rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase ring-1 ring-inset",
                        funcBadge
                     )}
                     title={funcLabel}
                  >
                     {item.func}
                  </span>
               </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-xs">
               <span className="flex items-center gap-1.5">
                  <span className="font-bold tracking-wide text-slate-400">
                     REAL
                  </span>
                  <span className="text-slate-600 tabular-nums">
                     {formatDate(item.crm?.data_realizacao)}
                  </span>
               </span>
               <span className="flex items-center gap-1.5">
                  <span className="font-bold tracking-wide text-slate-400">
                     VAL
                  </span>
                  <span
                     className={clsx(
                        "flex items-center gap-1 font-medium tabular-nums",
                        config.color
                     )}
                  >
                     <Icon className="h-3 w-3 shrink-0" />
                     {formatDate(item.crm?.data_validade)}
                  </span>
               </span>
            </div>
         </div>
      </div>
   );
});

// ========================================
// CrmCardList
// ========================================

interface CrmCardListProps {
   data: TripCrmOut[];
   onCardClick: (item: TripCrmOut) => void;
   hasActiveFilters: boolean;
   searchTerm: string;
}

const CrmCardList = memo(function CrmCardList({
   data,
   onCardClick,
   hasActiveFilters,
   searchTerm,
}: CrmCardListProps) {
   const { label: funcLabel, colors: funcColors } = useFuncoes();

   if (data.length === 0) {
      return (
         <EmptyState
            hasActiveFilters={hasActiveFilters}
            searchTerm={searchTerm}
         />
      );
   }

   return (
      <div className="space-y-2 p-2">
         {data.map((item) => (
            <CrmCard
               key={item.trip_id}
               item={item}
               funcLabel={funcLabel(item.func)}
               funcBadge={funcColors(item.func).badge}
               onClick={onCardClick}
            />
         ))}
      </div>
   );
});

export default CrmCardList;
