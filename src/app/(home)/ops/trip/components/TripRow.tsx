import { Badge, TableRow, TableCell } from "flowbite-react";
import { TripDetail } from "./tripDetail";
import { FuncTripRow } from "./FuncTripRow";
import { PermBased } from "@/app/(home)/hooks/usePermBased";
import type { Trip } from "../types/trip.types";

type TripRowProps = {
   trip: Trip;
   update: () => void;
};

export function TripRow({ trip, update }: TripRowProps) {
   const user = trip.user;
   const tripFuncs = trip.funcs || [];

   return (
      <TableRow className="text-center uppercase">
         <TableCell className="font-bold text-gray-700">
            {user.posto.short}
         </TableCell>
         <TableCell className="hidden text-gray-600 lg:table-cell">
            {user.esp}
         </TableCell>
         <TableCell className="hidden text-gray-800 md:table-cell">
            {user.nome_guerra}
         </TableCell>
         <TableCell className="hidden text-gray-800 md:table-cell">
            {user.nome_completo}
         </TableCell>
         <TableCell className="font-bold text-red-600">{trip.trig}</TableCell>
         <TableCell>
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
         <TableCell className="text-center">
            <PermBased resource={"trips"} requiredPerm={"update"}>
               <TripDetail trip={trip} update={update} />
            </PermBased>
         </TableCell>
      </TableRow>
   );
}
