"use client";

import { memo, useMemo } from "react";
import clsx from "clsx";
import { HiEye, HiMoon, HiPencilAlt, HiSun } from "react-icons/hi";
import { GiOwl } from "react-icons/gi";
import {
   FUNC_BORDO_ORDER,
   FUNC_ORDER,
   getFuncColors,
} from "@/constants/tripulantes/funcoes";
import { Checkbox, TableCell, TableRow } from "flowbite-react";
import {
   isoDateToString,
   formatTime,
   minutesToTime,
} from "@/../utils/dateHandler";
import type {
   TripEtapaItem,
   OIEtapaItem,
} from "services/routes/estatistica/etapas";
import { PermBased } from "@/app/(home)/hooks/usePermBased";

const REG_ICON: Record<string, { icon: typeof HiSun; color: string }> = {
   d: { icon: HiSun, color: "text-amber-500" },
   n: { icon: HiMoon, color: "text-indigo-500" },
   v: { icon: GiOwl, color: "text-emerald-500" },
};

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
   oi_etapas: OIEtapaItem[];
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
   oi_etapas,
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
         <TableCell className="w-20 font-mono text-gray-500">
            {isoDateToString(data)}
         </TableCell>
         <TableCell className="w-14 font-mono font-medium text-gray-800 uppercase">
            {origem}
         </TableCell>
         <TableCell className="w-14 font-mono font-medium text-gray-800 uppercase">
            {destino}
         </TableCell>
         <TableCell className="w-14 font-mono">{formatTime(dep)}</TableCell>
         <TableCell className="w-14 font-mono">{formatTime(arr)}</TableCell>
         <TableCell className="w-14 font-mono font-semibold text-slate-800">
            {minutesToTime(tvoo)}
         </TableCell>
         <TableCell className="hidden w-14 text-gray-900 sm:table-cell">
            {anv}
         </TableCell>
         <TableCell className="hidden w-92 md:table-cell">
            {oi_etapas.length > 0 ? (
               <ul>
                  {oi_etapas.map((oi, i) => {
                     const reg = REG_ICON[oi.reg];
                     const RegIcon = reg?.icon ?? HiSun;
                     return (
                        <li
                           key={`${oi.esf_aer_id}-${oi.tipo_missao_id}-${oi.reg}`}
                           className={clsx(
                              "flex items-center justify-center gap-1.5 text-xs"
                           )}
                        >
                           <span
                              className={clsx(
                                 "",
                                 oi.esf_aer.includes("COMAE")
                                    ? "text-blue-700"
                                    : oi.esf_aer.includes("COMPREP")
                                      ? "text-amber-700"
                                      : "text-gray-600"
                              )}
                           >
                              {oi.esf_aer}
                           </span>
                           <span className="text-gray-300">|</span>
                           <span
                              className={clsx(
                                 "flex items-center justify-center gap-0.5 font-mono",
                                 reg?.color ?? "text-gray-500"
                              )}
                           >
                              {minutesToTime(oi.tvoo)}
                              <RegIcon
                                 className={clsx(
                                    "h-3 w-3 shrink-0",
                                    reg?.color ?? "text-gray-500"
                                 )}
                              />
                           </span>
                           <span className="text-gray-300">|</span>
                           <span className="font-mono uppercase">
                              {oi.tipo_missao_cod}
                           </span>
                        </li>
                     );
                  })}
               </ul>
            ) : (
               <span className="text-gray-300">&mdash;</span>
            )}
         </TableCell>
         <TableCell className="hidden lg:table-cell">
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
               <PermBased resource="etp_mis" requiredPerm="create">
                  <button
                     onClick={() => onEditEtapa(id)}
                     className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                     title="Editar etapa"
                  >
                     <HiPencilAlt className="h-4 w-4" />
                  </button>
               </PermBased>
            </div>
         </TableCell>
      </TableRow>
   );
});
