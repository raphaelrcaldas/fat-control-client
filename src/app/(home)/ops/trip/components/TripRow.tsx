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
      <tr className="border-b border-gray-200 bg-white text-center uppercase transition-colors hover:bg-gray-50">
         <td className="px-4 py-3 font-bold text-gray-700">
            {user.posto.short}
         </td>
         <td className="hidden px-4 py-3 text-gray-600 lg:table-cell">
            {user.esp}
         </td>
         <td className="hidden px-4 py-3 text-gray-800 md:table-cell">
            {user.nome_guerra}
         </td>
         <td className="hidden px-4 py-3 text-gray-800 md:table-cell">
            {user.nome_completo}
         </td>
         <td className="px-4 py-3 font-bold text-red-600">{trip.trig}</td>
         <td className="px-4 py-3">
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
         </td>
         <td className="px-4 py-3 text-center">
            <PermBased resource={"trips"} requiredPerm={"update"}>
               <TripDetail trip={trip} update={update} />
            </PermBased>
         </td>
      </tr>
   );
}
