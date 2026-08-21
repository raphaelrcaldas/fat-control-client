"use client";

import { memo, useCallback, useState } from "react";
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
   return (
      <span className="text-sm text-gray-700 tabular-nums">
         {formatDate(dateStr)}
      </span>
   );
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
         <span
            className={clsx("text-sm font-medium tabular-nums", config.color)}
         >
            {formatDate(dateStr)}
         </span>
         {status !== "empty" && (
            <span className={clsx("text-xs tabular-nums", config.color)}>
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
   className?: string;
}

const SortableHeader = memo(function SortableHeader({
   label,
   field,
   currentSort,
   direction,
   onSort,
   className,
}: SortableHeaderProps) {
   const isActive = currentSort === field;

   return (
      <TableHeadCell
         className={clsx(
            "cursor-pointer px-4 py-2 font-semibold transition-colors select-none hover:text-gray-900",
            className
         )}
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
                        ? "text-primary-600"
                        : "text-gray-400"
                  )}
               />
               <HiChevronDown
                  className={clsx(
                     "h-3 w-3",
                     isActive && direction === "desc"
                        ? "text-primary-600"
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
   index,
   isFocusable,
   onClick,
   onFocusIndex,
}: {
   item: TripCrmOut;
   index: number;
   isFocusable: boolean;
   onClick: (item: TripCrmOut) => void;
   onFocusIndex: (index: number) => void;
}) {
   const status = getDateStatus(item.crm?.data_validade);
   const config = getStatusConfig(status);

   const handleKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>) => {
      if (e.key === "Enter" || e.key === " ") {
         e.preventDefault();
         onClick(item);
         return;
      }

      // Setas/Home/End movem o foco entre as linhas (roving tabindex).
      const rows = e.currentTarget.parentElement?.children;
      if (!rows) return;
      const last = rows.length - 1;
      const target =
         e.key === "ArrowDown"
            ? Math.min(index + 1, last)
            : e.key === "ArrowUp"
              ? Math.max(index - 1, 0)
              : e.key === "Home"
                ? 0
                : e.key === "End"
                  ? last
                  : null;
      if (target === null) return;

      e.preventDefault();
      onFocusIndex(target);
      (rows[target] as HTMLElement).focus();
   };

   return (
      <TableRow
         onClick={() => onClick(item)}
         onKeyDown={handleKeyDown}
         onFocus={() => onFocusIndex(index)}
         // Só a linha ativa entra na ordem de tabulação: com centenas de
         // militares, tabular linha a linha inviabiliza chegar ao resto da tela.
         tabIndex={isFocusable ? 0 : -1}
         role="button"
         className="group/row focus-visible:ring-primary-500 hover:bg-primary-50 cursor-pointer border-b border-slate-200 transition-colors focus-visible:ring-1 focus-visible:outline-none"
      >
         {/* Farol + identidade na mesma célula: fixa no scroll horizontal do
             mobile, para a data nunca ficar sem dono. */}
         <TableCell className="group-hover/row:bg-primary-50 sticky left-0 z-10 bg-white px-4 py-2 font-medium whitespace-nowrap text-gray-900 uppercase transition-colors">
            <div className="flex items-center gap-2.5">
               <span
                  aria-hidden
                  className={clsx(
                     "inline-block h-3 w-3 shrink-0 rounded-full",
                     config.dot
                  )}
               />
               <p className="font-semibold">
                  {item.p_g} {item.nome_guerra}
               </p>
               <span className="sr-only">Status: {config.label}</span>
            </div>
         </TableCell>
         <TableCell className="px-4 py-2 whitespace-nowrap">
            <SimpleDateCell dateStr={item.crm?.data_realizacao} />
         </TableCell>
         <TableCell className="px-4 py-2 whitespace-nowrap">
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
   const [focusIndex, setFocusIndex] = useState(0);
   const onFocusIndex = useCallback((i: number) => setFocusIndex(i), []);
   // A lista encolhe ao filtrar: sem o clamp nenhuma linha seria tabulável.
   const activeIndex = Math.min(focusIndex, Math.max(data.length - 1, 0));

   if (data.length === 0) {
      return (
         <div className="flex h-64 flex-col items-center justify-center px-6 text-center">
            <MdGroups className="mb-4 h-16 w-16 text-gray-300" />
            {hasActiveFilters ? (
               <>
                  <p className="text-lg font-medium text-gray-500">
                     Nenhum militar neste filtro
                  </p>
                  <Button
                     size="xs"
                     color="light"
                     onClick={onClearFilters}
                     className="mt-2"
                  >
                     Limpar filtros
                  </Button>
               </>
            ) : (
               <>
                  <p className="text-lg font-medium text-gray-500">
                     Nenhum CRM lançado nesta organização
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                     Os militares aparecem aqui assim que houver tripulantes
                     cadastrados na organização.
                  </p>
               </>
            )}
         </div>
      );
   }

   return (
      <div className="overflow-x-auto">
         <Table hoverable>
            <TableHead className="border-b border-slate-200 bg-gray-50 text-xs text-gray-700 uppercase">
               <TableRow>
                  <SortableHeader
                     label="Militar"
                     field="militar"
                     currentSort={sortField}
                     direction={sortDirection}
                     onSort={onSort}
                     className="sticky left-0 z-20 bg-gray-50"
                  />
                  <TableHeadCell className="px-4 py-2 font-semibold">
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
               {data.map((item, i) => (
                  <CrmRow
                     key={item.trip_id}
                     item={item}
                     index={i}
                     isFocusable={i === activeIndex}
                     onClick={onRowClick}
                     onFocusIndex={onFocusIndex}
                  />
               ))}
            </TableBody>
         </Table>
      </div>
   );
});

export default CrmTable;
