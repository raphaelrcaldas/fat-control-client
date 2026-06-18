"use client";

import { memo, useMemo, useState } from "react";
import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
   Progress,
   Label,
   Badge,
} from "flowbite-react";
import { isoDateToString } from "utils/dateHandler";
import clsx from "clsx";
import { ComissList } from "services/routes/cegep/comiss";
import { useRouter } from "next/navigation";
import { compareByAntiguidade } from "utils/sortByAntiguidade";
import { HiChevronUp, HiChevronDown, HiSelector } from "react-icons/hi";

interface TableComissProps {
   cmtos: ComissList[];
}

type SortKey =
   | "militar"
   | "data_ab"
   | "data_fc"
   | "tipo"
   | "completude"
   | "modulo"
   | "previsto"
   | "computado"
   | "restante";

export const TableComiss = memo(function TableComiss({
   cmtos,
}: TableComissProps) {
   const [sortConfig, setSortConfig] = useState<{
      key: SortKey;
      direction: "asc" | "desc";
   }>({ key: "militar", direction: "asc" });

   const sortedCmtos = useMemo(() => {
      let sortableItems = [...cmtos];
      if (sortConfig !== null) {
         sortableItems.sort((a, b) => {
            let aValue: any;
            let bValue: any;

            if (sortConfig.key === "militar") {
               const cmp =
                  !a.user && !b.user
                     ? 0
                     : !a.user
                       ? 1
                       : !b.user
                         ? -1
                         : compareByAntiguidade(a.user, b.user);
               return sortConfig.direction === "asc" ? cmp : -cmp;
            }

            if (
               sortConfig.key === "previsto" ||
               sortConfig.key === "computado" ||
               sortConfig.key === "restante"
            ) {
               const getDerived = (comiss: ComissList, key: SortKey) => {
                  if (comiss.dias_cumprir) {
                     if (key === "previsto") return comiss.dias_cumprir;
                     if (key === "computado") return comiss.dias_comp;
                     if (key === "restante")
                        return comiss.dias_cumprir - comiss.dias_comp;
                  }
                  const prev = (comiss.valor_aj_ab + comiss.valor_aj_fc) / 335;
                  const comp = comiss.vals_comp / 335;
                  if (key === "previsto") return prev;
                  if (key === "computado") return comp;
                  if (key === "restante") return prev - comp;
                  return 0;
               };
               aValue = getDerived(a, sortConfig.key);
               bValue = getDerived(b, sortConfig.key);
            } else if (sortConfig.key === "tipo") {
               aValue = a.dias_cumprir ? 1 : 0;
               bValue = b.dias_cumprir ? 1 : 0;
            } else {
               aValue = a[sortConfig.key as keyof ComissList];
               bValue = b[sortConfig.key as keyof ComissList];
            }

            if (aValue === bValue) return 0;

            // Handle null/undefined gracefully
            if (aValue == null) return sortConfig.direction === "asc" ? 1 : -1;
            if (bValue == null) return sortConfig.direction === "asc" ? -1 : 1;

            if (aValue < bValue) {
               return sortConfig.direction === "asc" ? -1 : 1;
            }
            if (aValue > bValue) {
               return sortConfig.direction === "asc" ? 1 : -1;
            }
            return 0;
         });
      }
      return sortableItems;
   }, [cmtos, sortConfig]);

   const requestSort = (key: SortKey) => {
      let direction: "asc" | "desc" = "asc";
      if (
         sortConfig &&
         sortConfig.key === key &&
         sortConfig.direction === "asc"
      ) {
         direction = "desc";
      }
      setSortConfig({ key, direction });
   };

   const renderHeader = (
      label: string,
      sortKey: SortKey,
      align: "left" | "center" = "center"
   ) => {
      const isActive = sortConfig?.key === sortKey;
      return (
         <TableHeadCell
            className={clsx(
               "group cursor-pointer bg-white transition-colors select-none hover:bg-gray-50",
               align === "center" ? "text-center!" : "text-left!"
            )}
            style={{ textAlign: align }}
            onClick={() => requestSort(sortKey)}
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
                     <HiSelector className="h-4 w-4 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
                  )}
               </span>
            </span>
         </TableHeadCell>
      );
   };

   return (
      <div className="overflow-x-auto rounded bg-white shadow ring-1 ring-slate-200">
         <Table hoverable striped>
            <TableHead>
               <TableRow>
                  {renderHeader("Militar", "militar", "left")}
                  {renderHeader("Abertura", "data_ab")}
                  {renderHeader("Fechamento", "data_fc")}
                  {renderHeader("Tipo", "tipo")}
                  {renderHeader("Progresso", "completude")}
                  {renderHeader("Módulo", "modulo")}
                  {renderHeader("Previsto", "previsto")}
                  {renderHeader("Computado", "computado")}
                  {renderHeader("Restante", "restante")}
               </TableRow>
            </TableHead>
            <TableBody className="divide-y divide-gray-200">
               {sortedCmtos.map((comiss) => (
                  <TableComissRow key={comiss.id} comiss={comiss} />
               ))}
            </TableBody>
         </Table>
      </div>
   );
});

const TableComissRow = memo(function TableComissRow({
   comiss,
}: {
   comiss: ComissList;
}) {
   const router = useRouter();
   const user = comiss.user;

   const { dataAbertura, dataFechamento } = useMemo(
      () => ({
         dataAbertura: isoDateToString(comiss.data_ab),
         dataFechamento: isoDateToString(comiss.data_fc),
      }),
      [comiss.data_ab, comiss.data_fc]
   );

   const ajdAb = comiss.valor_aj_ab;
   const ajdFc = comiss.valor_aj_fc;

   const { previsto, computado, restante } = useMemo(() => {
      if (comiss.dias_cumprir) {
         return {
            previsto: String(comiss.dias_cumprir),
            computado: String(comiss.dias_comp),
            restante: String(comiss.dias_cumprir - comiss.dias_comp),
         };
      }
      const prev = (ajdAb + ajdFc) / 335;
      const comp = comiss.vals_comp / 335;
      return {
         previsto: `~ ${prev.toFixed(0)}`,
         computado: `~ ${comp.toFixed(0)}`,
         restante: `~ ${(prev - comp).toFixed(0)}`,
      };
   }, [comiss.dias_cumprir, comiss.dias_comp, comiss.vals_comp, ajdAb, ajdFc]);

   let progressColor = comiss.modulo ? "green" : "red";
   progressColor = comiss.status === "fechado" ? "gray" : progressColor;

   return (
      <TableRow
         onClick={() => router.push(`/cegep/comiss/${comiss.id}`)}
         className="cursor-pointer bg-white"
      >
         <TableCell className="font-medium whitespace-nowrap text-gray-900">
            <div className="flex items-center gap-2">
               <div
                  className={clsx(
                     "h-2 w-2 shrink-0 rounded-full",
                     comiss.status === "aberto"
                        ? "bg-emerald-500"
                        : "bg-gray-400"
                  )}
               />
               <span className="uppercase">
                  {user?.p_g} {user?.nome_guerra}
               </span>
            </div>
         </TableCell>

         <TableCell className="text-center whitespace-nowrap">
            <span className="font-mono text-sm">{dataAbertura}</span>
         </TableCell>

         <TableCell className="text-center whitespace-nowrap">
            <span className="font-mono text-sm">{dataFechamento}</span>
         </TableCell>

         <TableCell className="text-center whitespace-nowrap">
            <div className="flex justify-center">
               <Badge color={comiss.dias_cumprir ? "info" : "success"}>
                  {comiss.dias_cumprir ? "Periodo" : "Comparativo"}
               </Badge>
            </div>
         </TableCell>

         <TableCell>
            <div className="mx-auto w-28 space-y-1">
               <Label className="block text-center text-xs font-medium text-gray-600">
                  {comiss.completude}%
               </Label>
               <Progress
                  progress={comiss.completude}
                  color={progressColor}
                  size="sm"
               />
            </div>
         </TableCell>
         <TableCell className="text-center whitespace-nowrap">
            <div className="flex justify-center">
               <Badge color={comiss.modulo ? "success" : "failure"}>
                  {comiss.modulo ? "Sim" : "Não"}
               </Badge>
            </div>
         </TableCell>

         <TableCell className="text-center whitespace-nowrap">
            <span className="font-semibold text-gray-900">{previsto}</span>
            <span className="ml-1 text-xs text-gray-500">dias</span>
         </TableCell>

         <TableCell className="text-center whitespace-nowrap">
            <span className="font-semibold text-gray-900">{computado}</span>
            <span className="ml-1 text-xs text-gray-500">dias</span>
         </TableCell>

         <TableCell className="text-center whitespace-nowrap">
            <span className="font-semibold text-gray-900">{restante}</span>
            <span className="ml-1 text-xs text-gray-500">dias</span>
         </TableCell>
      </TableRow>
   );
});
