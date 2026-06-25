"use client";

import { memo, useMemo } from "react";
import clsx from "clsx";
import { HiEye, HiPencilAlt } from "react-icons/hi";
import {
   FUNC_BORDO_ORDER,
   FUNC_ORDER,
   getFuncColors,
} from "@/constants/tripulantes/funcoes";
import { Button, Checkbox, TableCell, TableRow } from "flowbite-react";
import {
   isoDateToString,
   isoDateToShort,
   formatTime,
   minutesToTime,
} from "@/../utils/dateHandler";
import type {
   TripEtapaItem,
   OIEtapaItem,
} from "services/routes/estatistica/etapas";
import { PermBased } from "@/app/(home)/hooks/usePermBased";

const REG_COLOR: Record<string, string> = {
   d: "text-amber-500",
   n: "text-indigo-500",
   v: "text-emerald-500",
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
   pousos: number;
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
   pousos,
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
                  "rounded border border-current/20 px-2 py-0.5 font-mono text-xs font-semibold uppercase",
                  colors.badge
               )}
               title={`[${m.func_bordo}]  ${m.p_g} ${m.nome_guerra}`.toUpperCase()}
            >
               {m.trig}
            </span>
         ));
      });
   }, [tripulantes]);

   const oiList = useMemo(() => {
      if (oi_etapas.length === 0)
         return <span className="text-gray-300">&mdash;</span>;
      return (
         <ul>
            {oi_etapas.map((oi) => (
               <li
                  key={`${oi.esf_aer_id}-${oi.tipo_missao_id}-${oi.reg}`}
                  className="flex items-center justify-center gap-1.5 text-xs font-medium"
               >
                  <span
                     className={clsx(
                        "w-60 truncate",
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
                        REG_COLOR[oi.reg] ?? "text-gray-500"
                     )}
                  >
                     {minutesToTime(oi.tvoo)}
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="font-mono uppercase">
                     {oi.tipo_missao_cod}
                  </span>
               </li>
            ))}
         </ul>
      );
   }, [oi_etapas]);

   return (
      <TableRow
         className={clsx(
            "hover:bg-white/40",
            loading && "opacity-50",
            !sagem
               ? "bg-amber-50 hover:bg-amber-100"
               : !parte1 && "bg-emerald-50 hover:bg-emerald-100"
         )}
      >
         <TableCell className="w-7">
            <Checkbox
               color="red"
               checked={checked}
               onChange={() => onToggleEtapa(id)}
               className="cursor-pointer"
            />
         </TableCell>
         <TableCell className="w-12 font-mono text-slate-500 sm:w-20">
            <span className="sm:hidden">{isoDateToShort(data)}</span>
            <span className="hidden sm:inline">{isoDateToString(data)}</span>
         </TableCell>
         <TableCell className="w-12 font-mono font-bold text-slate-800 uppercase sm:w-14">
            {origem}
         </TableCell>
         <TableCell className="w-12 font-mono font-bold text-slate-800 uppercase sm:w-14">
            {destino}
         </TableCell>
         <TableCell className="w-13 font-mono text-slate-600 sm:w-16">
            {formatTime(dep)}
         </TableCell>
         <TableCell className="w-13 font-mono text-slate-600 sm:w-16">
            {formatTime(arr)}
         </TableCell>
         <TableCell className="w-13 font-mono text-slate-900 sm:w-16">
            {minutesToTime(tvoo)}
         </TableCell>
         <TableCell className="hidden w-14 font-mono text-slate-700 sm:table-cell">
            {anv}
         </TableCell>
         <TableCell className="hidden w-5 font-mono text-slate-400 sm:table-cell">
            {pousos > 1 ? pousos : null}
         </TableCell>
         <TableCell className="hidden w-80 md:table-cell">{oiList}</TableCell>
         <TableCell className="hidden lg:table-cell">
            {tripBadges.length > 0 ? (
               <div className="flex flex-wrap items-center gap-0.5">
                  {tripBadges}
               </div>
            ) : (
               <span className="text-gray-300">&mdash;</span>
            )}
         </TableCell>
         <TableCell className="w-12 px-2 sm:w-14">
            <div className="flex items-center gap-1">
               <Button
                  size="xs"
                  color="light"
                  onClick={() => onDetailEtapa(id)}
                  title="Detalhes da etapa"
                  className="p-1.5"
               >
                  <HiEye className="size-4" />
               </Button>
               <PermBased resource="etp_mis" requiredPerm="create">
                  <Button
                     size="xs"
                     color="light"
                     onClick={() => onEditEtapa(id)}
                     title="Editar etapa"
                     className="p-1.5"
                  >
                     <HiPencilAlt className="size-4" />
                  </Button>
               </PermBased>
            </div>
         </TableCell>
      </TableRow>
   );
});
