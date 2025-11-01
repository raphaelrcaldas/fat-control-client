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
         <div className='flex flex-col gap-1.5'>
            {cmtos.map((c) => (
               <ListComiss key={c.id} comiss={c} update={updateCmtos} />
            ))}
         </div>
      );
   }, [cmtos]);

   return (
      <>
         <div className='flex flex-col gap-1'>
            <section className='flex flex-col overflow-y-auto'>
               <div className='w-full p-2'>
                  <div className='relative overflow-hidden bg-white shadow-md sm:rounded-lg'>
                     <div className='flex-row items-center justify-between p-4 space-y-3 sm:flex sm:space-y-0 sm:space-x-4'>
                        <div>
                           <h5 className='mr-3 font-semibold text-lg dark:text-white'>
                              Comissionamentos
                           </h5>
                           <p className='text-gray-500'>
                              Gerencie todos os comissionamentos existentes ou
                              crie um novo
                           </p>
                        </div>
                        <RoleBasedRoute requiredRoles={["apoio_avancado"]}>
                           <button
                              type='button'
                              onClick={() => setShowFormComiss(true)}
                              className='flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'
                           >
                              Adicionar
                           </button>
                        </RoleBasedRoute>
                     </div>
                  </div>
               </div>
            </section>

            <RoleBasedRoute requiredRoles={["apoio_avancado"]}>
               <section>
                  <div className='w-full p-2'>
                     <div className='relative overflow-hidden bg-white shadow-md sm:rounded-lg flex flex-row justify-between'>
                        <div className='flex-row items-center justify-evenly p-4 space-y-3 sm:flex sm:space-y-0 sm:space-x-4'>
                           <div className='w-80'>
                              <div className='mb-2 text-center'>
                                 <Label>Militar</Label>
                              </div>
                              <TextInput
                                 type='text'
                                 value={searchUser}
                                 onChange={(e) => setSearchUser(e.target.value)}
                                 placeholder='Nome completo ou de guerra'
                              />
                           </div>
                           <div>
                              <div className='mb-2 text-center'>
                                 <Label>Situação</Label>
                              </div>
                              <Select
                                 value={statusComis}
                                 onChange={(e) =>
                                    setStatusComis(e.target.value)
                                 }
                              >
                                 <option value='aberto'>Aberto</option>
                                 <option value='fechado'>Fechado</option>
                              </Select>
                           </div>
                        </div>
                     </div>
                  </div>
               </section>
            </RoleBasedRoute>

            <div className='flex-1 p-2'>
               {loading ? (
                  <div className='flex-1 flex flex-col font-semibold items-center justify-center gap-2 p-2'>
                     Carregando <Spinner size='lg' color='failure' />
                  </div>
               ) : cmtos.length === 0 ? (
                  <p>Nenhum comissionamento encontrado.</p>
               ) : (
                  memoComiss
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
