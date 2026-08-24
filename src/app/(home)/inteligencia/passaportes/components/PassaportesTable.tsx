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
import { HiChevronUp, HiChevronDown, HiPhotograph } from "react-icons/hi";
import { FaPassport } from "react-icons/fa";
import clsx from "clsx";
import type {
   TripPassaporteOut,
   LocalPassaporte,
} from "services/routes/inteligencia/passaportes";
import type { SortField, SortDirection } from "../types";
import {
   getDateStatus,
   getStatusConfig,
   formatDate,
   getWorstStatus,
} from "../utils/dateStatus";
import { LocalBadge } from "./LocalBadge";

// Traço de campo vazio: em cinza fraco, para não competir com o dado real.
const Vazio = () => <span className="text-sm text-gray-400">—</span>;

// ========================================
// DateCell
// ========================================

/** Validade com o farol de status — a data e a cor, sem contagem de dias. */
const DateCell = memo(function DateCell({
   dateStr,
}: {
   dateStr: string | null | undefined;
}) {
   const status = getDateStatus(dateStr);
   const config = getStatusConfig(status);
   const Icon = config.icon;

   if (status === "empty") {
      return (
         <div className="flex justify-center">
            <Vazio />
         </div>
      );
   }

   return (
      <div className="flex items-center justify-center gap-1.5">
         <Icon className={clsx("h-4 w-4 shrink-0", config.color)} />
         <span className={clsx("text-sm font-medium", config.color)}>
            {formatDate(dateStr)}
         </span>
      </div>
   );
});

// ========================================
// NumeroCell
// ========================================

/**
 * Célula do número do documento (passaporte ou visto) com um indicador de
 * imagem anexada. O ícone só aparece quando há `url` (signed URL) — que só
 * vem preenchida para quem tem `passaporte.image.view`, então a ausência
 * nunca é exibida como "sem imagem" para quem não pode ver.
 */
const NumeroCell = memo(function NumeroCell({
   numero,
   url,
}: {
   numero: string | null | undefined;
   url: string | null | undefined;
}) {
   if (!numero) {
      return (
         <div className="flex justify-center">
            <Vazio />
         </div>
      );
   }

   return (
      <div className="flex items-center justify-center gap-1.5">
         <span className="text-sm font-semibold text-gray-700">{numero}</span>
         {url && (
            <HiPhotograph
               className="h-4 w-4 shrink-0 text-emerald-600"
               title="Imagem anexada"
               aria-label="Imagem anexada"
            />
         )}
      </div>
   );
});

// ========================================
// LocalCell
// ========================================

/**
 * Custódia do passaporte físico. Militar sem registro nenhum mostra "—" (não
 * "Na seção"): sem linha na tabela não há caderno para localizar.
 */
const LocalCell = memo(function LocalCell({
   local,
}: {
   local: LocalPassaporte | undefined;
}) {
   return (
      <div className="flex justify-center">
         {local ? <LocalBadge local={local} /> : <Vazio />}
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
   center?: boolean;
   className?: string;
}

const SortableHeader = memo(function SortableHeader({
   label,
   field,
   currentSort,
   direction,
   onSort,
   center,
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
         <div
            className={clsx(
               "flex items-center gap-1",
               center && "justify-center"
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
   const config = getStatusConfig(worst);

   return (
      <TableRow
         onClick={() => onClick(item)}
         onKeyDown={(e) => {
            if (e.key !== "Enter" && e.key !== " ") return;
            // Espaço rola a página se o default não for barrado.
            e.preventDefault();
            onClick(item);
         }}
         tabIndex={0}
         role="button"
         className="hover:bg-primary-50 cursor-pointer border-b border-slate-200 font-mono transition-colors"
      >
         {/* Pior status da linha como faixa na borda: mesmo sinal do antigo
             ponto, sem gastar uma coluna com ele. */}
         <TableCell className={clsx("w-1 p-0", config.dot)}>
            <span className="sr-only">{`Status: ${config.label}`}</span>
         </TableCell>
         <TableCell className="px-4 py-2 font-medium whitespace-nowrap text-gray-900 uppercase">
            <p className="font-semibold">
               {item.p_g} {item.nome_guerra}
            </p>
         </TableCell>
         <TableCell className="border-l border-slate-100 px-4 py-2 text-center whitespace-nowrap">
            <NumeroCell
               numero={item.passaporte?.passaporte}
               url={item.passaporte?.passaporte_url}
            />
         </TableCell>
         <TableCell className="px-4 py-2 whitespace-nowrap">
            <DateCell dateStr={item.passaporte?.validade_passaporte} />
         </TableCell>
         <TableCell className="px-4 py-2 whitespace-nowrap">
            <LocalCell local={item.passaporte?.local_passaporte} />
         </TableCell>
         <TableCell className="border-l border-slate-100 px-4 py-2 text-center whitespace-nowrap">
            <NumeroCell
               numero={item.passaporte?.visa}
               url={item.passaporte?.visa_url}
            />
         </TableCell>
         <TableCell className="px-4 py-2 whitespace-nowrap">
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
   sortField: SortField | null;
   sortDirection: SortDirection;
   onSort: (field: SortField) => void;
   onRowClick: (item: TripPassaporteOut) => void;
   hasActiveFilters: boolean;
   onClearFilters: () => void;
}

const PassaportesTable = memo(function PassaportesTable({
   data,
   sortField,
   sortDirection,
   onSort,
   onRowClick,
   hasActiveFilters,
   onClearFilters,
}: PassaportesTableProps) {
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
                  />
                  <TableHeadCell className="border-l border-slate-200 px-4 py-2 text-center font-semibold">
                     Nº Passaporte
                  </TableHeadCell>
                  <SortableHeader
                     label="Validade Passaporte"
                     field="validade_passaporte"
                     currentSort={sortField}
                     direction={sortDirection}
                     onSort={onSort}
                     center
                  />
                  <TableHeadCell className="px-4 py-2 text-center font-semibold">
                     Localização
                  </TableHeadCell>
                  <TableHeadCell className="border-l border-slate-200 px-4 py-2 text-center font-semibold">
                     Nº VISA
                  </TableHeadCell>
                  <SortableHeader
                     label="Validade VISA"
                     field="validade_visa"
                     currentSort={sortField}
                     direction={sortDirection}
                     onSort={onSort}
                     center
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
