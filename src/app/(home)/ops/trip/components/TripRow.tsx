import { Badge } from "flowbite-react";
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
      <tr className='uppercase text-center bg-white border-b hover:bg-gray-50 transition-colors'>
         <td className='px-4 py-3 font-bold text-gray-700'>
            {user.posto.short}
         </td>
         <td className='px-4 py-3 hidden lg:table-cell text-gray-600'>
            {user.esp}
         </td>
         <td className='px-4 py-3 hidden md:table-cell text-gray-800'>
            {user.nome_guerra}
         </td>
         <td className='px-4 py-3 hidden md:table-cell text-gray-800'>
            {user.nome_completo}
         </td>
         <td className='px-4 py-3 font-bold text-red-600'>{trip.trig}</td>
         <td className='px-4 py-3'>
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
         </td>
         <td className='px-4 py-3 text-center'>
            <PermBased resource={"trips"} requiredPerm={"update"}>
               <TripDetail trip={trip} update={update} />
            </PermBased>
         </td>
      </tr>
   );
}
