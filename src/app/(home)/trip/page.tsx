"use client";

import { useState, useEffect } from "react";
import {
   Table,
   TableHeadCell,
   TableHead,
   TableBody,
   TableRow,
   TableCell,
   TextInput,
   Select,
   Spinner,
} from "flowbite-react";
import { IoSearchSharp } from "react-icons/io5";

import { SearchUser } from "./components/searchUserTrip";
import { getTrips } from "services/routes/trips";
import { TripDetail } from "./components/tripDetail";
import { PermBased } from "../hooks/usePermBased";
import clsx from "clsx";
import useDebouncedValue from "../users/hooks/useDebouncedValue";

export default function TripPage() {
   const [trips, setTrips] = useState([]);
   const [filterTrips, setFilterTrips] = useState([]);

   const [uae, setUae] = useState("11gt");
   const [active, setActive] = useState(true);

   const [filterName, setFilterName] = useState("");
   const debouncedFilter = useDebouncedValue(filterName, 300);
   const [loading, setLoading] = useState(false);

   function getListTrips() {
      setLoading(true);
      getTrips({ uae: uae, active: active })
         .then((data) => {
            data.sort((a, b) => a.user.posto.ant - b.user.posto.ant);
            setTrips(data);
            setFilterTrips(data);
         })
         .catch((err) => {
            console.error(err);
         })
         .finally(() => setLoading(false));
   }

   useEffect(() => {
      // FILTRO NOME com debounce
      if (!debouncedFilter || debouncedFilter.length === 0) {
         // sem filtro, mostra todos os trips
         setFilterTrips(trips);
         return;
      }

      const inputFilter = debouncedFilter.toLowerCase();

      const filter = trips.filter((trip) => {
         const checkTrig = trip.trig.includes(inputFilter);
         const checkGuerra = trip.user.nome_guerra.includes(inputFilter);

         return checkTrig || checkGuerra;
      });

      setFilterTrips(filter);
   }, [debouncedFilter, trips]);

   useEffect(() => {
      getListTrips();
   }, [uae, active]);

   return (
      <>
         <div className='flex flex-col h-full gap-3'>
            <div className='gap-2 hidden'>
               <Select
                  onChange={(e) => setUae(e.target.value)}
                  defaultValue={uae}
                  disabled
               >
                  <option value='11gt'>1°/1° GT</option>
               </Select>
               <Select
                  disabled
                  className={`font-semibold`}
                  onChange={(e) => setActive(e.target.value === "true")}
               >
                  <option className='font-semibold text-green-600' value='true'>
                     ATIVO
                  </option>
                  <option className='font-semibold text-red-600' value='false'>
                     INATIVO
                  </option>
               </Select>
            </div>

            <div className='w-full overflow-auto h-full p-2'>
               <div className='flex flex-col mb-4 bg-white gap-2 p-3 rounded-lg shadow-md'>
                  <h5 className='font-semibold text-lg'>Tripulantes</h5>
                  <p className='text-gray-500'>
                     Gerencie todos os tripulantes existentes ou crie um novo
                  </p>
                  <div className='flex flex-row justify-between'>
                     <TextInput
                        className='w-2/3'
                        icon={IoSearchSharp}
                        placeholder='Busque pelo nome de guerra ou trigrama'
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                     />
                     <SearchUser
                        uae={uae}
                        trips={trips}
                        updateTrips={getListTrips}
                     />
                  </div>
               </div>
               {loading ? (
                  <div className='flex justify-center items-center h-40'>
                     <Spinner size='xl' />
                  </div>
               ) : (
                  <Table hoverable>
                     <TableHead className='text-center'>
                        <TableRow>
                           <TableHeadCell className=''>PG</TableHeadCell>
                           <TableHeadCell className='hidden md:table-cell'>
                              Especialidade
                           </TableHeadCell>
                           <TableHeadCell className='hidden md:table-cell'>
                              Nome de Guerra
                           </TableHeadCell>
                           <TableHeadCell>Trigrama</TableHeadCell>
                           <TableHeadCell>Função</TableHeadCell>
                           <TableHeadCell>
                              <span className='sr-only'>Detalhes</span>
                           </TableHeadCell>
                        </TableRow>
                     </TableHead>
                     <TableBody>
                        {filterTrips.map((trip) => (
                           <TripRow
                              key={trip.id}
                              trip={trip}
                              update={getListTrips}
                           />
                        ))}
                     </TableBody>
                  </Table>
               )}
            </div>
         </div>
      </>
   );
}

function TripRow({ trip, update }) {
   const user = trip.user;
   const tripFuncs = trip.funcs;

   return (
      <TableRow className='uppercase text-center'>
         <TableCell className='font-medium'>{user.posto.short}</TableCell>
         <TableCell className='hidden md:table-cell'>{user.esp}</TableCell>
         <TableCell className='hidden md:table-cell'>
            {user.nome_guerra}
         </TableCell>
         <TableCell className='font-semibold'>{trip.trig}</TableCell>
         <TableCell className=''>
            {tripFuncs.length < 1 ? (
               <span className='text-red-600 text-xs'>Sem Função</span>
            ) : (
               <div className='flex flex-col gap-1'>
                  {tripFuncs.map((f) => (
                     <FuncTripRow key={f.id} func={f} />
                  ))}
               </div>
            )}
         </TableCell>
         <TableCell className='justify-items-center'>
            <PermBased resource={"trips"} requiredPerm={"update"}>
               <TripDetail trip={trip} update={update} />
            </PermBased>
         </TableCell>
      </TableRow>
   );
}

function FuncTripRow({ func }) {
   const oper = func.oper;

   return (
      <div
         className={clsx("px-2 py-1 font-semibold", {
            // "bg-blue-100": func.func == "pil",
            // "bg-yellow-100": func.func == "mc",
            // "bg-emerald-100": func.func == "lm",
            // "bg-orange-100": func.func == "os",
            // "bg-red-200": func.func == "oe",
            // "bg-gray-200": func.func == "tf",
         })}
      >
         {func.func}:{" "}
         <span
            className={clsx("", {
               "text-emerald-600": oper === "al",
               "text-yellow-400": oper === "op",
               "text-yellow-500": oper === "po",
               "text-yellow-600": oper === "pb",
               "text-red-700": oper === "in",
            })}
         >
            {oper}
         </span>
      </div>
   );
}
