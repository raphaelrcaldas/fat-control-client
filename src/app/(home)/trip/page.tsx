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
} from "flowbite-react";
import { IoSearchSharp } from "react-icons/io5";

import { SearchUser } from "./components/searchUserTrip";
import { getTrips } from "services/routes/trips";
import { TripDetail } from "./components/tripDetail";
import { PermBased } from "../hooks/usePermBased";
import clsx from "clsx";

export default function TripPage() {
   const [trips, setTrips] = useState([]);
   const [filterTrips, setFilterTrips] = useState([]);

   const [uae, setUae] = useState("11gt");
   const [active, setActive] = useState(true);

   const [filterName, setFilterName] = useState("");

   function getListTrips() {
      getTrips({ uae: uae, active: active })
         .then((res) => res.json())
         .then((data) => {
            data.sort((a, b) => a.user.posto.ant - b.user.posto.ant);
            setTrips(data);
            setFilterTrips(data);
         });
   }

   useEffect(() => {
      // FILTRO NOME
      let filter = trips.filter((trip) => {
         const inputFilter = filterName.toLowerCase();
         const checkTrig = trip.trig.includes(inputFilter);
         const checkGuerra = trip.user.nome_guerra.includes(inputFilter);

         return checkTrig || checkGuerra;
      });

      setFilterTrips(filter);
   }, [filterName]);

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

            <div className='w-full lg:max-w-fit sm:max-h-[90%] overflow-auto max-h-[80%] h-full p-2'>
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
               <Table hoverable>
                  <TableHead className='text-center'>
                     <TableHeadCell className=''>PG</TableHeadCell>
                     <TableHeadCell className='hidden md:table-cell'>
                        Esp
                     </TableHeadCell>
                     <TableHeadCell className='hidden md:table-cell'>
                        Nome de Guerra
                     </TableHeadCell>
                     <TableHeadCell>Trigrama</TableHeadCell>
                     <TableHeadCell>Função</TableHeadCell>
                     <TableHeadCell>Oper</TableHeadCell>
                     <TableHeadCell>
                        <span className='sr-only'>Detalhes</span>
                     </TableHeadCell>
                  </TableHead>
                  <TableBody>
                     {filterTrips.map((trip) => (
                        <TableRow
                           key={trip.id}
                           className='uppercase text-center'
                        >
                           <TableCell className='font-medium'>
                              {trip.user.posto.short}
                           </TableCell>
                           <TableCell className='hidden md:table-cell'>
                              {trip.user.esp}
                           </TableCell>
                           <TableCell className='hidden md:table-cell'>
                              {trip.user.nome_guerra}
                           </TableCell>
                           <TableCell className='font-semibold'>
                              {trip.trig}
                           </TableCell>
                           <TableCell className=''>
                              {trip.funcs.length < 1 ? (
                                 <span className='text-red-600 text-xs'>
                                    Sem Função
                                 </span>
                              ) : (
                                 trip.funcs[0]["func"]
                              )}
                           </TableCell>
                           <TableCell className='justify-items-center'>
                              {trip.funcs.length < 1 ? (
                                 <span className='text-red-600 text-xs'>
                                    Sem Função
                                 </span>
                              ) : (
                                 <span
                                    className={clsx(
                                       "py-1.5 px-2.5 font-semibold",
                                       {
                                          "text-emerald-600":
                                             trip.funcs[0]["oper"] === "al",
                                          "text-yellow-400":
                                             trip.funcs[0]["oper"] === "op",
                                          "text-yellow-500":
                                             trip.funcs[0]["oper"] === "po",
                                          "text-yellow-600":
                                             trip.funcs[0]["oper"] === "pb",
                                          "text-red-700":
                                             trip.funcs[0]["oper"] === "in",
                                       }
                                    )}
                                 >
                                    {trip.funcs[0]["oper"]}
                                 </span>
                              )}
                           </TableCell>
                           <TableCell className='justify-items-center'>
                              <PermBased
                                 resource={"trips"}
                                 requiredPerm={"update"}
                              >
                                 <TripDetail
                                    trip={trip}
                                    update={getListTrips}
                                 />
                              </PermBased>
                           </TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </div>
         </div>
      </>
   );
}
