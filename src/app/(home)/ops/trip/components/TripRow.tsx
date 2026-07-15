import { TableRow, TableCell } from "flowbite-react";
import { TripDetail } from "./tripDetail";
import { FuncTripRow } from "./FuncTripRow";
import { PermBased } from "@/app/(home)/hooks/usePermBased";
import type { Trip } from "../types/trip.types";
import clsx from "clsx";

type TripRowProps = {
   trip: Trip;
};

export function TripRow({ trip }: TripRowProps) {
   const user = trip.user;

   return (
      <TableRow>
         <TableCell className="whitespace-nowrap text-slate-700 capitalize">
            {user.posto.mid}
         </TableCell>
         <TableCell className="hidden text-slate-600 uppercase lg:table-cell">
            {user.quadro}
         </TableCell>
         <TableCell className="hidden text-slate-600 uppercase lg:table-cell">
            {user.esp}
         </TableCell>
         <TableCell className="hidden font-medium text-slate-800 capitalize md:table-cell">
            {user.nome_guerra}
         </TableCell>
         <TableCell className="hidden text-slate-800 capitalize md:table-cell">
            {user.nome_completo}
         </TableCell>
         <TableCell className="text-primary-600 text-center font-medium uppercase">
            {trip.trig}
         </TableCell>
         <TableCell className="text-center uppercase">
            <div className="flex justify-center">
               <FuncTripRow func={trip.func} oper={trip.oper} />
            </div>
         </TableCell>
         <TableCell className="hidden text-center md:table-cell">
            <div className="inline-flex items-center gap-1.5 text-sm">
               <span
                  className={clsx(
                     "size-3 rounded-full",
                     trip.active ? "bg-green-600" : "bg-slate-400"
                  )}
               ></span>
               <span
                  className={clsx(
                     trip.active ? "text-green-700" : "text-slate-500"
                  )}
               >
                  {trip.active ? "Ativo" : "Inativo"}
               </span>
            </div>
         </TableCell>
         <TableCell className="text-center">
            <PermBased resource={"trips"} requiredPerm={"update"}>
               <TripDetail trip={trip} />
            </PermBased>
         </TableCell>
      </TableRow>
   );
}
