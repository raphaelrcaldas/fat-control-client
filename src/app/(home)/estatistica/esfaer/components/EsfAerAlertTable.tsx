import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
} from "flowbite-react";
import clsx from "clsx";
import { minutesToTime } from "@/../utils/dateHandler";
import type { EsfAerResumoItem } from "services/routes/estatistica/esfAer";
import { MONTH_LABELS } from "../constants";
import { getDescricaoStyles } from "../utils";

interface DiffMonth {
   index: number;
   sagem: number;
   voado: number;
   diff: number;
}

interface DiffItem {
   item: EsfAerResumoItem;
   months: DiffMonth[];
}

function getDiffItems(items: EsfAerResumoItem[]): DiffItem[] {
   const result: DiffItem[] = [];
   for (const item of items) {
      const months: DiffMonth[] = [];
      for (let i = 0; i < 12; i++) {
         const diff = item.meses_voados[i] - item.meses_sagem[i];
         if (diff !== 0) {
            months.push({
               index: i,
               sagem: item.meses_sagem[i],
               voado: item.meses_voados[i],
               diff,
            });
         }
      }
      if (months.length > 0) {
         result.push({ item, months });
      }
   }
   return result;
}

function formatDiff(value: number): string {
   const sign = value > 0 ? "+" : "-";
   return `${sign}${minutesToTime(Math.abs(value))}`;
}

interface EsfAerAlertTableProps {
   items: EsfAerResumoItem[];
}

export function EsfAerAlertTable({ items }: EsfAerAlertTableProps) {
   const diffItems = getDiffItems(items);

   if (diffItems.length === 0) return null;

   return (
      <div className="hidden w-1/2 overflow-x-auto rounded-lg border border-amber-300 bg-amber-50 md:block">
         <div className="flex items-center justify-center gap-2 border-b border-amber-300 px-4 py-2">
            <svg
               className="h-5 w-5 text-amber-500"
               fill="none"
               stroke="currentColor"
               viewBox="0 0 24 24"
            >
               <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
               />
            </svg>
            <span className="text-sm font-semibold text-amber-700">
               Divergência
            </span>
         </div>
         <Table
            theme={{
               root: { base: "text-sm text-center" },
               body: { cell: { base: "px-3 py-2" } },

               head: { cell: { base: "px-3 py-2 bg-amber-100 min-w-20" } },
            }}
         >
            <TableHead>
               <TableRow>
                  <TableHeadCell>Esforço Aéreo</TableHeadCell>
                  <TableHeadCell>Mês</TableHeadCell>
                  <TableHeadCell>SAGEM</TableHeadCell>
                  <TableHeadCell>FATCONTROL</TableHeadCell>
                  <TableHeadCell>Diferença</TableHeadCell>
               </TableRow>
            </TableHead>
            <TableBody className="divide-y">
               {diffItems.map(({ item, months }) =>
                  months.map((m, mIdx) => (
                     <TableRow key={`${item.id}-${m.index}`}>
                        {mIdx === 0 ? (
                           <TableCell
                              rowSpan={months.length}
                              className={clsx(
                                 getDescricaoStyles(item.descricao)
                              )}
                           >
                              {item.descricao}
                           </TableCell>
                        ) : null}
                        <TableCell className="font-medium text-gray-700">
                           {MONTH_LABELS[m.index]}
                        </TableCell>
                        <TableCell className="font-mono">
                           {minutesToTime(m.sagem)}
                        </TableCell>
                        <TableCell className="font-mono">
                           {minutesToTime(m.voado)}
                        </TableCell>
                        <TableCell
                           className={clsx("font-mono font-semibold", {
                              "text-green-700": m.diff > 0,
                              "text-red-600": m.diff < 0,
                           })}
                        >
                           {formatDiff(m.diff)}
                        </TableCell>
                     </TableRow>
                  ))
               )}
            </TableBody>
         </Table>
      </div>
   );
}
