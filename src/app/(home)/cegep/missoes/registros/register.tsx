"use client";

import { getFragMissoes } from "services/routes/cegep/missoes";
import { useEffect, useState, useMemo } from "react";
import { Label, Spinner, Select, TextInput, Button } from "flowbite-react";
import { Missao } from "services/routes/cegep/missoes";
import { CardMission } from "./components/cardMission";
import MissionDetail from "./components/missionDetail";
import { useRegisterContext } from "../../context/registerContext";

export function RegisPage() {
   const [missoes, setMissoes] = useState<Missao[] | null>(null);
   const [cloneMis, setCloneMis] = useState<Missao | null>(null);
   const [showForm, setShowForm] = useState(false);
   const [loading, setLoading] = useState(true);
   const {
      dataInicio,
      setDataInicio,
      dataFim,
      setDataFim,
      tipoDoc,
      setTipoDoc,
      nDoc,
      setNDoc,
      selectedTipo,
      setSelectedTipo,
      userSearch,
      setUserSearch,
      citySearch,
      setCitySearch,
   } = useRegisterContext();

   const fetchData = async () => {
      setLoading(true);

      let req: { [key: string]: any } = {};

      if (tipoDoc) req.tipo_doc = tipoDoc;
      if (nDoc) req.n_doc = nDoc;
      if (selectedTipo) req.tipo = selectedTipo;
      if (dataInicio) req.ini = dataInicio;
      if (dataFim) req.fim = dataFim;
      if (userSearch) req.user_search = userSearch;
      if (citySearch) req.city = citySearch;

      const data = await getFragMissoes(req);

      setMissoes(data);
      setLoading(false);
   };

   const memoizedMissoes = useMemo(() => {
      return missoes?.map((m) => (
         <CardMission
            key={m.id}
            missao={m}
            update={fetchData}
            setClone={setCloneMis}
            setShowForm={setShowForm}
         />
      ));
   }, [missoes]);

   useEffect(() => {
      fetchData();
   }, []);

   return (
      <>
         <div className='h-full'>
            <section className='flex flex-col'>
               <div className='w-full p-2'>
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
            </section>

            <section className='flex flex-col mb-3'>
               <div className='w-full p-2'>
                  <div className='relative overflow-hidden bg-white shadow-md sm:rounded-lg'>
                     <div className='flex-row items-center justify-evenly p-4 space-y-3 sm:flex sm:space-y-0 sm:space-x-4'>
                        <div>
                           <div className='mb-2 text-center'>
                              <Label>Tipo da Ordem</Label>
                           </div>
                           <Select
                              value={tipoDoc}
                              onChange={(e) => setTipoDoc(e.target.value)}
                           >
                              <option value=''>Selecione</option>
                              <option value='om'>Missão</option>
                              <option value='os'>Serviço</option>
                           </Select>
                        </div>
                        <div className='w-24'>
                           <div className='mb-2 text-center'>
                              <Label>Nº da Ordem</Label>
                           </div>
                           <TextInput
                              type='text'
                              value={nDoc ?? ""}
                              onChange={(e) =>
                                 setNDoc(
                                    e.target.value === ""
                                       ? undefined
                                       : Number(e.target.value)
                                 )
                              }
                              onKeyDown={(e) => {
                                 if (
                                    !(
                                       (e.key >= "0" && e.key <= "9") ||
                                       [
                                          "Backspace",
                                          "Tab",
                                          "Delete",
                                          "ArrowLeft",
                                          "ArrowRight",
                                       ].includes(e.key)
                                    )
                                 ) {
                                    e.preventDefault();
                                 }
                              }}
                           />
                        </div>

                        <div>
                           <div className='mb-2 text-center'>
                              <Label>Tipo de Missão</Label>
                           </div>
                           <Select
                              value={selectedTipo}
                              onChange={(e) => setSelectedTipo(e.target.value)}
                           >
                              <option value=''>Selecione</option>
                              <option value='tal'>TAL</option>
                              <option value='adm'>ADM</option>
                              <option value='opr'>OPR</option>
                           </Select>
                        </div>

                        <div className=''>
                           <div className='mb-2 text-center'>
                              <Label>Militar</Label>
                           </div>
                           <TextInput
                              type='text'
                              value={userSearch}
                              onChange={(e) => setUserSearch(e.target.value)}
                              placeholder='Nome de guerra'
                           />
                        </div>

                        <div className=''>
                           <div className='mb-2 text-center'>
                              <Label>Cidade</Label>
                           </div>
                           <TextInput
                              type='text'
                              value={citySearch}
                              onChange={(e) => setCitySearch(e.target.value)}
                              placeholder='Nome do municípo'
                           />
                        </div>

                        <div className='w-40'>
                           <div className='mb-2 text-center'>
                              <Label>Afastamento</Label>
                           </div>
                           <input
                              type='date'
                              value={dataInicio}
                              onChange={(e) => setDataInicio(e.target.value)}
                              className='block w-full text-center p-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500'
                           />
                        </div>
                        <div className='w-40'>
                           <div className='mb-2 text-center'>
                              <Label>Regresso</Label>
                           </div>
                           <input
                              type='date'
                              value={dataFim}
                              onChange={(e) => setDataFim(e.target.value)}
                              className='block w-full text-center p-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500'
                           />
                        </div>

                        <div className='pt-6'>
                           <Button color='light' pill onClick={fetchData}>
                              Filtrar
                           </Button>
                        </div>
                     </div>
                  </div>
               </div>
            </section>

            {loading ? (
               <div className='flex flex-col font-semibold items-center justify-center gap-2 p-2'>
                  Carregando <Spinner size='lg' color='failure' />
               </div>
            ) : (
               <div className='flex p-2 flex-wrap justify-evenly gap-4'>
                  {missoes.length === 0 ? (
                     <p>Nenhuma missão encontrada.</p>
                  ) : (
                     memoizedMissoes
                  )}
               </div>
            )}
         </div>

         {showForm && (
            <MissionDetail
               show={showForm}
               edit={true}
               missao={cloneMis}
               setShow={setShowForm}
               update={fetchData}
               setClone={setCloneMis}
            />
         )}
      </>
   );
}
