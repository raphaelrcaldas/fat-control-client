"use client";

import clsx from "clsx";
import { HiEye, HiPencilAlt } from "react-icons/hi";
import {
   getFuncColors,
   FUNCOES_CONFIG,
   type FuncType,
} from "@/constants/tripulantes/funcoes";
import { Checkbox, TableCell, TableRow } from "flowbite-react";
import {
   formatDateFull,
   formatTime,
   minutesToTime,
} from "@/../utils/dateHandler";

export interface EtapaRowProps {
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
   tripulantes: Record<string, string[]>;
   loading: boolean;
   checked: boolean;
   onToggle: () => void;
   onDetail: () => void;
   onEdit: () => void;
}

export function EtapaRow({
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
   onToggle,
   onDetail,
   onEdit,
}: EtapaRowProps) {
   return (
      <TableRow
         className={clsx(
            "bg-white transition-opacity duration-200",
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
               onChange={onToggle}
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
            {Object.keys(tripulantes).length > 0 ? (
               <div className="flex flex-wrap items-center gap-1">
                  {(
                     [
                        "pil",
                        "oe",
                        "mc",
                        "lm",
                        "tf",
                        "os",
                        "md",
                        "ml",
                     ] as FuncType[]
                  )
                     .filter((func) => tripulantes[func])
                     .flatMap((func) => {
                        const trigs = tripulantes[func];
                        const colors = getFuncColors(func);
                        return trigs.map((trig) => (
                           <span
                              key={`${func}-${trig}`}
                              className={clsx(
                                 "w-10 rounded px-1.5 py-0.5 text-xs font-semibold uppercase",
                                 colors.badge
                              )}
                              title={
                                 FUNCOES_CONFIG[func as FuncType]?.label ?? func
                              }
                           >
                              {trig}
                           </span>
                        ));
                     })}
               </div>
            ) : (
               <span className="text-gray-300">&mdash;</span>
            )}
         </TableCell>
         <TableCell className="w-10">
            <div className="flex items-center gap-0.5">
               <button
                  onClick={onDetail}
                  className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                  title="Detalhes da etapa"
               >
                  <HiEye className="h-4 w-4" />
               </button>
               <button
                  onClick={onEdit}
                  className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                  title="Editar etapa"
               >
                  <HiPencilAlt className="h-4 w-4" />
               </button>
            </div>
         </TableCell>
      </TableRow>
   );
}
