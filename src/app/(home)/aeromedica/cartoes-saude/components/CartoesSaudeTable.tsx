"use client";

import { memo } from "react";
import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
   Checkbox,
} from "flowbite-react";
import { HiChevronUp, HiChevronDown } from "react-icons/hi";
import { MdAttachFile, MdErrorOutline } from "react-icons/md";
import clsx from "clsx";
import type { UserCartaoSaude } from "services/routes/aeromedica/cartoesSaude";
import type { ExportCart } from "@/components/export/useExportCart";
import type { SortField, SortDirection } from "../types";
import {
   getDateStatus,
   getStatusConfig,
   formatDate,
   getWorstStatus,
} from "../utils/dateStatus";
import EmptyState from "./EmptyState";

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

// ========================================
// CartoesSaudeRow
// ========================================

// Altura da linha é a do conteúdo: no dedo a tabela nem aparece (abaixo de
// `md` a lista é de cards), então não há por que inflar a linha aqui.
const CELL = "px-4 py-2 whitespace-nowrap";

const CartoesSaudeRow = memo(function CartoesSaudeRow({
   item,
   onClick,
   checked,
   onToggle,
}: {
   item: UserCartaoSaude;
   onClick: (item: UserCartaoSaude) => void;
   checked: boolean;
   onToggle: (item: UserCartaoSaude) => void;
}) {
   const { dot: dotColor, label: statusLabel } = getStatusConfig(
      getWorstStatus(item)
   );

   // A linha nao e `role="button"`: botao nao pode conter o checkbox de
   // selecao (axe `nested-interactive`). O clique na linha segue abrindo o
   // drawer com o mouse; pelo teclado, o alvo e o botao do nome do militar.
   return (
      <TableRow
         onClick={() => onClick(item)}
         className={clsx(
            "cursor-pointer border-b border-slate-200 transition-colors",
            // O hover fica nos dois ramos: `hover:bg-gray-50` na base vence o
            // fundo da selecao, e a linha recem-marcada (com o mouse em cima)
            // parecia desmarcada. `clsx` nao faz merge do Tailwind.
            checked
               ? "bg-primary-50/60 hover:bg-primary-50"
               : "hover:bg-gray-50"
         )}
      >
         {/* Farol da linha (pior status entre as datas preenchidas — antes
             espelhava só o CEMAL e ficava verde com o IMAE vencido) como
             faixa na borda: mesmo sinal do antigo ponto, sem gastar uma
             coluna de 40px com ele. */}
         <TableCell
            className={clsx("w-1 p-0", dotColor)}
            title={`Situação: ${statusLabel}`}
         >
            <span className="sr-only">{`Situação: ${statusLabel}`}</span>
         </TableCell>
         {/* `stopPropagation`: marcar para exportar nao abre o drawer. A
             `<label>` ocupa a celula inteira, para a sobra em volta do
             quadrinho tambem marcar em vez de ser area morta. */}
         <TableCell className="w-10 p-0" onClick={(e) => e.stopPropagation()}>
            <label className="flex cursor-pointer items-center px-3 py-2">
               <Checkbox
                  color="primary"
                  checked={checked}
                  onChange={() => onToggle(item)}
                  aria-label={`Selecionar ${item.user.posto.short} ${item.user.nome_guerra}`}
               />
            </label>
         </TableCell>
         <TableCell
            className={clsx(CELL, "font-medium text-gray-900 uppercase")}
         >
            {/* `w-full`: com 72px ou mais o alvo conta como faixa e so deve
                20px de altura — 24px engordaria todas as linhas. */}
            <button
               type="button"
               aria-haspopup="dialog"
               className="min-h-[20px] w-full text-left font-semibold uppercase"
            >
               {item.user.posto.short} {item.user.nome_guerra}
            </button>
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
   /**
    * Funcoes do carrinho, soltas e nao o objeto: `useExportCart` devolve um
    * objeto novo a cada render. Todas sao estaveis, exceto `has`, que muda so
    * quando a selecao muda.
    */
   isSelected: ExportCart<UserCartaoSaude>["has"];
   onToggle: ExportCart<UserCartaoSaude>["toggle"];
   onSelectMany: ExportCart<UserCartaoSaude>["addMany"];
   onUnselectMany: ExportCart<UserCartaoSaude>["removeMany"];
}

export default function CartoesSaudeTable({
   data,
   sortField,
   sortDirection,
   onSort,
   onRowClick,
   hasActiveFilters,
   searchTerm,
   isSelected,
   onToggle,
   onSelectMany,
   onUnselectMany,
}: CartoesSaudeTableProps) {
   if (data.length === 0) {
      return (
         <EmptyState
            hasActiveFilters={hasActiveFilters}
            searchTerm={searchTerm}
         />
      );
   }

   // Sem paginacao, o checkbox do cabecalho tem escopo da lista FILTRADA
   // inteira: filtrar "CEMAL vencido" e marcar todos vira um clique.
   const ids = data.map((item) => item.user.id);
   const selected = ids.filter((id) => isSelected(id)).length;
   const all = selected === data.length;
   const toggleAll = () => {
      if (all) onUnselectMany(ids);
      else onSelectMany(data);
   };

   return (
      // Rolagem livre na página: sem teto de altura e sem cabeçalho fixo, a
      // lista não fica presa num scroller aninhado ao do `main`.
      // `rounded-b`: o card pai não recorta (cortaria menus abertos dentro
      // dele), então o arredondamento da base mora aqui.
      <div className="overflow-x-auto rounded-b">
         <Table hoverable>
            <TableHead className="border-b border-slate-200 bg-gray-50 text-xs text-gray-700 uppercase">
               <TableRow>
                  <TableHeadCell className="w-1 p-0">
                     <span className="sr-only">Situação</span>
                  </TableHeadCell>
                  <TableHeadCell className="w-10 px-3 py-2">
                     <Checkbox
                        color="primary"
                        checked={all}
                        ref={(el) => {
                           // Estado indeterminado: parte da lista marcada.
                           if (el) el.indeterminate = selected > 0 && !all;
                        }}
                        onChange={toggleAll}
                        aria-label={
                           all
                              ? "Desmarcar todos da lista"
                              : "Selecionar todos da lista"
                        }
                     />
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
                     Prontuário
                  </TableHeadCell>
                  <TableHeadCell className="w-12 px-4 py-2 text-center font-semibold">
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
                     checked={isSelected(item.user.id)}
                     onToggle={onToggle}
                  />
               ))}
            </TableBody>
         </Table>
      </div>
   );
}
