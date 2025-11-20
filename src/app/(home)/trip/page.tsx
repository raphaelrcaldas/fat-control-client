"use client";

import { useState, useEffect } from "react";
import {
   Table,
   TableHeadCell,
   TableHead,
   TableBody,
   TableRow,
   TextInput,
   Badge,
   Label,
} from "flowbite-react";
import { Spinner } from "@/components/Spinner";
import { IoSearchSharp } from "react-icons/io5";
import {
   HiUserGroup,
   HiExclamationCircle,
   HiX,
   HiFilter,
   HiShieldCheck,
   HiBriefcase,
   HiAcademicCap,
} from "react-icons/hi";

import { postoGradRecords } from "services/routes/postos";
import { SearchUser } from "./components/searchUserTrip";
import { TripRow } from "./components/TripRow";
import { MultiSelect } from "./components/MultiSelect";
import { PermBased } from "../hooks/usePermBased";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import { useTripList } from "./hooks/useTripList";

const FUNC_LABELS: Record<string, string> = {
   pil: "Piloto",
   mc: "Mecânico de Voo",
   lm: "Loadmaster",
   oe: "Operador de Equipamentos",
   os: "Observador-SAR",
   tf: "Comissário",
   ml: "Mestre de Lançamento",
   md: "Médico",
};

const OPER_LABELS: Record<string, string> = {
   ba: "Básico",
   op: "Operacional",
   in: "Instrutor",
   al: "Aluno",
};

export default function TripPage() {
   const [uae] = useState("11gt");
   const [active] = useState(true);
   const [filterName, setFilterName] = useState("");
   const [showFilters, setShowFilters] = useState(false);
   const [isFiltering, setIsFiltering] = useState(false);
   const debouncedFilter = useDebouncedValue(filterName, 300);

   const {
      trips,
      filterTrips,
      loading,
      refetch,
      filters,
      updateFilter,
      clearFilters,
   } = useTripList({
      uae,
      active,
   });

   useEffect(() => {
      setIsFiltering(true);
      updateFilter("name", debouncedFilter);
      setTimeout(() => setIsFiltering(false), 400);
   }, [debouncedFilter]);

   const hasActiveFilters =
      filters.p_g.length > 0 ||
      filters.func.length > 0 ||
      filters.oper.length > 0 ||
      filters.name !== "";

   const activeFiltersCount =
      filters.p_g.length +
      filters.func.length +
      filters.oper.length +
      (filters.name ? 1 : 0);

   return (
      <div className='flex flex-col h-full overflow-hidden'>
         {/* Header Section */}
         <section className='flex-shrink-0 mb-2 p-4'>
            <div className='flex items-center justify-between'>
               <div className='flex items-center gap-3'>
                  <HiUserGroup className='size-8 text-red-600' />
                  <div>
                     <h1 className='font-bold text-2xl text-gray-800'>
                        Tripulantes
                     </h1>
                     <p className='text-gray-600 text-sm'>
                        Gerencie todos os tripulantes cadastrados
                     </p>
                  </div>
               </div>
               <div className='flex items-center gap-2'>
                  <button
                     type='button'
                     onClick={() => setShowFilters(!showFilters)}
                     className='flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50'
                  >
                     <HiFilter />
                     {showFilters ? "Ocultar" : "Filtros"}
                     {hasActiveFilters && (
                        <Badge
                           color='red'
                           size='sm'
                           className='animate-in zoom-in-95 duration-200'
                        >
                           {activeFiltersCount}
                        </Badge>
                     )}
                  </button>
                  <PermBased resource={"trips"} requiredPerm={"create"}>
                     <SearchUser
                        uae={uae}
                        trips={trips}
                        updateTrips={refetch}
                     />
                  </PermBased>
               </div>
            </div>
         </section>

         {/* Filters Section */}
         {showFilters && (
            <section className='flex-shrink-0 mb-4 animate-in fade-in slide-in-from-top-3 duration-300 relative z-40'>
               <div className='bg-white border border-gray-200 rounded-lg p-4 shadow-sm'>
                  <div className='flex items-center justify-between mb-4'>
                     <h6 className='text-sm font-medium text-gray-700'>
                        Filtros
                     </h6>
                  </div>

                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
                     {/* Busca por Nome */}
                     <div>
                        <Label className='mb-1.5 text-xs text-gray-600 flex items-center gap-1.5'>
                           <IoSearchSharp className='text-gray-500' />
                           Nome/Trigrama
                        </Label>
                        <TextInput
                           type='text'
                           value={filterName}
                           onChange={(e) => setFilterName(e.target.value)}
                           placeholder='Buscar...'
                           sizing='sm'
                        />
                     </div>

                     {/* Posto/Graduação */}
                     <div>
                        <Label className='mb-1.5 text-xs text-gray-600 flex items-center gap-1.5'>
                           <HiShieldCheck className='text-gray-500' />
                           Posto/Graduação
                        </Label>
                        <MultiSelect
                           options={postoGradRecords.map((posto) => ({
                              value: posto.short,
                              label: posto.mid.toUpperCase(),
                           }))}
                           selected={filters.p_g}
                           onChange={(values) => updateFilter("p_g", values)}
                           placeholder='Selecione...'
                        />
                     </div>

                     {/* Função */}
                     <div>
                        <Label className='mb-1.5 text-xs text-gray-600 flex items-center gap-1.5'>
                           <HiBriefcase className='text-gray-500' />
                           Função
                        </Label>
                        <MultiSelect
                           options={Object.entries(FUNC_LABELS).map(
                              ([key, value]) => ({
                                 value: key,
                                 label: value.toUpperCase(),
                              })
                           )}
                           selected={filters.func}
                           onChange={(values) => updateFilter("func", values)}
                           placeholder='Selecione...'
                        />
                     </div>

                     {/* Operação */}
                     <div>
                        <Label className='mb-1.5 text-xs text-gray-600 flex items-center gap-1.5'>
                           <HiAcademicCap className='text-gray-500' />
                           Operacionalidade
                        </Label>
                        <MultiSelect
                           options={Object.entries(OPER_LABELS).map(
                              ([key, value]) => ({
                                 value: key,
                                 label: value,
                              })
                           )}
                           selected={filters.oper}
                           onChange={(values) => updateFilter("oper", values)}
                           placeholder='Selecione...'
                        />
                     </div>
                  </div>
               </div>
            </section>
         )}

         {/* Results Section */}
         <section className='flex-1 overflow-auto'>
            <div className='bg-gray-50 rounded-lg shadow-md border border-gray-200 h-full transition-all duration-300'>
               {loading ? (
                  <div className='flex flex-col justify-center items-center gap-3 bg-white rounded-lg m-2 py-12 animate-in fade-in duration-300'>
                     <Spinner size='xl' />
                     <p className='text-gray-500'>Carregando tripulantes...</p>
                  </div>
               ) : filterTrips.length === 0 ? (
                  <div className='flex flex-col justify-center items-center gap-3 text-gray-400 bg-white rounded-lg m-2 py-12 animate-in fade-in zoom-in-95 duration-300'>
                     <HiExclamationCircle className='size-16 opacity-30 animate-in zoom-in duration-500' />
                     <p className='text-center'>
                        {hasActiveFilters
                           ? "Nenhum tripulante encontrado com esses filtros"
                           : "Nenhum tripulante cadastrado"}
                     </p>
                     {hasActiveFilters && (
                        <button
                           onClick={() => {
                              clearFilters();
                              setFilterName("");
                           }}
                           className='text-sm text-red-600 hover:text-red-700 transition-all duration-150 hover:scale-105'
                        >
                           Limpar Filtros
                        </button>
                     )}
                  </div>
               ) : (
                  <div
                     className={`overflow-auto h-full transition-opacity duration-300 ${
                        isFiltering ? "opacity-60" : "opacity-100"
                     }`}
                  >
                     <Table hoverable>
                        <TableHead className='text-center sticky top-0 bg-gray-100 shadow-sm z-10'>
                           <TableRow>
                              <TableHeadCell>PG</TableHeadCell>
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
                                 update={refetch}
                              />
                           ))}
                        </TableBody>
                     </Table>

                     {/* Results Counter */}
                     <div className='bg-white border-t border-gray-200 px-4 py-3 sticky bottom-0'>
                        <p
                           className={`text-sm text-gray-600 text-center flex items-center justify-center gap-2 transition-all duration-300 ${
                              isFiltering ? "scale-95" : "scale-100"
                           }`}
                        >
                           {isFiltering && (
                              <span className='inline-block w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin'></span>
                           )}
                           <span>
                              Exibindo{" "}
                              <strong className='text-red-600'>
                                 {filterTrips.length}
                              </strong>{" "}
                              {filterTrips.length === 1
                                 ? "tripulante"
                                 : "tripulantes"}
                              {hasActiveFilters && (
                                 <span className='text-gray-500'>
                                    {" "}
                                    de{" "}
                                    <strong className='text-gray-700'>
                                       {trips.length}
                                    </strong>{" "}
                                    total
                                 </span>
                              )}
                           </span>
                        </p>
                     </div>
                  </div>
               )}
            </div>
         </section>
      </div>
   );
}
