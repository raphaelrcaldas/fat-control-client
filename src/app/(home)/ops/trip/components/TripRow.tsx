import { Badge, TableRow, TableCell } from "flowbite-react";
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
   const tripFuncs = trip.funcs || [];

   return (
      <TableRow className="">
         <TableCell className="text-gray-700 capitalize">
            {user.posto.mid}
         </TableCell>
         <TableCell className="hidden text-gray-600 uppercase lg:table-cell">
            {user.esp}
         </TableCell>
         <TableCell className="hidden text-gray-800 capitalize md:table-cell">
            {user.nome_guerra}
         </TableCell>
         <TableCell className="hidden text-gray-800 capitalize md:table-cell">
            {user.nome_completo}
         </TableCell>
         <TableCell className="text-center font-medium text-red-600 uppercase">
            {trip.trig}
         </TableCell>
         <TableCell className="text-center uppercase">
            {tripFuncs.length < 1 ? (
               <div className="flex justify-center">
                  <Badge color="failure" size="sm">
                     Sem Função Cadastrada
                  </Badge>
               </div>
            ) : (
               <div className="flex flex-wrap justify-center gap-1">
                  {tripFuncs.map((f) => (
                     <FuncTripRow key={f.id} func={f} />
                  ))}
               </div>
            )}
         </TableCell>
         <TableCell className="hidden text-center md:table-cell">
            <div className="inline-flex items-center gap-1.5 text-sm">
               <span
                  className={clsx(
                     "size-3 rounded-full",
                     trip.active ? "bg-green-600" : "bg-gray-400"
                  )}
               ></span>
               <span
                  className={clsx(
                     trip.active ? "text-green-600" : "text-gray-500"
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
