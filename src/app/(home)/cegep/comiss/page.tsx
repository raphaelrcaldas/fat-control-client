"use client";

import { useEffect, useState } from "react";
import { Spinner } from "flowbite-react";
import { CardComiss } from "./components/cardComiss";
import { FormComiss } from "./components/formComiss";
import { getCmtos, ComissWithMiss } from "services/routes/cegep/comiss";

export default function HomeApp() {
   const [cmtos, setCmtos] = useState<ComissWithMiss[]>([]);
   const [loading, setLoading] = useState(false);
   const [showFormComiss, setShowFormComiss] = useState(false);

   async function updateCmtos() {
      setLoading(true);
      try {
         const data = await getCmtos();

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
   }

   useEffect(() => {
      updateCmtos();
   }, []);

   return (
      <>
         <div className='flex flex-col gap-2'>
            <section className='flex flex-col overflow-y-auto'>
               <div className='w-full p-2'>
                  <div className='relative overflow-hidden bg-white shadow-md dark:bg-gray-800 sm:rounded-lg'>
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
                        <button
                           type='button'
                           onClick={() => setShowFormComiss(true)}
                           className='flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'
                        >
                           Adicionar
                        </button>
                     </div>
                  </div>
               </div>
               {/* <div className='p-2 flex flex-row gap-4 w-full justify-center'>
                  <div className='flex flex-row gap-2 items-center'>
                     <Label>Início</Label>
                     <input
                        type='date'
                        // value={dataInicio}
                        // onChange={(e) => setDataInicio(e.target.value)}
                        className='block text-center p-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500'
                     />
                  </div>
                  <div className='flex flex-row gap-2 items-center'>
                     <Label>Fim</Label>
                     <input
                        type='date'
                        // value={dataFim}
                        // onChange={(e) => setDataFim(e.target.value)}
                        className='block text-center p-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500'
                     />
                  </div>
               </div> */}
               <div className='flex-1 p-2'>
                  {loading ? (
                     <div className='flex-1 flex flex-col font-semibold items-center justify-center gap-2 p-2'>
                        Carregando <Spinner size='lg' color='failure' />
                     </div>
                  ) : (
                     <div className='flex flex-wrap gap-4 justify-evenly'>
                        {cmtos.length === 0 ? (
                           <p>Nenhum comissionamento encontrado.</p>
                        ) : (
                           cmtos.map((c) => (
                              <CardComiss
                                 key={c.id}
                                 comiss={c}
                                 update={updateCmtos}
                              />
                           ))
                        )}
                     </div>
                  )}
               </div>
            </section>
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
