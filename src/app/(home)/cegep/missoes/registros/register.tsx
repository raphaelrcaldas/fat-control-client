"use client";

import { getFragMissoes } from "services/routes/cegep/missoes";
import { useEffect, useState, useCallback } from "react";
import { Label, Spinner, Select, TextInput, Badge } from "flowbite-react";
import { Missao } from "services/routes/cegep/missoes";
import { CardMission } from "./components/cardMission";
import MissionDetail from "./components/missionDetail";
import { useRegisterContext } from "../../context/registerContext";
import { HiX, HiFilter } from "react-icons/hi";

export function RegisPage() {
   const [missoes, setMissoes] = useState<Missao[] | null>(null);
   const [cloneMis, setCloneMis] = useState<Missao | null>(null);
   const [showForm, setShowForm] = useState(false);
   const [loading, setLoading] = useState(true);
   const [showFilters, setShowFilters] = useState(true);
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

   const hasActiveFilters = !!(
      tipoDoc ||
      nDoc ||
      selectedTipo ||
      userSearch ||
      citySearch
   );

   const clearFilters = () => {
      setTipoDoc("");
      setNDoc(undefined);
      setSelectedTipo("");
      setUserSearch("");
      setCitySearch("");
      const hoje = new Date();
      const quinzeDiasAntes = new Date(hoje.getFullYear(), 0, 1);
      setDataInicio(quinzeDiasAntes.toISOString().split("T")[0]);
      setDataFim(hoje.toISOString().split("T")[0]);
   };

   const fetchData = useCallback(async () => {
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
   }, [
      tipoDoc,
      nDoc,
      selectedTipo,
      dataInicio,
      dataFim,
      userSearch,
      citySearch,
   ]);

   const handleSetClone = useCallback((missao: Missao) => {
      setCloneMis(missao);
   }, []);

   const handleSetShowForm = useCallback((show: boolean) => {
      setShowForm(show);
   }, []);

   useEffect(() => {
      const timer = setTimeout(() => {
         fetchData();
      }, 500);

      return () => clearTimeout(timer);
   }, [fetchData]);

   return (
      <>
         <div className='h-full flex flex-col overflow-hidden'>
            {/* Header Section */}
            <section className='flex-shrink-0 mb-4'>
               <div className='flex items-center justify-between'>
                  <h5 className='font-semibold text-xl text-gray-800'>
                     Missões
                  </h5>
                  <div className='flex items-center gap-2'>
                     <button
                        type='button'
                        onClick={() => setShowFilters(!showFilters)}
                        className='flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50'
                     >
                        <HiFilter />
                        {showFilters ? "Ocultar" : "Filtros"}
                        {hasActiveFilters && (
                           <Badge color='gray' size='sm'>
                              {
                                 Object.values({
                                    tipoDoc,
                                    nDoc,
                                    selectedTipo,
                                    userSearch,
                                    citySearch,
                                 }).filter((v) => v).length
                              }
                           </Badge>
                        )}
                     </button>
                     <button
                        type='button'
                        onClick={() => handleSetShowForm(true)}
                        className='flex items-center gap-1.5 px-3 py-2 text-sm text-white rounded-lg bg-blue-600 hover:bg-blue-700'
                     >
                        <span>+</span>
                        Nova Missão
                     </button>
                  </div>
               </div>
            </section>

            {/* Filters Section */}
            {showFilters && (
               <section className='flex-shrink-0 mb-4'>
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

                     <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3'>
                        {/* Tipo da Ordem */}
                        <div>
                           <Label className='mb-1.5 text-xs text-gray-600'>
                              Tipo da Ordem
                           </Label>
                           <Select
                              value={tipoDoc}
                              onChange={(e) => setTipoDoc(e.target.value)}
                              className='text-sm'
                              sizing='sm'
                           >
                              <option value=''>Todos</option>
                              <option value='om'>Missão</option>
                              <option value='os'>Serviço</option>
                           </Select>
                        </div>

                        {/* Nº da Ordem */}
                        <div>
                           <Label className='mb-1.5 text-xs text-gray-600'>
                              Nº da Ordem
                           </Label>
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
                              placeholder='Número'
                              sizing='sm'
                           />
                        </div>

                        {/* Tipo de Missão */}
                        <div>
                           <Label className='mb-1.5 text-xs text-gray-600'>
                              Tipo de Missão
                           </Label>
                           <Select
                              value={selectedTipo}
                              onChange={(e) => setSelectedTipo(e.target.value)}
                              className='text-sm'
                              sizing='sm'
                           >
                              <option value=''>Todos</option>
                              <option value='tal'>TAL</option>
                              <option value='adm'>ADM</option>
                              <option value='opr'>OPR</option>
                           </Select>
                        </div>

                        {/* Militar */}
                        <div>
                           <Label className='mb-1.5 text-xs text-gray-600'>
                              Militar
                           </Label>
                           <TextInput
                              type='text'
                              value={userSearch}
                              onChange={(e) => setUserSearch(e.target.value)}
                              placeholder='Nome de guerra'
                              sizing='sm'
                           />
                        </div>

                        {/* Cidade */}
                        <div>
                           <Label className='mb-1.5 text-xs text-gray-600'>
                              Cidade
                           </Label>
                           <TextInput
                              type='text'
                              value={citySearch}
                              onChange={(e) => setCitySearch(e.target.value)}
                              placeholder='Município'
                              sizing='sm'
                           />
                        </div>

                        {/* Data Afastamento */}
                        <div>
                           <Label className='mb-1.5 text-xs text-gray-600'>
                              Afastamento
                           </Label>
                           <input
                              type='date'
                              value={dataInicio}
                              onChange={(e) => setDataInicio(e.target.value)}
                              className='block w-full p-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500'
                           />
                        </div>

                        {/* Data Regresso */}
                        <div>
                           <Label className='mb-1.5 text-xs text-gray-600'>
                              Regresso
                           </Label>
                           <input
                              type='date'
                              value={dataFim}
                              onChange={(e) => setDataFim(e.target.value)}
                              className='block w-full p-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500'
                           />
                        </div>
                     </div>
                  </div>
               </section>
            )}

            {/* Results Section */}
            <section className='flex-1'>
               {loading ? (
                  <div className='flex flex-col items-center justify-center gap-2 p-8 min-h-[300px]'>
                     <Spinner size='lg' />
                     <p className='text-sm text-gray-500'>Carregando...</p>
                  </div>
               ) : (
                  <div>
                     {/* Results Header */}
                     <div className='mb-3'>
                        <span className='text-sm text-gray-600'>
                           {missoes?.length || 0}{" "}
                           {missoes?.length === 1 ? "missão" : "missões"}
                        </span>
                     </div>

                     {/* Results Grid */}
                     {missoes?.length === 0 ? (
                        <div className='flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200'>
                           <p className='text-sm text-gray-600 mb-3'>
                              Nenhuma missão encontrada
                           </p>
                           {hasActiveFilters && (
                              <button
                                 onClick={clearFilters}
                                 className='text-sm text-blue-600 hover:text-blue-700'
                              >
                                 Limpar Filtros
                              </button>
                           )}
                        </div>
                     ) : (
                        <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3'>
                           {missoes?.map((m) => (
                              <CardMission
                                 key={m.id}
                                 missao={m}
                                 update={fetchData}
                                 setClone={handleSetClone}
                                 setShowForm={handleSetShowForm}
                              />
                           ))}
                        </div>
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
               setShow={handleSetShowForm}
               update={fetchData}
               setClone={handleSetClone}
            />
         )}
      </>
   );
}
