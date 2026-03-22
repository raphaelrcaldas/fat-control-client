"use client";

import { memo } from "react";
import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
   Spinner,
} from "flowbite-react";
import { HiChevronUp, HiChevronDown } from "react-icons/hi";
import { FaPassport } from "react-icons/fa";
import clsx from "clsx";
import type { TripPassaporteOut } from "services/routes/inteligencia/passaportes";
import type { SortField, SortDirection } from "../types";
import {
   getDateStatus,
   getStatusConfig,
   formatDate,
   getDaysRemaining,
   getWorstStatus,
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
         {status !== "empty" && (
            <span className={clsx("text-xs", config.color)}>
               ({getDaysRemaining(dateStr)})
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
// Dot color map
// ========================================

const DOT_COLORS = {
   valid: "bg-green-500",
   warning: "bg-yellow-400",
   critical: "bg-orange-500",
   expired: "bg-red-500",
   empty: "bg-gray-300",
} as const;

// ========================================
// PassaporteRow
// ========================================

const PassaporteRow = memo(function PassaporteRow({
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
   const dotColor = DOT_COLORS[worst];

   return (
      <TableRow
         onClick={() => onClick(item)}
         onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") && onClick(item)
         }
         tabIndex={0}
         role="button"
         className="cursor-pointer border-b border-gray-200 transition-colors hover:bg-red-50"
      >
         <TableCell className="w-10 px-3 py-3">
            <span
               className={clsx("inline-block h-3 w-3 rounded-full", dotColor)}
            />
         </TableCell>
         <TableCell className="px-4 py-3 font-medium whitespace-nowrap text-gray-900 uppercase">
            <p className="font-semibold">
               {item.p_g} {item.nome_guerra}
            </p>
         </TableCell>
         <TableCell className="px-4 py-3 whitespace-nowrap">
            <span className="text-sm text-gray-700 font-semibold">
               {item.passaporte?.passaporte || "---"}
            </span>
         </TableCell>
         <TableCell className="px-4 py-3 whitespace-nowrap">
            <DateCell dateStr={item.passaporte?.validade_passaporte} />
         </TableCell>
         <TableCell className="px-4 py-3 whitespace-nowrap">
            <DateCell dateStr={item.passaporte?.validade_visa} />
         </TableCell>
      </TableRow>
   );
});

// ========================================
// PassaportesTable
// ========================================

interface PassaportesTableProps {
   data: TripPassaporteOut[];
   isLoading: boolean;
   sortField: SortField | null;
   sortDirection: SortDirection;
   onSort: (field: SortField) => void;
   onRowClick: (item: TripPassaporteOut) => void;
   hasActiveFilters: boolean;
   onClearFilters: () => void;
}

const PassaportesTable = memo(function PassaportesTable({
   data,
   isLoading,
   sortField,
   sortDirection,
   onSort,
   onRowClick,
   hasActiveFilters,
   onClearFilters,
}: PassaportesTableProps) {
   if (isLoading) {
      return (
         <div className="flex h-64 items-center justify-center">
            <Spinner color="failure" size="xl" />
         </div>
      );
   }

   if (data.length === 0) {
      return (
         <div className="flex h-64 flex-col items-center justify-center">
            <FaPassport className="mb-4 h-16 w-16 text-gray-300" />
            <p className="text-lg font-medium text-gray-500">
               Nenhum resultado encontrado
            </p>
            {hasActiveFilters && (
               <button
                  onClick={onClearFilters}
                  className="mt-2 text-sm text-red-600 hover:text-red-700"
               >
                  Limpar filtros
               </button>
            )}
         </div>
      );
   }

   return (
      <div className="overflow-x-auto">
         <Table hoverable>
            <TableHead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-700 uppercase">
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
                     Nº Passaporte
                  </TableHeadCell>
                  <SortableHeader
                     label="Validade Passaporte"
                     field="validade_passaporte"
                     currentSort={sortField}
                     direction={sortDirection}
                     onSort={onSort}
                  />
                  <SortableHeader
                     label="Validade VISA"
                     field="validade_visa"
                     currentSort={sortField}
                     direction={sortDirection}
                     onSort={onSort}
                  />
               </TableRow>
            </TableHead>
            <TableBody>
               {data.map((item) => (
                  <PassaporteRow
                     key={item.trip_id}
                     item={item}
                     onClick={onRowClick}
                  />
               ))}
            </TableBody>
         </Table>
      </div>
   );
});

export default PassaportesTable;
