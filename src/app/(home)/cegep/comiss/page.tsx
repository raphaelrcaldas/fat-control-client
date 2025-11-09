"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Label, Select, Spinner, TextInput } from "flowbite-react";
import { ListComiss } from "./components/listComiss";
import { FormComiss } from "./components/formComiss";
import { getCmtos, ComissWithMiss } from "services/routes/cegep/comiss";
import { RoleBasedRoute } from "../../hooks/useRoleBased";

export default function ComissPage() {
   const [cmtos, setCmtos] = useState<ComissWithMiss[]>([]);
   const [loading, setLoading] = useState(true);
   const [showFormComiss, setShowFormComiss] = useState(false);
   const [statusComis, setStatusComis] = useState("aberto");
   const [searchUser, setSearchUser] = useState("");

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
         <div className='flex flex-col gap-6'>
            {/* Header Section */}
            <section className='transition-all duration-300'>
               <div className='bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300 rounded-xl border border-gray-100'>
                  <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4'>
                     <div className='space-y-1'>
                        <h1 className='text-2xl font-bold text-gray-900 tracking-tight'>
                           Comissionamentos
                        </h1>
                        <p className='text-sm text-gray-500'>
                           Gerencie todos os comissionamentos existentes ou crie um novo
                        </p>
                     </div>
                     <RoleBasedRoute requiredRoles={["apoio_avancado"]}>
                        <button
                           type='button'
                           onClick={() => setShowFormComiss(true)}
                           className='flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-lg bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                        >
                           <span className='text-lg'>+</span>
                           Adicionar
                        </button>
                     </RoleBasedRoute>
                  </div>
               </div>
            </section>

            {/* Filters Section */}
            <RoleBasedRoute requiredRoles={["apoio_avancado"]}>
               <section className='transition-all duration-300'>
                  <div className='bg-white/80 backdrop-blur-sm shadow-sm rounded-xl border border-gray-100 p-6'>
                     <div className='flex flex-col sm:flex-row items-end gap-4'>
                        <div className='flex-1 w-full sm:max-w-md'>
                           <Label htmlFor='search-military' className='text-sm font-medium text-gray-700 mb-2 block'>
                              Militar
                           </Label>
                           <TextInput
                              id='search-military'
                              type='text'
                              value={searchUser}
                              onChange={(e) => setSearchUser(e.target.value)}
                              placeholder='Nome completo ou de guerra'
                              className='transition-all duration-200'
                           />
                        </div>
                        <div className='w-full sm:w-48'>
                           <Label htmlFor='status-filter' className='text-sm font-medium text-gray-700 mb-2 block'>
                              Situação
                           </Label>
                           <Select
                              id='status-filter'
                              value={statusComis}
                              onChange={(e) => setStatusComis(e.target.value)}
                              className='transition-all duration-200'
                           >
                              <option value='aberto'>Aberto</option>
                              <option value='fechado'>Fechado</option>
                           </Select>
                        </div>
                     </div>
                  </div>
               </section>
            </RoleBasedRoute>

            {/* Content Section */}
            <div className='flex-1 min-h-[200px]'>
               {loading ? (
                  <div className='flex flex-col items-center justify-center gap-4 py-16'>
                     <Spinner size='xl' color='info' />
                     <p className='text-sm font-medium text-gray-600'>Carregando comissionamentos...</p>
                  </div>
               ) : cmtos.length === 0 ? (
                  <div className='flex flex-col items-center justify-center py-16 px-4'>
                     <div className='bg-gray-50 rounded-full p-6 mb-4'>
                        <svg className='w-16 h-16 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                           <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                        </svg>
                     </div>
                     <h3 className='text-lg font-semibold text-gray-900 mb-1'>Nenhum comissionamento encontrado</h3>
                     <p className='text-sm text-gray-500'>Tente ajustar os filtros ou adicione um novo comissionamento</p>
                  </div>
               ) : (
                  <div className='space-y-3'>
                     {memoComiss}
                  </div>
               )}
            </div>
         </div>

         {showFormComiss && (
            <FormComiss
               show={showFormComiss}
               setShow={setShowFormComiss}
               update={updateCmtos}
            />
         )}
      </>
   );
}
