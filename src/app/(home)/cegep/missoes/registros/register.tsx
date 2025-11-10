"use client";

import { getFragMissoes } from "services/routes/cegep/missoes";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Label, Spinner, Select, TextInput, Badge } from "flowbite-react";
import { Missao } from "services/routes/cegep/missoes";
import { CardMission } from "./components/cardMission";
import MissionDetail from "./components/missionDetail";
import { useRegisterContext } from "../../context/registerContext";
import {
   HiX,
   HiFilter,
   HiDocumentText,
   HiHashtag,
   HiUser,
   HiLocationMarker,
   HiCalendar,
   HiTag,
} from "react-icons/hi";

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
      const timer = setTimeout(() => {
         fetchData();
      }, 500);

      return () => clearTimeout(timer);
   }, [fetchData]);

   return (
      <>
         <div className='h-full flex flex-col'>
            {/* Header Section */}
            <section className='flex-shrink-0'>
               <div className='w-full p-3'>
                  <div className='relative overflow-hidden bg-gradient-to-br from-white to-gray-50 shadow-lg border-2 border-gray-100 rounded-2xl'>
                     <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 gap-4'>
                        <div className='flex-1'>
                           <h5 className='font-bold text-2xl text-gray-800 mb-1'>
                              Missões
                           </h5>
                           <p className='text-gray-600 text-sm'>
                              Gerencie todas as missões existentes ou crie uma
                              nova
                           </p>
                        </div>
                        <div className='flex items-center gap-2'>
                           <button
                              type='button'
                              onClick={() => setShowFilters(!showFilters)}
                              className='flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 transition-all'
                           >
                              <HiFilter className='text-lg' />
                              {showFilters ? "Ocultar" : "Filtros"}
                              {hasActiveFilters && (
                                 <Badge color='failure' size='sm'>
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
                              onClick={() => setShowForm(true)}
                              className='flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 shadow-md transition-all'
                           >
                              <span className='text-lg'>+</span>
                              Nova Missão
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </section>

            {/* Filters Section */}
            {showFilters && (
               <section className='flex-shrink-0 animate-in fade-in slide-in-from-top-4 duration-300'>
                  <div className='w-full px-3 pb-3'>
                     <div className='relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-white shadow-lg border-2 border-blue-100/50 rounded-2xl'>
                        {/* Background Decoration */}
                        <div className='absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/20 to-transparent rounded-full blur-3xl -z-10'></div>

                        <div className='p-5'>
                           <div className='flex items-center justify-between mb-5'>
                              <div className='flex items-center gap-2.5'>
                                 <div className='p-2 bg-blue-100 rounded-lg'>
                                    <HiFilter className='text-blue-600 text-lg' />
                                 </div>
                                 <div>
                                    <h6 className='font-bold text-gray-800 text-base'>
                                       Filtros de Busca
                                    </h6>
                                    <p className='text-xs text-gray-500'>
                                       Refine sua pesquisa
                                    </p>
                                 </div>
                              </div>
                              {hasActiveFilters && (
                                 <button
                                    onClick={clearFilters}
                                    className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all hover:shadow-md hover:scale-105 active:scale-95'
                                 >
                                    <HiX className='text-base' />
                                    Limpar Filtros
                                 </button>
                              )}
                           </div>

                           <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4'>
                              {/* Tipo da Ordem */}
                              <div className='flex flex-col group'>
                                 <Label className='mb-2 text-xs font-semibold text-gray-700 flex items-center gap-1.5'>
                                    <HiDocumentText className='text-blue-500 text-sm' />
                                    Tipo da Ordem
                                 </Label>
                                 <div className='relative'>
                                    <Select
                                       value={tipoDoc}
                                       onChange={(e) =>
                                          setTipoDoc(e.target.value)
                                       }
                                       className={`text-sm transition-all ${
                                          tipoDoc
                                             ? "ring-2 ring-blue-500 border-blue-500"
                                             : ""
                                       }`}
                                    >
                                       <option value=''>Todos</option>
                                       <option value='om'>Missão</option>
                                       <option value='os'>Serviço</option>
                                    </Select>
                                    {tipoDoc && (
                                       <div className='absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse'></div>
                                    )}
                                 </div>
                              </div>

                              {/* Nº da Ordem */}
                              <div className='flex flex-col group'>
                                 <Label className='mb-2 text-xs font-semibold text-gray-700 flex items-center gap-1.5'>
                                    <HiHashtag className='text-purple-500 text-sm' />
                                    Nº da Ordem
                                 </Label>
                                 <div className='relative'>
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
                                                (e.key >= "0" &&
                                                   e.key <= "9") ||
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
                                       className={`text-sm transition-all ${
                                          nDoc
                                             ? "ring-2 ring-purple-500 border-purple-500"
                                             : ""
                                       }`}
                                    />
                                    {nDoc && (
                                       <div className='absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-pulse'></div>
                                    )}
                                 </div>
                              </div>

                              {/* Tipo de Missão */}
                              <div className='flex flex-col group'>
                                 <Label className='mb-2 text-xs font-semibold text-gray-700 flex items-center gap-1.5'>
                                    <HiTag className='text-green-500 text-sm' />
                                    Tipo de Missão
                                 </Label>
                                 <div className='relative'>
                                    <Select
                                       value={selectedTipo}
                                       onChange={(e) =>
                                          setSelectedTipo(e.target.value)
                                       }
                                       className={`text-sm transition-all ${
                                          selectedTipo
                                             ? "ring-2 ring-green-500 border-green-500"
                                             : ""
                                       }`}
                                    >
                                       <option value=''>Todos</option>
                                       <option value='tal'>TAL</option>
                                       <option value='adm'>ADM</option>
                                       <option value='opr'>OPR</option>
                                    </Select>
                                    {selectedTipo && (
                                       <div className='absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse'></div>
                                    )}
                                 </div>
                              </div>

                              {/* Militar */}
                              <div className='flex flex-col group'>
                                 <Label className='mb-2 text-xs font-semibold text-gray-700 flex items-center gap-1.5'>
                                    <HiUser className='text-indigo-500 text-sm' />
                                    Militar
                                 </Label>
                                 <div className='relative'>
                                    <TextInput
                                       type='text'
                                       value={userSearch}
                                       onChange={(e) =>
                                          setUserSearch(e.target.value)
                                       }
                                       placeholder='Nome de guerra'
                                       className={`text-sm transition-all ${
                                          userSearch
                                             ? "ring-2 ring-indigo-500 border-indigo-500"
                                             : ""
                                       }`}
                                    />
                                    {userSearch && (
                                       <div className='absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full animate-pulse'></div>
                                    )}
                                 </div>
                              </div>

                              {/* Cidade */}
                              <div className='flex flex-col group'>
                                 <Label className='mb-2 text-xs font-semibold text-gray-700 flex items-center gap-1.5'>
                                    <HiLocationMarker className='text-rose-500 text-sm' />
                                    Cidade
                                 </Label>
                                 <div className='relative'>
                                    <TextInput
                                       type='text'
                                       value={citySearch}
                                       onChange={(e) =>
                                          setCitySearch(e.target.value)
                                       }
                                       placeholder='Município'
                                       className={`text-sm transition-all ${
                                          citySearch
                                             ? "ring-2 ring-rose-500 border-rose-500"
                                             : ""
                                       }`}
                                    />
                                    {citySearch && (
                                       <div className='absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full animate-pulse'></div>
                                    )}
                                 </div>
                              </div>

                              {/* Data Afastamento */}
                              <div className='flex flex-col group'>
                                 <Label className='mb-2 text-xs font-semibold text-gray-700 flex items-center gap-1.5'>
                                    <HiCalendar className='text-amber-500 text-sm' />
                                    Afastamento
                                 </Label>
                                 <div className='relative'>
                                    <input
                                       type='date'
                                       value={dataInicio}
                                       onChange={(e) =>
                                          setDataInicio(e.target.value)
                                       }
                                       className='block w-full p-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all hover:border-amber-400'
                                    />
                                 </div>
                              </div>

                              {/* Data Regresso */}
                              <div className='flex flex-col group'>
                                 <Label className='mb-2 text-xs font-semibold text-gray-700 flex items-center gap-1.5'>
                                    <HiCalendar className='text-teal-500 text-sm' />
                                    Regresso
                                 </Label>
                                 <div className='relative'>
                                    <input
                                       type='date'
                                       value={dataFim}
                                       onChange={(e) =>
                                          setDataFim(e.target.value)
                                       }
                                       className='block w-full p-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all hover:border-teal-400'
                                    />
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </section>
            )}

            {/* Results Section */}
            <section className='flex-1'>
               {loading ? (
                  <div className='flex flex-col font-semibold items-center justify-center gap-3 p-8 min-h-[300px]'>
                     <Spinner size='xl' color='info' />
                     <p className='text-gray-600'>Carregando missões...</p>
                  </div>
               ) : (
                  <div className='p-3'>
                     {/* Results Header */}
                     <div className='flex items-center justify-between mb-4 px-1'>
                        <div className='flex items-center gap-2'>
                           <h6 className='font-semibold text-gray-700'>
                              Resultados
                           </h6>
                           <Badge color='info' size='sm'>
                              {missoes?.length || 0}{" "}
                              {missoes?.length === 1 ? "missão" : "missões"}
                           </Badge>
                        </div>
                     </div>

                     {/* Results Grid */}
                     {missoes?.length === 0 ? (
                        <div className='flex flex-col items-center justify-center p-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300'>
                           <div className='w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4'>
                              <HiFilter className='text-3xl text-gray-400' />
                           </div>
                           <h3 className='text-lg font-semibold text-gray-700 mb-2'>
                              Nenhuma missão encontrada
                           </h3>
                           <p className='text-gray-500 text-sm text-center mb-4'>
                              Tente ajustar os filtros ou criar uma nova missão
                           </p>
                           {hasActiveFilters && (
                              <button
                                 onClick={clearFilters}
                                 className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors'
                              >
                                 <HiX />
                                 Limpar Filtros
                              </button>
                           )}
                        </div>
                     ) : (
                        <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4'>
                           {memoizedMissoes}
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
               setShow={setShowForm}
               update={fetchData}
               setClone={setCloneMis}
            />
         )}
      </>
   );
}
