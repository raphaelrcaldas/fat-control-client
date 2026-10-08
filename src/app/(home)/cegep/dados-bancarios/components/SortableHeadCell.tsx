import clsx from "clsx";
import { TableHeadCell } from "flowbite-react";
import { HiChevronDown, HiChevronUp, HiSelector } from "react-icons/hi";

export type SortDirection = "asc" | "desc";

interface SortableHeadCellProps {
   label: string;
   /** Coluna é a ordenação vigente. */
   active: boolean;
   direction: SortDirection;
   /** Ausente no skeleton: mesma anatomia, sem ação. */
   onSort?: () => void;
   align?: "left" | "center";
}

/**
 * Cabeçalho ordenável. A ação fica num <button> dentro do <th> (alcançável
 * por Tab); o `aria-sort` vai só na coluna vigente, como pede o ARIA.
 */
export function SortableHeadCell({
   label,
   active,
   direction,
   onSort,
   align = "left",
}: SortableHeadCellProps) {
   const Icon = !active
      ? HiSelector
      : direction === "asc"
        ? HiChevronUp
        : HiChevronDown;

   return (
      <TableHeadCell
         className={clsx(align === "center" && "text-center")}
         aria-sort={
            active
               ? direction === "asc"
                  ? "ascending"
                  : "descending"
               : undefined
         }
      >
         <button
            type="button"
            onClick={onSort}
            tabIndex={onSort ? undefined : -1}
            className={clsx(
               "focus-visible:ring-primary-600 inline-flex min-h-[24px] items-center gap-0.5 rounded uppercase hover:text-slate-900 focus-visible:ring-2 focus-visible:outline-none",
               active && "text-slate-900"
            )}
         >
            {label}
            <Icon
               aria-hidden
               className={clsx(
                  "size-3 shrink-0",
                  active ? "text-primary-600" : "text-slate-400"
               )}
            />
         </button>
      </TableHeadCell>
   );
}
