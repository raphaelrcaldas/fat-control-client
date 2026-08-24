"use client";

import { memo } from "react";
import { Button } from "flowbite-react";
import { FaPassport } from "react-icons/fa";
import clsx from "clsx";
import type { TripPassaporteOut } from "services/routes/inteligencia/passaportes";
import {
   getDateStatus,
   getStatusConfig,
   formatDate,
   getWorstStatus,
} from "../utils/dateStatus";
import { LocalBadge } from "./LocalBadge";

// ========================================
// DocLine
// ========================================

/** Uma linha "documento: número · validade" — o que a tabela mostra em duas
 *  colunas, aqui empilhado para caber em 390px sem rolagem lateral. */
const DocLine = memo(function DocLine({
   tag,
   numero,
   dateStr,
}: {
   tag: string;
   numero: string | null | undefined;
   dateStr: string | null | undefined;
}) {
   const status = getDateStatus(dateStr);
   const cfg = getStatusConfig(status);
   const Icon = cfg.icon;

   return (
      <div className="flex items-center gap-1.5 font-mono text-xs">
         <span className="w-14 shrink-0 font-bold tracking-wide text-slate-400">
            {tag}
         </span>
         {numero ? (
            <span className="font-semibold text-slate-600">{numero}</span>
         ) : (
            <span className="text-gray-400">—</span>
         )}
         {status !== "empty" && (
            <>
               <span className="text-slate-300">·</span>
               <span
                  className={clsx(
                     "flex items-center gap-1 font-medium",
                     cfg.color
                  )}
               >
                  <Icon className="h-3 w-3 shrink-0" />
                  {formatDate(dateStr)}
               </span>
            </>
         )}
      </div>
   );
});

// ========================================
// PassaporteCard
// ========================================

const PassaporteCard = memo(function PassaporteCard({
   item,
   onClick,
}: {
   item: TripPassaporteOut;
   onClick: (item: TripPassaporteOut) => void;
}) {
   const worst = getWorstStatus(
      item.passaporte?.validade_passaporte,
      item.passaporte?.validade_visa
   );
   const config = getStatusConfig(worst);

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
         className="flex cursor-pointer overflow-hidden rounded border border-slate-200 bg-white shadow-sm transition-colors hover:bg-gray-50"
      >
         <span className={clsx("w-1 shrink-0", config.dot)}>
            <span className="sr-only">{`Status: ${config.label}`}</span>
         </span>
         <div className="min-w-0 flex-1 space-y-1.5 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
               <span className="truncate text-sm font-semibold text-gray-900 uppercase">
                  {item.p_g} {item.nome_guerra}
               </span>
               {item.passaporte && (
                  <LocalBadge local={item.passaporte.local_passaporte} />
               )}
            </div>
            <DocLine
               tag="PASSAP"
               numero={item.passaporte?.passaporte}
               dateStr={item.passaporte?.validade_passaporte}
            />
            <DocLine
               tag="VISTO"
               numero={item.passaporte?.visa}
               dateStr={item.passaporte?.validade_visa}
            />
         </div>
      </div>
   );
});

// ========================================
// PassaportesCardList
// ========================================

interface PassaportesCardListProps {
   data: TripPassaporteOut[];
   onCardClick: (item: TripPassaporteOut) => void;
   hasActiveFilters: boolean;
   onClearFilters: () => void;
}

const PassaportesCardList = memo(function PassaportesCardList({
   data,
   onCardClick,
   hasActiveFilters,
   onClearFilters,
}: PassaportesCardListProps) {
   if (data.length === 0) {
      return (
         <div className="flex h-64 flex-col items-center justify-center">
            <FaPassport className="mb-4 h-16 w-16 text-gray-300" />
            <p className="text-lg font-medium text-gray-500">
               Nenhum resultado encontrado
            </p>
            {hasActiveFilters && (
               <Button
                  size="xs"
                  color="light"
                  onClick={onClearFilters}
                  className="mt-2"
               >
                  Limpar filtros
               </Button>
            )}
         </div>
      );
   }

   return (
      <div className="space-y-2 p-2">
         {data.map((item) => (
            <PassaporteCard
               key={item.trip_id}
               item={item}
               onClick={onCardClick}
            />
         ))}
      </div>
   );
});

export default PassaportesCardList;
