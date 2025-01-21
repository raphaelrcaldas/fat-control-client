"use client";

import { useState, useEffect } from "react";
import { Table, TextInput, Button, Select } from "flowbite-react";
import { IoSearchSharp } from "react-icons/io5";
import { FaFilter } from "react-icons/fa";

import { SearchUser } from "./components/searchUserTrip";
import { getTrips } from "@/services/routes/trips";
import { SelectFuncao, SelectOper } from "../components/inputForm";
import { FuncBadge } from "../components/badges";
import { TripDetail } from "./components/tripDetail";

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
            base: "bg-gray-200 px-6 py-3 group-first/head:first:rounded-tl-lg group-first/head:last:rounded-tr-lg dark:bg-gray-700",
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
            data.sort((a, b) => {
               const nameA = a.user.nome_guerra;
               const nameB = b.user.nome_guerra;
               if (nameA < nameB) return -1;
               if (nameA > nameB) {
                  return 1;
               }
               return 0;
            });

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
         <h2>Tripulantes</h2>
         <div className='w-[60rem]'>
            <div className='mt-4 flex gap-2 hidden'>
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
            <div className='mt-4 flex justify-between'>
               <div className='flex gap-2'>
                  <TextInput
                     className='w-80'
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
               <div>
                  <SearchUser
                     uae={uae}
                     trips={trips}
                     updateTrips={getListTrips}
                  />
               </div>
            </div>
            <div className='mt-4 overflow-x-auto shadow-md'>
               <Table hoverable theme={themeTable}>
                  <Table.Head className='text-center'>
                     <Table.HeadCell>P/G</Table.HeadCell>
                     <Table.HeadCell>Especialidade</Table.HeadCell>
                     <Table.HeadCell className='text-left'>
                        Nome de Guerra
                     </Table.HeadCell>
                     <Table.HeadCell>Trigrama</Table.HeadCell>
                     <Table.HeadCell>Função</Table.HeadCell>
                     <Table.HeadCell>
                        <span className='sr-only'>Detalhes</span>
                     </Table.HeadCell>
                  </Table.Head>
                  <Table.Body>
                     {filterTrips.map((trip) => (
                        <Table.Row key={trip.id}>
                           <Table.Cell className='font-medium'>
                              {trip.user.p_g}
                           </Table.Cell>
                           <Table.Cell>{trip.user.esp}</Table.Cell>
                           <Table.Cell className='text-left'>
                              {trip.user.nome_guerra}
                           </Table.Cell>
                           <Table.Cell className=''>{trip.trig}</Table.Cell>
                           <Table.Cell className='grid justify-items-center py-2'>
                              {trip.funcs.length < 1 ? (
                                 <span className='text-red-600 text-xs'>
                                    Sem Função
                                 </span>
                              ) : (
                                 trip.funcs.map((f) => (
                                    <FuncBadge
                                       key={f.id}
                                       funcao={f.func}
                                       oper={f.oper}
                                    />
                                 ))
                              )}
                           </Table.Cell>
                           <Table.Cell className='justify-items-center'>
                              <TripDetail trip={trip} update={getListTrips} />
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
