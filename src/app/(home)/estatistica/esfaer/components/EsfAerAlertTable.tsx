import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
} from "flowbite-react";
import clsx from "clsx";
import { HiOutlineExclamation } from "react-icons/hi";
import { minutesToTime } from "@/../utils/dateHandler";
import type { EsfAerResumoItem } from "services/routes/estatistica/esfAer";
import { MONTH_LABELS } from "../constants";
import {
   formatSignedMinutes,
   getDescricaoStyles,
   type FocoDivergencia,
} from "../utils";

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

interface EsfAerAlertTableProps {
   items: EsfAerResumoItem[];
   foco: FocoDivergencia | null;
   onLocalizar: (esfaerId: number, mes: number) => void;
}

export function EsfAerAlertTable({
   items,
   foco,
   onLocalizar,
}: EsfAerAlertTableProps) {
   const diffItems = getDiffItems(items);

   if (diffItems.length === 0) return null;

   return (
      <div className="hidden w-1/2 overflow-x-auto rounded border border-amber-300 bg-amber-50 shadow-sm md:block">
         <div className="flex items-center justify-center gap-2 border-b border-amber-300 px-4 py-2">
            <HiOutlineExclamation
               aria-hidden
               className="h-5 w-5 text-amber-500"
            />
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
                  months.map((m, mIdx) => {
                     const selecionada =
                        foco?.esfaerId === item.id && foco.mes === m.index;
                     const alvo = `${item.descricao} em ${MONTH_LABELS[m.index]}`;
                     // O realce vai nas células, não na <tr>: o fundo da linha
                     // é pintado também atrás da célula rowSpan, que então
                     // ficaria toda destacada.
                     const realce = selecionada
                        ? "bg-amber-200"
                        : "group-hover/row:bg-amber-100";
                     return (
                        <TableRow
                           key={`${item.id}-${m.index}`}
                           data-divergencia-linha={`${item.id}-${m.index}`}
                           aria-current={selecionada ? "true" : undefined}
                           onClick={() => onLocalizar(item.id, m.index)}
                           className="cursor-pointer"
                        >
                           {/* A célula de descrição (rowSpan) existe só na 1ª linha
                              do esforço; clicar nela borbulha para essa linha e
                              localiza o 1º mês divergente. O fundo transparente
                              mantém o destaque só nas células da linha
                              selecionada. */}
                           {mIdx === 0 ? (
                              <TableCell
                                 rowSpan={months.length}
                                 className={clsx(
                                    "bg-transparent",
                                    getDescricaoStyles(item.descricao)
                                 )}
                              >
                                 {item.descricao}
                              </TableCell>
                           ) : null}
                           <TableCell
                              className={clsx(
                                 "font-medium text-gray-700",
                                 realce
                              )}
                           >
                              {/* Alvo de teclado da linha; o mouse usa o onClick
                                  da <tr>, por isso o stopPropagation. */}
                              <button
                                 type="button"
                                 aria-label={`Localizar ${alvo} na tabela`}
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    onLocalizar(item.id, m.index);
                                 }}
                                 className="min-h-[24px] cursor-pointer bg-transparent p-0 font-[inherit] text-inherit focus-visible:outline-2 focus-visible:outline-amber-600"
                              >
                                 {MONTH_LABELS[m.index]}
                              </button>
                           </TableCell>
                           <TableCell className={clsx("font-mono", realce)}>
                              {minutesToTime(m.sagem)}
                           </TableCell>
                           <TableCell className={clsx("font-mono", realce)}>
                              {minutesToTime(m.voado)}
                           </TableCell>
                           <TableCell
                              className={clsx(
                                 "font-mono font-semibold",
                                 realce,
                                 {
                                    "text-green-700": m.diff > 0,
                                    "text-red-600": m.diff < 0,
                                 }
                              )}
                           >
                              {formatSignedMinutes(m.diff)}
                           </TableCell>
                        </TableRow>
                     );
                  })
               )}
            </TableBody>
         </Table>
      </div>
   );
}
