"use client";

import { useMemo } from "react";
import clsx from "clsx";
import { TableCell, TableRow } from "flowbite-react";
import { HiPencilAlt } from "react-icons/hi";
import { FUNC_BORDO_ORDER } from "@/constants/tripulantes/funcoes";
import { useFuncoes } from "@/hooks/queries";
import type { EtapaItem } from "services/routes/estatistica/etapas";
import {
   formatTime,
   isoDateToShort,
   isoDateToString,
   minutesToTime,
} from "@/../utils/dateHandler";

interface SessaoRowProps {
   etapa: EtapaItem;
   onClick: (etapa: EtapaItem) => void;
}

export function SessaoRow({ etapa, onClick }: SessaoRowProps) {
   const { codigos, colors: funcColors } = useFuncoes();

   const tripBadges = useMemo(() => {
      // Funções na ordem da unidade; as fora do catálogo (dado histórico)
      // entram no fim para não sumir da linha.
      const ordenadas = [
         ...codigos,
         ...etapa.tripulantes
            .map((trip) => trip.func)
            .filter((func) => !codigos.includes(func)),
      ];

      return Array.from(new Set(ordenadas)).flatMap((func) => {
         const members = etapa.tripulantes
            .filter((trip) => trip.func === func)
            .sort(
               (a, b) =>
                  (FUNC_BORDO_ORDER[a.func_bordo] ?? 50) -
                  (FUNC_BORDO_ORDER[b.func_bordo] ?? 50)
            );
         if (members.length === 0) return [];
         const colors = funcColors(func);

         return members.map((member) => (
            <span
               key={`${func}-${member.trig}`}
               className={clsx(
                  "rounded border border-current/20 px-2 py-0.5 font-mono text-xs font-semibold uppercase",
                  colors.badge
               )}
               title={`[${member.func_bordo}] ${member.p_g} ${member.nome_guerra}`.toUpperCase()}
            >
               {member.trig}
            </span>
         ));
      });
   }, [etapa.tripulantes, codigos, funcColors]);

   return (
      <TableRow>
         <TableCell className="w-12 font-mono text-slate-500 sm:w-20">
            <span className="sm:hidden">{isoDateToShort(etapa.data)}</span>
            <span className="hidden sm:inline">
               {isoDateToString(etapa.data)}
            </span>
         </TableCell>
         <TableCell className="w-12 font-mono font-bold text-slate-800 uppercase sm:w-14">
            {etapa.origem}
         </TableCell>
         <TableCell className="w-12 font-mono font-bold text-slate-800 uppercase sm:w-14">
            {etapa.destino}
         </TableCell>
         <TableCell className="w-13 font-mono text-slate-600 sm:w-16">
            {formatTime(etapa.dep)}
         </TableCell>
         <TableCell className="w-13 font-mono text-slate-600 sm:w-16">
            {formatTime(etapa.arr)}
         </TableCell>
         <TableCell className="w-13 font-mono text-slate-900 sm:w-16">
            {minutesToTime(etapa.tvoo)}
         </TableCell>
         {/* Com apenas dois pilotos, a coluna cabe a partir de `sm` sem
             sacrificar as seis colunas operacionais. O piso impede o
             table-layout auto de empilhar os badges; casos mais largos usam
             o overflow-x do card. */}
         <TableCell className="hidden min-w-36 sm:table-cell">
            {tripBadges.length > 0 ? (
               <div className="flex flex-wrap items-center gap-0.5">
                  {tripBadges}
               </div>
            ) : (
               <span className="text-gray-300">&mdash;</span>
            )}
         </TableCell>
         <TableCell className="w-[32px] px-1">
            <button
               type="button"
               onClick={() => onClick(etapa)}
               aria-label={`Editar sessão ${etapa.origem}-${etapa.destino} de ${isoDateToString(etapa.data)}`}
               title="Editar sessão"
               className="text-primary-600 hover:bg-primary-50 focus-visible:outline-primary-500 mx-auto grid size-[24px] place-items-center rounded transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            >
               <HiPencilAlt className="h-4 w-4" />
            </button>
         </TableCell>
      </TableRow>
   );
}
