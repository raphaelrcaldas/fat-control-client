"use client";

import { useState, useEffect } from "react";
import { Table, TextInput, Button, Select } from "flowbite-react";
import { IoSearchSharp } from "react-icons/io5";
import { FaFilter } from "react-icons/fa";

import { SearchUser } from "./components/searchUserTrip";
import { getTrips } from "@/services/routes/trips";
import { SelectFuncao, SelectOper } from "../components/inputForm";
import { FuncBadge, OperBadge } from "../components/badges";
import { TripDetail } from "./components/tripDetail";
import { PermBased } from "../hooks/usePermBased";

export default function TripPage() {
   const [trips, setTrips] = useState([]);
   const [filterTrips, setFilterTrips] = useState([]);

   const [uae, setUae] = useState("11gt");
   const [active, setActive] = useState(true);

   const [filterName, setFilterName] = useState("");
   const [filterFunc, setFilterFunc] = useState("");
   const [filterOp, setFilterOp] = useState("");

   const themeTable = {
      root: {
         base: "w-full text-base text-gray-500 dark:text-gray-400 uppercase text-center",
         shadow:
            "absolute left-0 top-0 -z-10 h-full w-full rounded-lg bg-white drop-shadow-md dark:bg-black",
         wrapper: "relative",
      },
      body: {
         base: "group/body",
         cell: {
            base: "px-6 py-1 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg",
         },
      },
      head: {
         base: "group/head text-xs text-gray-700 dark:text-gray-400",
         cell: {
            base: "bg-gray-200 px-3 py-3 group-first/head:first:rounded-tl-lg group-first/head:last:rounded-tr-lg dark:bg-gray-700",
         },
      },
      row: {
         base: "group/row bg-white hover:font-semibold",
         hovered: "hover:bg-gray-50 dark:hover:bg-gray-600",
         striped:
            "odd:bg-white even:bg-gray-50 odd:dark:bg-gray-800 even:dark:bg-gray-700",
      },
   };

   function getListTrips() {
      getTrips({ uae: uae, active: active })
         .then((res) => res.json())
         .then((data) => {
            data.sort((a, b) => a.user.posto.ant - b.user.posto.ant);
            setTrips(data);
            setFilterTrips(data);
         });
   }

   function filters() {
      // FILTRO FUNÇOES E OPER
      let filter = trips.filter((trip) => {
         const funcs = trip.funcs.filter((f) => {
            const funcVal = f.func.includes(filterFunc);
            const opVal = f.oper.includes(filterOp);

            if (funcVal && opVal) {
               return true;
            } else {
               return false;
            }
         });

         if (funcs.length > 0) {
            return true;
         }
      });

      // FILTRO NOME
      filter = filter.filter((trip) => {
         const inputFilter = filterName.toLowerCase();
         const checkTrig = trip.trig.includes(inputFilter);
         const checkGuerra = trip.user.nome_guerra.includes(inputFilter);

         return checkTrig || checkGuerra;
      });

      setFilterTrips(filter);
   }

   useEffect(() => {
      getListTrips();
   }, [uae, active]);

   return (
      <>
         <div className='h-full'>
            <div className='mt-2 gap-2 hidden'>
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
                  defaultValue={active}
                  onChange={(e) => setActive(e.target.value)}
               >
                  <option className='font-semibold text-green-600' value={true}>
                     ATIVO
                  </option>
                  <option className='font-semibold text-red-600' value={false}>
                     INATIVO
                  </option>
               </Select>
            </div>
            <div className='mt-2 flex flex-col gap-12 md:flex-row'>
               <div className='flex flex-wrap gap-2'>
                  <TextInput
                     className='w-64'
                     icon={IoSearchSharp}
                     placeholder='Search for Crew Member'
                     value={filterName}
                     onChange={(e) => setFilterName(e.target.value)}
                  />
                  <SelectFuncao value={filterFunc} callFunc={setFilterFunc} />
                  <SelectOper value={filterOp} callFunc={setFilterOp} />
                  <Button color='blue' onClick={filters}>
                     <FaFilter className='h-4 w-4' />
                  </Button>
               </div>
               <div className='hidden lg:flex'>
                  <SearchUser
                     uae={uae}
                     trips={trips}
                     updateTrips={getListTrips}
                  />
               </div>
            </div>
            <div className='mt-4 w-full lg:max-w-[50%] sm:max-h-[90%] overflow-auto shadow-md max-h-[80%]'>
               <Table hoverable theme={themeTable}>
                  <Table.Head className='text-center'>
                     <Table.HeadCell className='hidden md:table-cell'>
                        #
                     </Table.HeadCell>
                     <Table.HeadCell className=''>P/G</Table.HeadCell>
                     <Table.HeadCell className='hidden md:table-cell'>
                        Especialidade
                     </Table.HeadCell>
                     <Table.HeadCell className='hidden md:table-cell'>
                        Nome de Guerra
                     </Table.HeadCell>
                     <Table.HeadCell>Trigrama</Table.HeadCell>
                     <Table.HeadCell>Função</Table.HeadCell>
                     <Table.HeadCell>Oper</Table.HeadCell>
                     <Table.HeadCell>
                        <span className='sr-only'>Detalhes</span>
                     </Table.HeadCell>
                  </Table.Head>
                  <Table.Body>
                     {filterTrips.map((trip) => (
                        <Table.Row key={trip.id}>
                           <Table.Cell className='hidden md:table-cell text-slate-300'>
                              {trip.id}
                           </Table.Cell>
                           <Table.Cell className='font-medium'>
                              {trip.user.posto.short}
                           </Table.Cell>
                           <Table.Cell className='hidden md:table-cell'>
                              {trip.user.esp}
                           </Table.Cell>
                           <Table.Cell className='hidden md:table-cell'>
                              {trip.user.nome_guerra}
                           </Table.Cell>
                           <Table.Cell className='font-semibold'>
                              {trip.trig}
                           </Table.Cell>
                           <Table.Cell className=''>
                              {trip.funcs.length < 1 ? (
                                 <span className='text-red-600 text-xs'>
                                    Sem Função
                                 </span>
                              ) : (
                                 trip.funcs[0]["func"]
                              )}
                           </Table.Cell>
                           <Table.Cell className='justify-items-center'>
                              {trip.funcs.length < 1 ? (
                                 <span className='text-red-600 text-xs'>
                                    Sem Função
                                 </span>
                              ) : (
                                 <OperBadge oper={trip.funcs[0]["oper"]} />
                              )}
                           </Table.Cell>
                           <Table.Cell className='justify-items-center'>
                              <PermBased
                                 resource={"trips"}
                                 requiredPerm={"create"}
                              >
                                 <TripDetail
                                    trip={trip}
                                    update={getListTrips}
                                 />
                              </PermBased>
                           </Table.Cell>
                        </Table.Row>
                     ))}
                  </Table.Body>
               </Table>
            </div>
         </div>
      </>
   );
}
