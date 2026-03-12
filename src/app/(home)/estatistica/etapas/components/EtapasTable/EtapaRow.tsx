"use client";

import { memo, useMemo } from "react";
import clsx from "clsx";
import { HiEye, HiPencilAlt } from "react-icons/hi";
import {
   FUNC_BORDO_ORDER,
   FUNC_ORDER,
   getFuncColors,
   type FuncType,
} from "@/constants/tripulantes/funcoes";
import { Checkbox, TableCell, TableRow } from "flowbite-react";
import {
   formatDateFull,
   formatTime,
   minutesToTime,
} from "@/../utils/dateHandler";
import type { TripEtapaItem } from "services/routes/estatistica/etapas";

export interface EtapaRowProps {
   id: number;
   data: string;
   origem: string;
   destino: string;
   dep: string;
   arr: string;
   tvoo: number;
   anv: string;
   sagem: boolean;
   parte1: boolean;
   tipo_missao_cod: string | null;
   esf_aer_itens: string[];
   tripulantes: TripEtapaItem[];
   loading: boolean;
   checked: boolean;
   onToggleEtapa: (id: number) => void;
   onDetailEtapa: (id: number) => void;
   onEditEtapa: (id: number) => void;
}

export const EtapaRow = memo(function EtapaRow({
   id,
   data,
   origem,
   destino,
   dep,
   arr,
   tvoo,
   anv,
   tipo_missao_cod,
   esf_aer_itens,
   tripulantes,
   sagem,
   parte1,
   loading,
   checked,
   onToggleEtapa,
   onDetailEtapa,
   onEditEtapa,
}: EtapaRowProps) {
   const tripBadges = useMemo(() => {
      return FUNC_ORDER.flatMap((func) => {
         const members = tripulantes
            .filter((t) => t.func === func)
            .sort(
               (a, b) =>
                  (FUNC_BORDO_ORDER[a.func_bordo] ?? 50) -
                  (FUNC_BORDO_ORDER[b.func_bordo] ?? 50)
            );
         if (members.length === 0) return [];
         const colors = getFuncColors(func);

         return members.map((m) => (
            <span
               key={`${func}-${m.trig}`}
               className={clsx(
                  "w-10 rounded px-1.5 py-0.5 text-xs font-semibold uppercase",
                  colors.badge
               )}
               title={`[${m.func_bordo}]  ${m.p_g} ${m.nome_guerra}`.toUpperCase()}
            >
               {m.trig}
            </span>
         ));
      });
   }, [tripulantes]);

   return (
      <TableRow
         className={clsx(
            "bg-white",
            loading && "opacity-50",
            !sagem
               ? "bg-amber-50 hover:bg-amber-100"
               : !parte1 && "bg-green-50 hover:bg-green-100"
         )}
      >
         <TableCell className="w-10">
            <Checkbox
               color="red"
               checked={checked}
               onChange={() => onToggleEtapa(id)}
               className="cursor-pointer"
            />
         </TableCell>
         <TableCell className="font-mono text-gray-500">
            {formatDateFull(data)}
         </TableCell>
         <TableCell className="font-mono font-medium text-gray-800 uppercase">
            {origem}
         </TableCell>
         <TableCell className="font-mono font-medium text-gray-800 uppercase">
            {destino}
         </TableCell>
         <TableCell className="font-mono">{formatTime(dep)}</TableCell>
         <TableCell className="font-mono">{formatTime(arr)}</TableCell>
         <TableCell className="font-mono font-semibold">
            {minutesToTime(tvoo)}
         </TableCell>
         <TableCell className="text-gray-900">{anv}</TableCell>
         <TableCell className="text-gray-700 uppercase">
            {tipo_missao_cod}
         </TableCell>
         <TableCell className="w-64">
            {esf_aer_itens.length > 0 ? (
               <ul className="space-y-0.5">
                  {esf_aer_itens.map((item) => (
                     <li
                        key={item}
                        className={clsx(
                           "px-3 py-0.5 text-sm whitespace-nowrap",
                           {
                              "text-blue-600": item.includes("COMAE"),
                              "text-amber-600": item.includes("COMPREP"),
                              "text-gray-600": item.includes("DCTA"),
                           }
                        )}
                     >
                        {item}
                     </li>
                  ))}
               </ul>
            ) : (
               <span className="text-gray-300">&mdash;</span>
            )}
         </TableCell>
         <TableCell>
            {tripBadges.length > 0 ? (
               <div className="flex flex-wrap items-center gap-1">
                  {tripBadges}
               </div>
            ) : (
               <span className="text-gray-300">&mdash;</span>
            )}
         </TableCell>
         <TableCell className="w-10">
            <div className="flex items-center gap-0.5">
               <button
                  onClick={() => onDetailEtapa(id)}
                  className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                  title="Detalhes da etapa"
               >
                  <HiEye className="h-4 w-4" />
               </button>
               <button
                  onClick={() => onEditEtapa(id)}
                  className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                  title="Editar etapa"
               >
                  <HiPencilAlt className="h-4 w-4" />
               </button>
            </div>
         </TableCell>
      </TableRow>
   );
});
