"use client";

import { getFragMissoes } from "services/routes/cegep/missoes";
import { useEffect, useState } from "react";
import { Label, HR, Spinner } from "flowbite-react";
import { Missao } from "services/routes/cegep/missoes";
import { CardMission } from "./components/cardMission";
import MissionDetail from "./components/missionDetail";
import { useRegisterContext } from "../../context/registerContext";

export function RegisPage() {
   const [missoes, setMissoes] = useState<Missao[] | null>(null);
   const [cloneMis, setCloneMis] = useState<Missao | null>(null);
   const [showForm, setShowForm] = useState(false);
   const [loading, setLoading] = useState(true);
   const { dataInicio, setDataInicio, dataFim, setDataFim } =
      useRegisterContext();

   function updateMis() {
      setLoading(true);
      getFragMissoes(dataInicio, dataFim)
         .then((data) => {
            setMissoes(data);
         })
         .finally(() => setLoading(false));
   }

   useEffect(() => {
      if (dataInicio && dataFim) {
         updateMis();
      }
   }, [dataInicio, dataFim]);

   return (
      <>
         <div className='h-full'>
            <section className='flex flex-col bg-gray-50 dark:bg-gray-900'>
               <div className='w-full max-w-screen-xl p-2 mx-auto lg:px-12'>
                  <div className='relative overflow-hidden bg-white shadow-md dark:bg-gray-800 sm:rounded-lg'>
                     <div className='flex-row items-center justify-between p-4 space-y-3 sm:flex sm:space-y-0 sm:space-x-4'>
                        <div>
                           <h5 className='mr-3 font-semibold text-lg dark:text-white'>
                              Missões
                           </h5>
                           <p className='text-gray-500 dark:text-gray-400'>
                              Gerencie todas as missões existentes ou crie uma
                              nova
                           </p>
                        </div>
                        <button
                           type='button'
                           onClick={() => setShowForm(true)}
                           className='flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'
                        >
                           Adicionar Missão
                        </button>
                     </div>
                  </div>
               </div>
               <div className='p-2 flex flex-row gap-4 w-full justify-center'>
                  <div className='flex flex-row gap-2 items-center'>
                     <Label>Início</Label>
                     <input
                        type='date'
                        value={dataInicio}
                        onChange={(e) => setDataInicio(e.target.value)}
                        className='block text-center p-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500'
                     />
                  </div>
                  <div className='flex flex-row gap-2 items-center'>
                     <Label>Fim</Label>
                     <input
                        type='date'
                        value={dataFim}
                        onChange={(e) => setDataFim(e.target.value)}
                        className='block text-center p-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500'
                     />
                  </div>
               </div>
               <HR />

               {loading ? (
                  <div className='flex flex-col font-semibold items-center justify-center gap-2 p-2'>
                     Carregando <Spinner size='lg' color='failure' />
                  </div>
               ) : (
                  <div className='flex p-2 flex-wrap gap-4'>
                     {missoes.length === 0 ? (
                        <p>Nenhuma missão encontrada.</p>
                     ) : (
                        missoes.map((m) => (
                           <CardMission
                              key={m.id}
                              missao={m}
                              update={updateMis}
                              setClone={setCloneMis}
                              setShowForm={setShowForm}
                           />
                        ))
                     )}
                  </div>
               )}
            </section>
         </div>

         {showForm && (
            <MissionDetail
               show={showForm}
               edit={true}
               missao={cloneMis}
               setShow={setShowForm}
               update={updateMis}
               setClone={setCloneMis}
            />
         )}
      </>
   );
}
