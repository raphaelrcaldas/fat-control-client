"use client";

import { useEffect, useState, useCallback } from "react";
import {
   getDadosBancarios,
   DadosBancariosWithUser,
} from "services/routes/cegep/dadosBancarios";
import { TextInput, Badge } from "flowbite-react";
import { HiSearch, HiX, HiPlus, HiOfficeBuilding } from "react-icons/hi";
import { Spinner } from "@/components/Spinner";
import ListDadosBancarios from "./components/listDadosBancarios";
import DetailDadosBancarios from "./components/detailDadosBancarios";
import { RoleBasedRoute } from "../../hooks/useRoleBased";

export default function DadosBancariosPage() {
   const [dadosBancarios, setDadosBancarios] = useState<
      DadosBancariosWithUser[]
   >([]);
   const [loading, setLoading] = useState(true);
   const [searchUser, setSearchUser] = useState("");
   const [showCreate, setShowCreate] = useState(false);

   const hasActiveFilters = !!searchUser;

   const clearFilters = () => {
      setSearchUser("");
   };

   const updateDadosBancarios = useCallback(async () => {
      setLoading(true);
      try {
         const data = await getDadosBancarios(undefined, searchUser);

         // Ordenar por posto e antiguidade
         const sorted = data.sort((a, b) => {
            const antA = a.user.posto.ant;
            const antB = b.user.posto.ant;
            if (antA !== antB) return antA - antB;
            return (a.user.ant_rel ?? 0) - (b.user.ant_rel ?? 0);
         });

         setDadosBancarios(sorted);
      } catch (error) {
         console.error("Erro ao carregar dados bancários", error);
      } finally {
         setLoading(false);
      }
   }, [searchUser]);

   useEffect(() => {
      const timer = setTimeout(() => {
         updateDadosBancarios();
      }, 500);

      return () => clearTimeout(timer);
   }, [updateDadosBancarios]);

   return (
      <div className='flex flex-col gap-3'>
         {/* Header Section */}
         <section className='flex-shrink-0'>
            <div className='bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden dark:bg-gray-800 dark:border-gray-700'>
               <div className='px-6 py-5'>
                  <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                     {/* Title Section */}
                     <div className='flex items-center gap-3'>
                        <div className='bg-red-50 p-2.5 rounded-lg dark:bg-red-900/20'>
                           <HiOfficeBuilding className='w-6 h-6 text-red-600 dark:text-red-400' />
                        </div>
                        <div>
                           <h5 className='text-xl font-bold text-gray-900 dark:text-white'>
                              Dados Bancários
                           </h5>
                           <p className='text-gray-600 text-sm dark:text-gray-400'>
                              Gerencie contas correntes dos militares
                           </p>
                        </div>
                     </div>

                     {/* Action Button */}
                     <RoleBasedRoute requiredRoles={["apoio_avancado"]}>
                        <button
                           type='button'
                           onClick={() => setShowCreate(true)}
                           className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors dark:bg-red-500 dark:hover:bg-red-600'
                        >
                           <HiPlus className='w-4 h-4' />
                           <span className=''>Cadastrar</span>
                        </button>
                     </RoleBasedRoute>
                  </div>

                  {/* Search Bar */}
                  <div className='mt-4'>
                     <div className='relative'>
                        <HiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                        <TextInput
                           id='search'
                           type='text'
                           placeholder='Buscar por nome de guerra ou nome completo...'
                           value={searchUser}
                           onChange={(e) => setSearchUser(e.target.value)}
                           className='pl-10'
                        />
                     </div>
                  </div>
               </div>

               {/* Stats Bar */}
               {!loading && (
                  <div className='bg-gray-50 px-6 py-3 border-t border-gray-200 dark:bg-gray-900 dark:border-gray-700'>
                     <div className='flex items-center justify-between text-sm'>
                        <div className='flex items-center gap-4'>
                           <span className='text-gray-600 dark:text-gray-400'>
                              Total:{" "}
                              <strong className='text-gray-900 dark:text-white'>
                                 {dadosBancarios.length}
                              </strong>
                           </span>
                        </div>
                        {hasActiveFilters && (
                           <button
                              onClick={clearFilters}
                              className='flex items-center gap-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300'
                           >
                              <HiX className='w-4 h-4' />
                              <span>Limpar filtros</span>
                           </button>
                        )}
                     </div>
                  </div>
               )}
            </div>
         </section>

         {/* Active Filters Tags */}
         {hasActiveFilters && (
            <section className='transition-all duration-300'>
               <div className='flex flex-wrap items-center gap-2'>
                  <span className='text-xs font-medium text-gray-600 dark:text-gray-400'>
                     Filtros ativos:
                  </span>
                  {searchUser && (
                     <Badge color='failure'>
                        <div className='flex items-center gap-1.5'>
                           <span>Busca: {searchUser}</span>
                           <button
                              onClick={() => setSearchUser("")}
                              className='hover:bg-red-200 rounded-full p-0.5'
                           >
                              <HiX className='w-3 h-3' />
                           </button>
                        </div>
                     </Badge>
                  )}
               </div>
            </section>
         )}

         {/* Content Section */}
         <section className='flex-1 overflow-auto'>
            {loading ? (
               <div className='flex justify-center items-center h-64'>
                  <Spinner size='xl' />
               </div>
            ) : dadosBancarios.length === 0 ? (
               <div className='flex flex-col items-center justify-center h-64 bg-white rounded-xl border-2 border-dashed border-gray-300 dark:bg-gray-800 dark:border-gray-700'>
                  <HiOfficeBuilding className='w-16 h-16 text-gray-400 mb-4' />
                  <p className='text-gray-500 dark:text-gray-400 text-lg font-medium'>
                     {searchUser
                        ? "Nenhum resultado encontrado"
                        : "Nenhum dado bancário cadastrado"}
                  </p>
                  {searchUser && (
                     <button
                        onClick={clearFilters}
                        className='mt-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400'
                     >
                        Limpar busca
                     </button>
                  )}
               </div>
            ) : (
               <ListDadosBancarios
                  dados={dadosBancarios}
                  update={updateDadosBancarios}
               />
            )}
         </section>

         {/* Modal de criação */}
         {showCreate && (
            <DetailDadosBancarios
               show={showCreate}
               onClose={() => setShowCreate(false)}
               update={updateDadosBancarios}
            />
         )}
      </div>
   );
}
