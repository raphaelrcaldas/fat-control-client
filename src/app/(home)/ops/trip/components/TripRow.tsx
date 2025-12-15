import { TableRow, TableCell, Badge } from "flowbite-react";
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
      <TableRow className='uppercase text-center hover:bg-gray-50 transition-colors'>
         <TableCell className='font-bold text-gray-700'>
            {user.posto.short}
         </TableCell>
         <TableCell className='hidden lg:table-cell text-gray-600'>
            {user.esp}
         </TableCell>
         <TableCell className='hidden md:table-cell text-gray-800'>
            {user.nome_guerra}
         </TableCell>
         <TableCell className='hidden md:table-cell text-gray-800'>
            {user.nome_completo}
         </TableCell>
         <TableCell className='font-bold text-red-600'>{trip.trig}</TableCell>
         <TableCell>
            {tripFuncs.length < 1 ? (
               <div className='flex justify-center'>
                  <Badge color='failure' size='sm'>
                     Sem Função Cadastrada
                  </Badge>
               </div>
            ) : (
               <div className='flex flex-wrap gap-1 justify-center'>
                  {tripFuncs.map((f) => (
                     <FuncTripRow key={f.id} func={f} />
                  ))}
               </div>
            )}
         </TableCell>
         <TableCell className='text-center'>
            <PermBased resource={"trips"} requiredPerm={"update"}>
               <TripDetail trip={trip} update={update} />
            </PermBased>
         </TableCell>
      </TableRow>
   );
}
