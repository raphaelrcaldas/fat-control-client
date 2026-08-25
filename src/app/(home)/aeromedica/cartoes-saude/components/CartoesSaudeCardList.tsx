"use client";

import { memo } from "react";
import { MdAttachFile, MdErrorOutline } from "react-icons/md";
import clsx from "clsx";
import type { UserCartaoSaude } from "services/routes/aeromedica/cartoesSaude";
import {
   getDateStatus,
   getStatusConfig,
   formatDate,
   getWorstStatus,
} from "../utils/dateStatus";
import EmptyState from "./EmptyState";

// ========================================
// DocLine
// ========================================

/** Uma linha "documento: validade" — o que a tabela mostra em colunas, aqui
 *  empilhado para caber em 390px sem rolagem lateral. */
const DocLine = memo(function DocLine({
   tag,
   dateStr,
   children,
}: {
   tag: string;
   dateStr: string | null | undefined;
   children?: React.ReactNode;
}) {
   const status = getDateStatus(dateStr);
   const cfg = getStatusConfig(status);
   const Icon = cfg.icon;

   return (
      <div className="flex items-center gap-1.5 font-mono text-xs">
         <span className="w-12 shrink-0 font-bold tracking-wide text-slate-400">
            {tag}
         </span>
         <span
            className={clsx(
               "flex items-center gap-1 font-medium tabular-nums",
               cfg.color
            )}
         >
            <Icon className="h-3 w-3 shrink-0" />
            {formatDate(dateStr)}
         </span>
         {children}
      </div>
   );
});

// ========================================
// CartaoCard
// ========================================

const CartaoCard = memo(function CartaoCard({
   item,
   onClick,
}: {
   item: UserCartaoSaude;
   onClick: (item: UserCartaoSaude) => void;
}) {
   const config = getStatusConfig(getWorstStatus(item));

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
            <span className="sr-only">{`Situação: ${config.label}`}</span>
         </span>
         <div className="min-w-0 flex-1 space-y-1.5 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
               <span className="truncate text-sm font-semibold text-gray-900 uppercase">
                  {item.user.posto.short} {item.user.nome_guerra}
               </span>
               <span className="shrink-0 font-mono text-xs text-gray-500 tabular-nums">
                  {item.cartao?.prontuario ?? "—"}
               </span>
            </div>
            <DocLine tag="CEMAL" dateStr={item.cartao?.cemal}>
               {item.cemal_tem_ata === false && (
                  <span
                     className="flex items-center gap-0.5 text-amber-700"
                     title="Sem ata anexada"
                  >
                     <MdErrorOutline className="h-3 w-3" aria-hidden />
                     <span className="sr-only">Sem ata anexada</span>
                  </span>
               )}
               {item.cemal_tem_ata === true && (
                  <MdAttachFile
                     className="h-3 w-3 text-slate-400"
                     title="Ata anexada"
                     aria-label="Ata anexada"
                  />
               )}
            </DocLine>
            <DocLine tag="IMAE" dateStr={item.cartao?.imae} />
            <DocLine tag="TOVN" dateStr={item.cartao?.tovn} />
         </div>
      </div>
   );
});

// ========================================
// CartoesSaudeCardList
// ========================================

interface CartoesSaudeCardListProps {
   data: UserCartaoSaude[];
   onCardClick: (item: UserCartaoSaude) => void;
   hasActiveFilters: boolean;
   searchTerm: string;
}

const CartoesSaudeCardList = memo(function CartoesSaudeCardList({
   data,
   onCardClick,
   hasActiveFilters,
   searchTerm,
}: CartoesSaudeCardListProps) {
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
            <CartaoCard key={item.user.id} item={item} onClick={onCardClick} />
         ))}
      </div>
   );
});

export default CartoesSaudeCardList;
