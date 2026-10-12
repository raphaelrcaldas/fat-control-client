"use client";

import { memo } from "react";
import clsx from "clsx";
import { isoDateToString } from "@/../utils/dateHandler";
import type { UserCartaoSaude } from "services/routes/aeromedica/cartoesSaude";
import {
   getDateStatus,
   getStatusConfig,
   getWorstStatus,
} from "../utils/dateStatus";
import EmptyState from "./EmptyState";

// ========================================
// DocItem
// ========================================

/** "documento ✓ validade" — o que a tabela mostra em colunas, aqui os três
 *  numa linha só do card. A data vai em DD/MM/AA: com o ano inteiro os três
 *  nao cabem em 360px. */
const DocItem = memo(function DocItem({
   tag,
   dateStr,
}: {
   tag: string;
   dateStr: string | null | undefined;
}) {
   const status = getDateStatus(dateStr);
   const cfg = getStatusConfig(status);
   const Icon = cfg.icon;

   return (
      <span className="flex items-center gap-1 font-mono text-xs whitespace-nowrap">
         {/* slate-500, não 400: o 400 reprova contraste AA sobre branco. */}
         <span className="font-bold tracking-wide text-slate-500">{tag}</span>
         <span
            className={clsx(
               "flex items-center gap-1 font-medium tabular-nums",
               cfg.color
            )}
         >
            <Icon className="h-3 w-3 shrink-0" />
            {dateStr ? isoDateToString(dateStr) : "—"}
         </span>
      </span>
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
            {/* Os três documentos numa linha. A ata não aparece no card: o
                aviso fica na tabela e no drawer, e o filtro "Sem ata"
                continua valendo no celular. Cabe a partir de ~340px (medido
                em 360 e 412); o `flex-wrap` só age abaixo disso, onde o
                `overflow-hidden` do card cortaria a data do TOVN. */}
            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
               <DocItem tag="CEMAL" dateStr={item.cartao?.cemal} />
               <DocItem tag="IMAE" dateStr={item.cartao?.imae} />
               <DocItem tag="TOVN" dateStr={item.cartao?.tovn} />
            </div>
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
