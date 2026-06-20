"use client";

import { memo } from "react";
import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
   Button,
} from "flowbite-react";
import { HiChevronUp, HiChevronDown } from "react-icons/hi";
import { MdHealthAndSafety } from "react-icons/md";
import clsx from "clsx";
import type { UserCartaoSaude } from "services/routes/aeromedica/cartoesSaude";
import type { SortField, SortDirection } from "../types";
import {
   getDateStatus,
   getStatusConfig,
   formatDate,
   getCemalStatus,
} from "../utils/dateStatus";

// ========================================
// DateCell
// ========================================

const DateCell = memo(function DateCell({
   dateStr,
}: {
   dateStr: string | null | undefined;
}) {
   const status = getDateStatus(dateStr);
   const config = getStatusConfig(status);
   const Icon = config.icon;

   return (
      <div className="flex items-center gap-1.5">
         <Icon className={clsx("h-4 w-4 shrink-0", config.color)} />
         <span className={clsx("text-sm font-medium", config.color)}>
            {formatDate(dateStr)}
         </span>
      </div>
   );
});

// ========================================
// CemalCell
// ========================================

const CemalCell = memo(function CemalCell({
   cemal,
   temAta,
}: {
   cemal: string | null | undefined;
   temAta: boolean | null;
}) {
   const status = getDateStatus(cemal);
   const config = getStatusConfig(status);
   const Icon = config.icon;

   return (
      <div className="flex flex-col gap-0.5">
         <div className="flex items-center gap-1.5">
            <Icon className={clsx("h-4 w-4 shrink-0", config.color)} />
            <span className={clsx("text-sm font-medium", config.color)}>
               {formatDate(cemal)}
            </span>
         </div>
         {temAta === false && (
            <span className="text-[11px] font-medium text-amber-600">
               Sem ata anexada
            </span>
         )}
      </div>
   );
});

// ========================================
// SortableHeader
// ========================================

interface SortableHeaderProps {
   label: string;
   field: SortField;
   currentSort: SortField | null;
   direction: SortDirection;
   onSort: (field: SortField) => void;
}

const SortableHeader = memo(function SortableHeader({
   label,
   field,
   currentSort,
   direction,
   onSort,
}: SortableHeaderProps) {
   const isActive = currentSort === field;

   return (
      <TableHeadCell
         className="cursor-pointer px-4 py-3 font-semibold transition-colors select-none hover:text-gray-900"
         onClick={() => onSort(field)}
         aria-sort={
            isActive
               ? direction === "asc"
                  ? "ascending"
                  : "descending"
               : "none"
         }
      >
         <div className="flex items-center gap-1">
            <span>{label}</span>
            <div className="flex flex-col">
               <HiChevronUp
                  className={clsx(
                     "-mb-1 h-3 w-3",
                     isActive && direction === "asc"
                        ? "text-red-600"
                        : "text-gray-400"
                  )}
               />
               <HiChevronDown
                  className={clsx(
                     "h-3 w-3",
                     isActive && direction === "desc"
                        ? "text-red-600"
                        : "text-gray-400"
                  )}
               />
            </div>
         </div>
      </TableHeadCell>
   );
});

// ========================================
// Dot color map (fora do render)
// ========================================

const DOT_COLORS = {
   valid: "bg-green-500",
   warning: "bg-yellow-400",
   critical: "bg-orange-500",
   expired: "bg-red-500",
   empty: "bg-gray-300",
} as const;

// ========================================
// CartoesSaudeRow
// ========================================

const CartoesSaudeRow = memo(function CartoesSaudeRow({
   item,
   onClick,
}: {
   item: UserCartaoSaude;
   onClick: (item: UserCartaoSaude) => void;
}) {
   const cemalStatus = getCemalStatus(item);
   const dotColor = DOT_COLORS[cemalStatus];

   return (
      <TableRow
         onClick={() => onClick(item)}
         onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") && onClick(item)
         }
         tabIndex={0}
         role="button"
         className="cursor-pointer border-b border-slate-200 transition-colors hover:bg-gray-50"
      >
         <TableCell className="w-10 px-3 py-3">
            <span
               className={clsx("inline-block h-3 w-3 rounded-full", dotColor)}
            />
         </TableCell>
         <TableCell className="px-4 py-3 font-medium whitespace-nowrap text-gray-900 uppercase">
            <p className="font-semibold">
               {item.user.posto.short} {item.user.nome_guerra}
            </p>
         </TableCell>
         <TableCell className="px-4 py-3 font-mono whitespace-nowrap text-gray-600">
            {item.cartao?.prontuario ?? "—"}
         </TableCell>
         <TableCell className="px-4 py-3 whitespace-nowrap">
            <CemalCell cemal={item.cartao?.cemal} temAta={item.cemal_tem_ata} />
         </TableCell>
         <TableCell className="px-4 py-3 whitespace-nowrap">
            <DateCell dateStr={item.cartao?.tovn} />
         </TableCell>
         <TableCell className="px-4 py-3 whitespace-nowrap">
            <DateCell dateStr={item.cartao?.imae} />
         </TableCell>
      </TableRow>
   );
});

// ========================================
// CartoesSaudeTable
// ========================================

interface CartoesSaudeTableProps {
   data: UserCartaoSaude[];
   sortField: SortField | null;
   sortDirection: SortDirection;
   onSort: (field: SortField) => void;
   onRowClick: (item: UserCartaoSaude) => void;
   hasActiveFilters: boolean;
   onClearFilters: () => void;
}

export default function CartoesSaudeTable({
   data,
   sortField,
   sortDirection,
   onSort,
   onRowClick,
   hasActiveFilters,
   onClearFilters,
}: CartoesSaudeTableProps) {
   if (data.length === 0) {
      return (
         <div className="flex h-64 flex-col items-center justify-center">
            <MdHealthAndSafety className="mb-4 h-16 w-16 text-gray-300" />
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
      <div className="overflow-x-auto">
         <Table hoverable>
            <TableHead className="border-b border-slate-200 bg-gray-50 text-xs text-gray-700 uppercase">
               <TableRow>
                  <TableHeadCell className="w-10 px-3 py-3" />
                  <SortableHeader
                     label="Militar"
                     field="militar"
                     currentSort={sortField}
                     direction={sortDirection}
                     onSort={onSort}
                  />
                  <TableHeadCell className="px-4 py-3 font-semibold">
                     Prontuário
                  </TableHeadCell>
                  <SortableHeader
                     label="CEMAL"
                     field="cemal"
                     currentSort={sortField}
                     direction={sortDirection}
                     onSort={onSort}
                  />
                  <SortableHeader
                     label="TOVN"
                     field="tovn"
                     currentSort={sortField}
                     direction={sortDirection}
                     onSort={onSort}
                  />
                  <SortableHeader
                     label="IMAE"
                     field="imae"
                     currentSort={sortField}
                     direction={sortDirection}
                     onSort={onSort}
                  />
               </TableRow>
            </TableHead>
            <TableBody>
               {data.map((item) => (
                  <CartoesSaudeRow
                     key={item.user.id}
                     item={item}
                     onClick={onRowClick}
                  />
               ))}
            </TableBody>
         </Table>
      </div>
   );
}
