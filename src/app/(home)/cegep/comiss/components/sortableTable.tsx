"use client";

import { useState } from "react";
import { TableHeadCell } from "flowbite-react";
import clsx from "clsx";
import { HiChevronUp, HiChevronDown, HiSelector } from "react-icons/hi";

export type SortDirection = "asc" | "desc";

export interface SortConfig<K extends string> {
   key: K;
   direction: SortDirection;
}

/**
 * Estado de ordenação de tabela: mantém `key`/`direction` e alterna a direção
 * ao reclicar a mesma coluna. Centraliza o `requestSort` antes duplicado nas
 * tabelas de Registros e Gestão Fiscal.
 */
export function useSortConfig<K extends string>(initial: SortConfig<K>) {
   const [sortConfig, setSortConfig] = useState<SortConfig<K>>(initial);

   const requestSort = (key: K) =>
      setSortConfig((prev) => ({
         key,
         direction:
            prev.key === key && prev.direction === "asc" ? "desc" : "asc",
      }));

   return { sortConfig, requestSort };
}

/**
 * Comparador genérico com tratamento de null/undefined (nulos sempre ao fim,
 * independente da direção). Substitui a lógica repetida nas duas tabelas.
 */
export function compareValues(
   a: unknown,
   b: unknown,
   direction: SortDirection
): number {
   if (a === b) return 0;
   if (a == null) return direction === "asc" ? 1 : -1;
   if (b == null) return direction === "asc" ? -1 : 1;
   if (a < b) return direction === "asc" ? -1 : 1;
   return direction === "asc" ? 1 : -1;
}

interface SortableHeadCellProps<K extends string> {
   label: string;
   sortKey: K;
   sortConfig: SortConfig<K>;
   onSort: (key: K) => void;
   align?: "left" | "center";
   /** Classe de fundo/hover do cabeçalho (default cinza sóbrio). */
   headerClass?: string;
}

/** Cabeçalho clicável com indicador de ordenação (seta ativa / seletor no hover). */
export function SortableHeadCell<K extends string>({
   label,
   sortKey,
   sortConfig,
   onSort,
   align = "center",
   headerClass = "bg-slate-50 hover:bg-slate-100",
}: SortableHeadCellProps<K>) {
   const isActive = sortConfig.key === sortKey;
   return (
      <TableHeadCell
         className={clsx(
            "group cursor-pointer transition-colors select-none",
            headerClass,
            align === "center" ? "text-center!" : "text-left!"
         )}
         style={{ textAlign: align }}
         onClick={() => onSort(sortKey)}
      >
         <span className="relative inline-flex items-center justify-center">
            <span>{label}</span>
            <span className="absolute -right-5 flex h-full items-center">
               {isActive ? (
                  sortConfig.direction === "asc" ? (
                     <HiChevronUp className="h-4 w-4 text-red-600" />
                  ) : (
                     <HiChevronDown className="h-4 w-4 text-red-600" />
                  )
               ) : (
                  <HiSelector className="h-4 w-4 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
               )}
            </span>
         </span>
      </TableHeadCell>
   );
}
