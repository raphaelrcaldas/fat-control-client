"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Label, Select, TextInput, Badge } from "flowbite-react";
import { Spinner } from "@/components/Spinner";
import { ListComiss } from "./components/listComiss";
import { DetailComiss } from "./components/detailComiss";
import { getCmtos, ComissWithMiss } from "services/routes/cegep/comiss";
import { RoleBasedRoute } from "../../hooks/useRoleBased";
import { HiFilter, HiX } from "react-icons/hi";

export default function ComissPage() {
   const [cmtos, setCmtos] = useState<ComissWithMiss[]>([]);
   const [loading, setLoading] = useState(true);
   const [showFormComiss, setShowFormComiss] = useState(false);
   const [statusComis, setStatusComis] = useState("aberto");
   const [searchUser, setSearchUser] = useState("");
   const [filtersExpanded, setFiltersExpanded] = useState(false);

   const hasActiveFilters = !!(searchUser || statusComis !== "aberto");

   const clearFilters = () => {
      setSearchUser("");
      setStatusComis("aberto");
   };

   const updateCmtos = useCallback(async () => {
      setLoading(true);
      try {
         const data = await getCmtos(statusComis, searchUser);

         const sorted = data.sort((a, b) => {
            const antA = a.user.posto.ant;
            const antB = b.user.posto.ant;
            if (antA !== antB) return antA - antB;

            const promoA = a.user.ult_promo || "";
            const promoB = b.user.ult_promo || "";
            if (promoA !== promoB) return promoA.localeCompare(promoB);

            return (a.user.ant_rel ?? 0) - (b.user.ant_rel ?? 0);
         });

         setCmtos(sorted);
      } catch (error) {
         console.error("Erro ao carregar comissionamentos", error);
      } finally {
         setLoading(false);
      }
   }, [statusComis, searchUser]);

   useEffect(() => {
      const timer = setTimeout(() => {
         updateCmtos();
      }, 500);

      return () => clearTimeout(timer);
   }, [updateCmtos]);

   const memoComiss = useMemo(() => {
      return (
         <>
            {cmtos.map((c) => (
               <ListComiss key={c.id} comiss={c} update={updateCmtos} />
            ))}
         </>
      );
   }, [cmtos]);

   return (
      <>
         <div className='flex flex-col gap-3'>
            {/* Header Section */}
            <section className='flex-shrink-0'>
               <div className='bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden'>
                  <div className='px-6 py-5'>
                     <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                        {/* Title Section */}
                        <div className='flex items-center gap-3'>
                           <div className='bg-red-50 p-2.5 rounded-lg'>
                              <svg
                                 className='w-6 h-6 text-red-600'
                                 fill='none'
                                 stroke='currentColor'
                                 viewBox='0 0 24 24'
                              >
                                 <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                                 />
                              </svg>
                           </div>
                           <div>
                              <h5 className='text-xl font-bold text-gray-900'>
                                 Comissionamentos
                              </h5>
                              <p className='text-gray-600 text-sm'>
                                 Gerencie todos os comissionamentos
                              </p>
                           </div>
                        </div>

                        {/* Action Buttons */}
                        <div className='flex items-center gap-2'>
                           <button
                              type='button'
                              onClick={() => setFiltersExpanded(!filtersExpanded)}
                              className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
                           >
                              <HiFilter className='w-4 h-4' />
                              <span className='hidden sm:inline'>
                                 {filtersExpanded ? "Ocultar" : "Filtros"}
                              </span>
                              {hasActiveFilters && (
                                 <span className='flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full'>
                                    {
                                       Object.values({
                                          searchUser,
                                          statusComis:
                                             statusComis !== "aberto"
                                                ? statusComis
                                                : null,
                                       }).filter((v) => v).length
                                    }
                                 </span>
                              )}
                           </button>
                           <RoleBasedRoute requiredRoles={["apoio_avancado"]}>
                              <button
                                 type='button'
                                 onClick={() => setShowFormComiss(true)}
                                 className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors'
                              >
                                 <svg
                                    className='w-4 h-4'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                 >
                                    <path
                                       strokeLinecap='round'
                                       strokeLinejoin='round'
                                       strokeWidth={2}
                                       d='M12 4v16m8-8H4'
                                    />
                                 </svg>
                                 <span className='hidden sm:inline'>Novo</span>
                              </button>
                           </RoleBasedRoute>
                        </div>
                     </div>
                  </div>
               </div>
            </section>

            {/* Active Filters Tags */}
            {hasActiveFilters && (
               <section className='transition-all duration-300'>
                  <div className='flex flex-wrap items-center gap-2'>
                     <span className='text-xs font-medium text-gray-600'>
                        Filtros ativos:
                     </span>

                     {searchUser && (
                        <Badge color='red'>
                           <div className='flex items-center gap-1.5'>
                              <svg
                                 className='w-3 h-3'
                                 fill='none'
                                 stroke='currentColor'
                                 viewBox='0 0 24 24'
                              >
                                 <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                                 />
                              </svg>
                              <span>Militar: {searchUser}</span>
                              <button
                                 onClick={() => setSearchUser("")}
                                 className='ml-1 hover:text-red-600'
                              >
                                 <svg
                                    className='w-3 h-3'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                 >
                                    <path
                                       strokeLinecap='round'
                                       strokeLinejoin='round'
                                       strokeWidth={2}
                                       d='M6 18L18 6M6 6l12 12'
                                    />
                                 </svg>
                              </button>
                           </div>
                        </Badge>
                     )}

                     {statusComis !== "aberto" && (
                        <Badge color='info'>
                           <div className='flex items-center gap-1.5'>
                              <svg
                                 className='w-3 h-3'
                                 fill='none'
                                 stroke='currentColor'
                                 viewBox='0 0 24 24'
                              >
                                 <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                                 />
                              </svg>
                              <span>Situação: Fechado</span>
                              <button
                                 onClick={() => setStatusComis("aberto")}
                                 className='ml-1 hover:text-red-600'
                              >
                                 <svg
                                    className='w-3 h-3'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                 >
                                    <path
                                       strokeLinecap='round'
                                       strokeLinejoin='round'
                                       strokeWidth={2}
                                       d='M6 18L18 6M6 6l12 12'
                                    />
                                 </svg>
                              </button>
                           </div>
                        </Badge>
                     )}

                     <button
                        onClick={clearFilters}
                        className='text-xs text-gray-500 hover:text-gray-700 underline'
                     >
                        Limpar todos
                     </button>
                  </div>
               </section>
            )}

            {/* Filters Section */}
            {filtersExpanded && (
               <section className='flex-shrink-0'>
                  <div className='bg-white border border-gray-200 rounded-lg p-4'>
                     <div className='flex items-center justify-between mb-4'>
                        <h6 className='text-sm font-medium text-gray-700'>
                           Filtros
                        </h6>
                        {hasActiveFilters && (
                           <button
                              onClick={clearFilters}
                              className='flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg'
                           >
                              <HiX />
                              Limpar
                           </button>
                        )}
                     </div>

                     <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                        {/* Militar */}
                        <div>
                           <Label className='mb-1.5 text-xs text-gray-600 flex items-center gap-1.5'>
                              <svg
                                 className='w-4 h-4 text-gray-500'
                                 fill='none'
                                 stroke='currentColor'
                                 viewBox='0 0 24 24'
                              >
                                 <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                                 />
                              </svg>
                              Militar
                           </Label>
                           <TextInput
                              type='text'
                              value={searchUser}
                              onChange={(e) => setSearchUser(e.target.value)}
                              placeholder='Nome completo ou de guerra'
                              sizing='sm'
                           />
                        </div>

                        {/* Situação */}
                        <div>
                           <Label className='mb-1.5 text-xs text-gray-600 flex items-center gap-1.5'>
                              <svg
                                 className='w-4 h-4 text-gray-500'
                                 fill='none'
                                 stroke='currentColor'
                                 viewBox='0 0 24 24'
                              >
                                 <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                                 />
                              </svg>
                              Situação
                           </Label>
                           <Select
                              value={statusComis}
                              onChange={(e) => setStatusComis(e.target.value)}
                              className='text-sm'
                              sizing='sm'
                           >
                              <option value='aberto'>Aberto</option>
                              <option value='fechado'>Fechado</option>
                           </Select>
                        </div>
                     </div>
                  </div>
               </section>
            )}

            {/* Results Counter */}
            {!loading && cmtos.length > 0 && (
               <div className='flex items-center gap-2 text-sm text-gray-600'>
                  <svg
                     className='w-4 h-4'
                     fill='none'
                     stroke='currentColor'
                     viewBox='0 0 24 24'
                  >
                     <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                     />
                  </svg>
                  <span className='font-medium'>
                     {cmtos.length}{" "}
                     {cmtos.length === 1
                        ? "comissionamento encontrado"
                        : "comissionamentos encontrados"}
                  </span>
               </div>
            )}

            {/* Content Section */}
            <div className='flex-1 min-h-[200px]'>
               {loading ? (
                  <div className='flex flex-col items-center justify-center gap-4 py-16'>
                     <Spinner size='xl' />
                     <p className='text-sm font-medium text-gray-600'>
                        Carregando comissionamentos...
                     </p>
                  </div>
               ) : cmtos.length === 0 ? (
                  <div className='flex flex-col items-center justify-center py-16 px-4'>
                     <div className='bg-gray-50 rounded-full p-6 mb-4'>
                        <svg
                           className='w-16 h-16 text-gray-400'
                           fill='none'
                           stroke='currentColor'
                           viewBox='0 0 24 24'
                        >
                           <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={1.5}
                              d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                           />
                        </svg>
                     </div>
                     <h3 className='text-lg font-semibold text-gray-900 mb-1'>
                        Nenhum comissionamento encontrado
                     </h3>
                     <p className='text-sm text-gray-500'>
                        Tente ajustar os filtros ou adicione um novo
                        comissionamento
                     </p>
                  </div>
               ) : (
                  <div className='space-y-1'>{memoComiss}</div>
               )}
            </div>
         </div>

         {showFormComiss && (
            <DetailComiss
               show={showFormComiss}
               setShow={setShowFormComiss}
               update={updateCmtos}
            />
         )}
      </>
   );
}
