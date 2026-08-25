"use client";

import { memo, useCallback, useState } from "react";
import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
} from "flowbite-react";
import { HiChevronUp, HiChevronDown } from "react-icons/hi";
import clsx from "clsx";
import type { TripCrmOut } from "services/routes/seg-voo/crm";
import { useFuncoes } from "@/hooks/queries";
import type { SortField, SortDirection } from "../types";
import { getDateStatus, getStatusConfig, formatDate } from "@/utils/dateStatus";
import EmptyState from "./EmptyState";

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

// Trigrama: jargão de 3 letras, em caixa alta e mono para alinhar em coluna
// sem competir com o nome do militar.
const TrigCell = memo(function TrigCell({ trig }: { trig: string }) {
   return (
      <span className="font-mono text-sm font-semibold tracking-wide text-slate-600 uppercase">
         {trig}
      </span>
   );
});

// Função com a cor do catálogo da org (mesmo chip de /admin/funcoes): a cor
// é o que deixa a coluna varrível de relance. `w-12` fixo para o chip não
// mudar de largura entre códigos e a coluna não oscilar linha a linha.
const FuncCell = memo(function FuncCell({
   func,
   label,
   badge,
}: {
   func: string;
   label: string;
   badge: string;
}) {
   return (
      <span
         className={clsx(
            "inline-grid w-12 place-items-center rounded px-2 py-0.5 font-mono text-xs font-bold uppercase ring-1 ring-inset",
            badge
         )}
         title={label}
      >
         {func}
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
      <div className="flex items-center justify-center gap-1.5">
         <Icon className={clsx("h-4 w-4 shrink-0", config.color)} />
         <span
            className={clsx("text-sm font-medium tabular-nums", config.color)}
         >
            {formatDate(dateStr)}
         </span>
      </div>
   );
});

interface SortableHeaderProps {
   label: string;
   field: SortField;
   currentSort: SortField | null;
   direction: SortDirection;
   onSort: (field: SortField) => void;
   /** Só a coluna Militar alinha à esquerda; o resto é centralizado. */
   alignStart?: boolean;
}

const SortableHeader = memo(function SortableHeader({
   label,
   field,
   currentSort,
   direction,
   onSort,
   alignStart,
}: SortableHeaderProps) {
   const isActive = currentSort === field;

   return (
      <TableHeadCell
         className={clsx(
            "cursor-pointer px-4 py-2 font-semibold transition-colors select-none hover:text-gray-900",
            !alignStart && "text-center"
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
         <div
            className={clsx(
               "flex items-center gap-1",
               !alignStart && "justify-center"
            )}
         >
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
   funcLabel,
   funcBadge,
   index,
   isFocusable,
   onClick,
   onFocusIndex,
}: {
   item: TripCrmOut;
   funcLabel: string;
   funcBadge: string;
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
         className="focus-visible:ring-primary-500 hover:bg-primary-50 cursor-pointer border-b border-slate-200 transition-colors focus-visible:ring-1 focus-visible:outline-none"
      >
         {/* Farol como faixa na borda: mesmo sinal do antigo ponto, sem
             disputar espaço com o nome dentro da célula. */}
         <TableCell
            className={clsx("w-1 p-0", config.dot)}
            title={`Status: ${config.label}`}
         >
            <span className="sr-only">{`Status: ${config.label}`}</span>
         </TableCell>
         <TableCell className="px-4 py-2 font-medium whitespace-nowrap text-gray-900 uppercase">
            <p className="font-semibold">
               {item.p_g} {item.nome_guerra}
            </p>
         </TableCell>
         <TableCell className="px-4 py-2 text-center whitespace-nowrap">
            <TrigCell trig={item.trig} />
         </TableCell>
         <TableCell className="px-4 py-2 text-center whitespace-nowrap">
            <FuncCell func={item.func} label={funcLabel} badge={funcBadge} />
         </TableCell>
         <TableCell className="px-4 py-2 text-center whitespace-nowrap">
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
   searchTerm: string;
}

const CrmTable = memo(function CrmTable({
   data,
   sortField,
   sortDirection,
   onSort,
   onRowClick,
   hasActiveFilters,
   searchTerm,
}: CrmTableProps) {
   const [focusIndex, setFocusIndex] = useState(0);
   const onFocusIndex = useCallback((i: number) => setFocusIndex(i), []);
   // A coluna mostra o código (3 letras, jargão da escala) com a cor da
   // função; o nome completo fica no `title`. Tudo do catálogo da org, que o
   // filtro já carrega.
   const { label: funcLabel, colors: funcColors } = useFuncoes();
   // A lista encolhe ao filtrar: sem o clamp nenhuma linha seria tabulável.
   const activeIndex = Math.min(focusIndex, Math.max(data.length - 1, 0));

   if (data.length === 0) {
      return (
         <EmptyState
            hasActiveFilters={hasActiveFilters}
            searchTerm={searchTerm}
         />
      );
   }

   return (
      <div className="overflow-x-auto">
         <Table hoverable>
            <TableHead className="border-b border-slate-200 bg-gray-50 text-xs text-gray-700 uppercase">
               <TableRow>
                  <TableHeadCell className="w-1 p-0">
                     <span className="sr-only">Status</span>
                  </TableHeadCell>
                  <SortableHeader
                     label="Militar"
                     field="militar"
                     currentSort={sortField}
                     direction={sortDirection}
                     onSort={onSort}
                     alignStart
                  />
                  <TableHeadCell className="px-4 py-2 text-center font-semibold">
                     Trigrama
                  </TableHeadCell>
                  <TableHeadCell className="px-4 py-2 text-center font-semibold">
                     Função
                  </TableHeadCell>
                  <TableHeadCell className="px-4 py-2 text-center font-semibold">
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
                     funcLabel={funcLabel(item.func)}
                     funcBadge={funcColors(item.func).badge}
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
