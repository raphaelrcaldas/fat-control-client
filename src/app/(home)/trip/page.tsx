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
   Badge,
} from "flowbite-react";
import { Spinner } from "@/components/Spinner";
import { IoSearchSharp } from "react-icons/io5";
import { HiUserGroup, HiExclamationCircle } from "react-icons/hi";

import { SearchUser } from "./components/searchUserTrip";
import { getTrips } from "services/routes/trips";
import { TripDetail } from "./components/tripDetail";
import { PermBased } from "../hooks/usePermBased";
import clsx from "clsx";
import useDebouncedValue from "../users/hooks/useDebouncedValue";

export default function TripPage() {
   const [trips, setTrips] = useState([]);
   const [filterTrips, setFilterTrips] = useState([]);

   const [uae] = useState("11gt");
   const [active] = useState(true);

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
         const checkGuerra = trip.user.nome_guerra
            .toLowerCase()
            .includes(inputFilter);

         return checkTrig || checkGuerra;
      });

      setFilterTrips(filter);
   }, [debouncedFilter, trips]);

   useEffect(() => {
      getListTrips();
   }, [uae, active]);

   return (
      <div className='flex flex-col h-full gap-4 p-2'>
         {/* Header Section */}
         <div className='bg-gradient-to-r from-blue-50 to-indigo-50 p-4 py-3 rounded-lg shadow-md border border-blue-200'>
            <div className='flex items-center gap-3 mb-2'>
               <HiUserGroup className='size-8 text-blue-600' />
               <div>
                  <h1 className='font-bold text-2xl text-gray-800'>
                     Tripulantes
                  </h1>
                  <p className='text-gray-600 text-sm'>
                     Gerencie todos os tripulantes cadastrados
                  </p>
               </div>
            </div>
         </div>

         {/* Filters Section */}
         <div className='bg-white p-4 rounded-lg shadow-md border border-gray-200'>
            <div className='flex flex-col sm:flex-row gap-3 items-center justify-between'>
               <TextInput
                  className='w-full sm:w-2/3'
                  icon={IoSearchSharp}
                  placeholder='Busque pelo nome de guerra ou trigrama'
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  sizing='md'
               />
               <div className='flex gap-2 items-center w-full sm:w-auto'>
                  {!loading && (
                     <Badge color='info' size='sm' className='px-3 py-1'>
                        {filterTrips.length}{" "}
                        {filterTrips.length === 1
                           ? "tripulante"
                           : "tripulantes"}
                     </Badge>
                  )}
                  <PermBased resource={"trips"} requiredPerm={"create"}>
                     <SearchUser
                        uae={uae}
                        trips={trips}
                        updateTrips={getListTrips}
                     />
                  </PermBased>
               </div>
            </div>
         </div>

         {/* Table Section */}
         <div className='overflow-auto bg-gray-50 rounded-lg shadow-md border border-gray-200'>
            {loading ? (
               <div className='flex flex-col justify-center items-center gap-3 bg-white rounded-lg m-2 py-12'>
                  <Spinner size='xl' />
                  <p className='text-gray-500'>Carregando tripulantes...</p>
               </div>
            ) : filterTrips.length === 0 ? (
               <div className='flex flex-col justify-center items-center gap-3 text-gray-400 bg-white rounded-lg m-2 py-12'>
                  <HiExclamationCircle className='size-16 opacity-30' />
                  <p className='text-center'>
                     {debouncedFilter
                        ? "Nenhum tripulante encontrado com esse filtro"
                        : "Nenhum tripulante cadastrado"}
                  </p>
               </div>
            ) : (
               <Table hoverable>
                  <TableHead className='text-center sticky top-0 bg-gray-100 shadow-sm'>
                     <TableRow>
                        <TableHeadCell className=''>PG</TableHeadCell>
                        <TableHeadCell className='hidden lg:table-cell'>
                           Especialidade
                        </TableHeadCell>
                        <TableHeadCell className='hidden md:table-cell'>
                           Nome de Guerra
                        </TableHeadCell>
                        <TableHeadCell>Trigrama</TableHeadCell>
                        <TableHeadCell>Funções</TableHeadCell>
                        <TableHeadCell>
                           <span className='sr-only'>Ações</span>
                        </TableHeadCell>
                     </TableRow>
                  </TableHead>
                  <TableBody className='divide-y bg-white'>
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
   );
}

function TripRow({ trip, update }) {
   const user = trip.user;
   const tripFuncs = trip.funcs;

   return (
      <TableRow className='uppercase text-center hover:bg-gray-50 transition-colors'>
         <TableCell className='font-bold text-gray-700'>
            {user.posto.short}
         </TableCell>
         <TableCell className='hidden lg:table-cell text-gray-600'>
            {user.esp}
         </TableCell>
         <TableCell className='hidden md:table-cell font-medium text-gray-800'>
            {user.nome_guerra}
         </TableCell>
         <TableCell className='font-bold text-blue-600'>{trip.trig}</TableCell>
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

function FuncTripRow({ func }) {
   const oper = func.oper;

   const getOperColor = () => {
      switch (oper) {
         case "al":
            return "text-emerald-700 bg-emerald-100";
         case "op":
         case "po":
         case "pb":
            return "text-yellow-700 bg-yellow-100";
         case "in":
            return "text-red-700 bg-red-100";
         default:
            return "text-gray-700 bg-gray-100";
      }
   };

   const getOperLabel = () => {
      switch (oper) {
         case "al":
            return "Aluno";
         case "op":
            return "Operacional";
         case "po":
            return "Operacional";
         case "pb":
            return "Básico";
         case "in":
            return "Instrutor";
         default:
            return oper;
      }
   };

   const getFuncLabel = () => {
      switch (func.func) {
         case "pil":
            return "Piloto";
         case "mc":
            return "Mecânico";
         case "lm":
            return "LoadMaster";
         case "tf":
            return "Comissário";
         case "os":
            return "Observador-SAR";
         case "oe":
            return "OE-3";
         default:
            return func.func;
      }
   };

   return (
      <div
         className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow'
         title={`${getFuncLabel()}: ${getOperLabel()}`}
      >
         <span className='text-gray-700'>{func.func}</span>
         <span className='text-gray-400'>•</span>
         <span className={clsx("px-1.5 py-0.5 rounded", getOperColor())}>
            {oper}
         </span>
      </div>
   );
}
