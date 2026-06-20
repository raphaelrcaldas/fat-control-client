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
import { MdGroups } from "react-icons/md";
import clsx from "clsx";
import type { TripCrmOut } from "services/routes/seg-voo/crm";
import type { SortField, SortDirection } from "../types";
import {
   getDateStatus,
   getStatusConfig,
   formatDate,
   getDaysRemaining,
} from "@/utils/dateStatus";

const SimpleDateCell = memo(function SimpleDateCell({
   dateStr,
}: {
   dateStr: string | null | undefined;
}) {
   return <span className="text-sm text-gray-700">{formatDate(dateStr)}</span>;
});

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

const CrmRow = memo(function CrmRow({
   item,
   onClick,
}: {
   item: TripCrmOut;
   onClick: (item: TripCrmOut) => void;
}) {
   const status = getDateStatus(item.crm?.data_validade);
   const config = getStatusConfig(status);

   return (
      <TableRow
         onClick={() => onClick(item)}
         onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") && onClick(item)
         }
         tabIndex={0}
         role="button"
         className="cursor-pointer border-b border-slate-200 transition-colors hover:bg-red-50"
      >
         <TableCell className="w-10 px-3 py-3">
            <span
               className={clsx("inline-block h-3 w-3 rounded-full", config.dot)}
               aria-label={`Status: ${config.label}`}
            />
         </TableCell>
         <TableCell className="px-4 py-3 font-medium whitespace-nowrap text-gray-900 uppercase">
            <p className="font-semibold">
               {item.p_g} {item.nome_guerra}
            </p>
         </TableCell>
         <TableCell className="px-4 py-3 whitespace-nowrap">
            <SimpleDateCell dateStr={item.crm?.data_realizacao} />
         </TableCell>
         <TableCell className="px-4 py-3 whitespace-nowrap">
            <DateCell dateStr={item.crm?.data_validade} />
         </TableCell>
      </TableRow>
   );
});

interface CrmTableProps {
   data: TripCrmOut[];
   sortField: SortField | null;
   sortDirection: SortDirection;
   onSort: (field: SortField) => void;
   onRowClick: (item: TripCrmOut) => void;
   hasActiveFilters: boolean;
   onClearFilters: () => void;
}

const CrmTable = memo(function CrmTable({
   data,
   sortField,
   sortDirection,
   onSort,
   onRowClick,
   hasActiveFilters,
   onClearFilters,
}: CrmTableProps) {
   if (data.length === 0) {
      return (
         <div className="flex h-64 flex-col items-center justify-center">
            <MdGroups className="mb-4 h-16 w-16 text-gray-300" />
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
                     Realização
                  </TableHeadCell>
                  <SortableHeader
                     label="Validade"
                     field="validade"
                     currentSort={sortField}
                     direction={sortDirection}
                     onSort={onSort}
                  />
               </TableRow>
            </TableHead>
            <TableBody>
               {data.map((item) => (
                  <CrmRow key={item.trip_id} item={item} onClick={onRowClick} />
               ))}
            </TableBody>
         </Table>
      </div>
   );
});

export default CrmTable;
