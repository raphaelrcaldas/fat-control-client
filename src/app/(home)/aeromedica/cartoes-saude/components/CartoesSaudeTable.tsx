"use client";

import { memo } from "react";
import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
} from "flowbite-react";
import { HiChevronUp, HiChevronDown } from "react-icons/hi";
import {
   MdHealthAndSafety,
   MdAttachFile,
   MdErrorOutline,
} from "react-icons/md";
import clsx from "clsx";
import type { UserCartaoSaude } from "services/routes/aeromedica/cartoesSaude";
import type { SortField, SortDirection } from "../types";
import {
   getDateStatus,
   getStatusConfig,
   formatDate,
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

// ========================================
// AtaCell
// ========================================

const AtaCell = memo(function AtaCell({ temAta }: { temAta: boolean | null }) {
   if (temAta === null) {
      return <span className="text-sm text-gray-400">—</span>;
   }

   // Coluna própria (e não uma segunda linha em CEMAL): o aviso aparecia em
   // 62% das linhas, virava textura e deixava a altura de linha irregular.
   return temAta ? (
      <span className="flex items-center justify-center" title="Ata anexada">
         <MdAttachFile className="h-4 w-4 text-slate-400" aria-hidden />
         <span className="sr-only">Ata anexada</span>
      </span>
   ) : (
      <span
         className="flex items-center justify-center"
         title="Sem ata anexada"
      >
         <MdErrorOutline className="h-4 w-4 text-amber-700" aria-hidden />
         <span className="sr-only">Sem ata anexada</span>
      </span>
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
            "cursor-pointer px-4 py-3 font-semibold transition-colors select-none hover:text-gray-900",
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

// ========================================
// CartoesSaudeRow
// ========================================

// pointer-coarse:py-4 sobe a linha para 44px no dedo e mantém os 40px
// compactos no mouse (mínimo WCAG de 24px folgado).
const CELL = "px-4 py-3 pointer-coarse:py-4 whitespace-nowrap";

const CartoesSaudeRow = memo(function CartoesSaudeRow({
   item,
   onClick,
}: {
   item: UserCartaoSaude;
   onClick: (item: UserCartaoSaude) => void;
}) {
   const rowStatus = getWorstStatus(item);
   const { dot: dotColor, label: statusLabel } = getStatusConfig(rowStatus);

   return (
      <TableRow
         onClick={() => onClick(item)}
         onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
               // Espaço rolaria a página; prevenimos e acionamos a linha.
               e.preventDefault();
               onClick(item);
            }
         }}
         tabIndex={0}
         role="button"
         className="cursor-pointer border-b border-slate-200 transition-colors hover:bg-gray-50"
      >
         <TableCell className="w-10 px-3 py-3 text-center pointer-coarse:py-4">
            {/* Farol da linha: pior status entre as datas preenchidas — antes
                espelhava só o CEMAL e ficava verde com o IMAE vencido. */}
            <span
               className={clsx("inline-block h-3 w-3 rounded-full", dotColor)}
               title={statusLabel}
            />
            <span className="sr-only">{statusLabel}</span>
         </TableCell>
         <TableCell
            className={clsx(CELL, "font-medium text-gray-900 uppercase")}
         >
            <p className="font-semibold">
               {item.user.posto.short} {item.user.nome_guerra}
            </p>
         </TableCell>
         <TableCell
            className={clsx(
               CELL,
               "text-center font-mono text-gray-600 tabular-nums"
            )}
         >
            {item.cartao?.prontuario ?? "—"}
         </TableCell>
         <TableCell className={clsx(CELL, "w-12 text-center")}>
            <AtaCell temAta={item.cemal_tem_ata} />
         </TableCell>
         <TableCell className={CELL}>
            <DateCell dateStr={item.cartao?.cemal} />
         </TableCell>
         <TableCell className={CELL}>
            <DateCell dateStr={item.cartao?.tovn} />
         </TableCell>
         <TableCell className={CELL}>
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
   searchTerm: string;
}

export default function CartoesSaudeTable({
   data,
   sortField,
   sortDirection,
   onSort,
   onRowClick,
   hasActiveFilters,
   searchTerm,
}: CartoesSaudeTableProps) {
   if (data.length === 0) {
      // Sem botão de limpar: já existe um na barra logo acima, sempre visível
      // enquanto houver filtro ativo.
      const description = searchTerm
         ? `Nenhum militar corresponde a “${searchTerm}”.`
         : hasActiveFilters
           ? "Nenhum militar corresponde aos filtros aplicados."
           : "Nenhum militar cadastrado nesta organização.";

      return (
         <div className="flex h-64 flex-col items-center justify-center px-4 text-center">
            <MdHealthAndSafety className="mb-4 h-12 w-12 text-gray-400" />
            <p className="font-medium text-gray-600">
               Nenhum resultado encontrado
            </p>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
         </div>
      );
   }

   return (
      // Altura limitada + cabeçalho fixo: com 133 linhas (~7000px) as colunas
      // sumiam antes da metade da lista. `sticky` só funciona porque o próprio
      // wrapper é o container de rolagem vertical — o preço assumido é um
      // scroller aninhado ao do `main`.
      // `rounded-b`: o card pai não pode mais recortar (cortaria o menu de
      // status), então o arredondamento da base mora aqui.
      <div className="max-h-[70vh] overflow-auto rounded-b">
         <Table hoverable>
            <TableHead className="sticky top-0 z-10 border-b border-slate-200 bg-gray-50 text-xs text-gray-700 uppercase">
               <TableRow>
                  <TableHeadCell className="w-10 px-3 py-3">
                     <span className="sr-only">Situação</span>
                  </TableHeadCell>
                  <SortableHeader
                     label="Militar"
                     field="militar"
                     currentSort={sortField}
                     direction={sortDirection}
                     onSort={onSort}
                     alignStart
                  />
                  <TableHeadCell className="px-4 py-3 text-center font-semibold">
                     Prontuário
                  </TableHeadCell>
                  <TableHeadCell className="w-12 px-4 py-3 text-center font-semibold">
                     Ata
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
