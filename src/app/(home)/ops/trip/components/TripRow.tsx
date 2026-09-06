import { TableRow, TableCell } from "flowbite-react";
import Link from "next/link";
import clsx from "clsx";
import { HiChevronRight } from "react-icons/hi";
import { TripFuncBadge } from "./TripFuncBadge";
import type { Trip } from "../types/trip.types";

type TripRowProps = {
   trip: Trip;
};

export function TripRow({ trip }: TripRowProps) {
   const user = trip.user;
   const href = trip.id != null ? `/ops/trip/${trip.id}` : null;

   return (
      <TableRow className="group">
         <TableCell className="text-sm font-medium whitespace-nowrap text-slate-600 uppercase">
            {user.posto.short}
         </TableCell>

         <TableCell className="hidden text-sm whitespace-nowrap text-slate-500 uppercase lg:table-cell">
            {user.quadro}
         </TableCell>

         <TableCell className="hidden text-sm whitespace-nowrap text-slate-500 uppercase lg:table-cell">
            {user.esp}
         </TableCell>

         <TableCell className="font-medium text-slate-800 capitalize">
            {/* Truncar com `title` em vez de deixar quebrar: nome longo em duas
                linhas desalinhava a altura de uma linha em cada cinco. */}
            <span className="block max-w-40 truncate" title={user.nome_guerra}>
               {user.nome_guerra}
            </span>
         </TableCell>

         <TableCell className="text-slate-600 capitalize">
            <span
               className="block max-w-72 truncate"
               title={user.nome_completo ?? undefined}
            >
               {user.nome_completo}
            </span>
         </TableCell>

         {/* Identificador operacional: peso e mono dao o destaque que a cor de
             marca dava, sem pintar cinquenta acentos primary na coluna. */}
         <TableCell className="text-center font-mono text-sm font-semibold tracking-wider text-slate-900 uppercase">
            {trip.trig}
         </TableCell>

         <TableCell className="text-center">
            <TripFuncBadge func={trip.func} oper={trip.oper} />
         </TableCell>

         <TableCell className="hidden text-center lg:table-cell">
            <span className="inline-flex items-center gap-1.5 text-sm">
               <span
                  aria-hidden
                  className={clsx(
                     "size-1.5 rounded-full",
                     trip.active ? "bg-emerald-500" : "bg-slate-400"
                  )}
               />
               <span
                  className={clsx(
                     trip.active ? "text-slate-600" : "text-slate-500"
                  )}
               >
                  {trip.active ? "Ativo" : "Inativo"}
               </span>
            </span>
         </TableCell>

         <TableCell className="text-right">
            {href && (
               <Link
                  href={href}
                  aria-label={`Detalhes de ${user.nome_guerra}`}
                  title={`Detalhes de ${user.nome_guerra}`}
                  className="hover:border-primary-300 hover:text-primary-700 focus-visible:outline-primary-600 inline-flex items-center justify-center rounded border border-slate-200 p-1.5 text-[0.7rem] text-slate-500 uppercase transition-colors outline-none focus-visible:outline-[2px] focus-visible:outline-offset-[2px] focus-visible:[outline-style:solid] pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px]"
               >
                  <HiChevronRight className="h-4 w-4" />
               </Link>
            )}
         </TableCell>
      </TableRow>
   );
}
