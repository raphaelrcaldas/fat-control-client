"use client";

import { getFragMissoes } from "services/routes/cegep/missoes";
import { useEffect, useState, useCallback } from "react";
import { Label, Select, TextInput, Badge } from "flowbite-react";
import { Missao } from "services/routes/cegep/missoes";
import { CardMission } from "./components/cardMission";
import MissionDetail from "./components/missionDetail";
import { useRegisterContext } from "../../context/registerContext";
import { useEtiquetas } from "../../context/etiquetasContext";
import { Spinner } from "@/components/Spinner";
import {
   HiX,
   HiFilter,
   HiDocumentText,
   HiHashtag,
   HiClipboardList,
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
   const [showFilters, setShowFilters] = useState(false);
   const [selectedEtiquetaIds, setSelectedEtiquetaIds] = useState<number[]>([]);

   const { etiquetas: etiquetasDisponiveis } = useEtiquetas();

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
      citySearch ||
      dataInicio ||
      dataFim ||
      selectedEtiquetaIds.length > 0
   );

   const clearFilters = () => {
      setTipoDoc("");
      setNDoc(undefined);
      setSelectedTipo("");
      setUserSearch("");
      setCitySearch("");
      setSelectedEtiquetaIds([]);
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
      if (selectedEtiquetaIds.length > 0) req.etiqueta_ids = selectedEtiquetaIds.join(',');

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
      selectedEtiquetaIds,
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
            <section className='flex-shrink-0 mb-2'>
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
                           <Badge color='red' size='sm'>
                              {
                                 Object.values({
                                    tipoDoc,
                                    nDoc,
                                    selectedTipo,
                                    userSearch,
                                    citySearch,
                                    dataInicio,
                                    dataFim,
                                 }).filter((v) => v).length
                              }
                           </Badge>
                        )}
                     </button>
                     <button
                        type='button'
                        onClick={() => handleSetShowForm(true)}
                        className='flex items-center gap-1.5 px-3 py-2 font-semibold text-sm text-white rounded-lg bg-red-600 hover:bg-red-700'
                     >
                        <span>+</span>
                        Nova Missão
                     </button>
                  </div>
               </div>
            </section>

            {/* Active Filters Tags */}
            {hasActiveFilters && (
               <section className='flex-shrink-0 mb-3'>
                  <div className='flex flex-wrap items-center gap-2'>
                     <span className='text-xs font-medium text-gray-600'>
                        Filtros ativos:
                     </span>

                     {tipoDoc && (
                        <Badge color='red' className=''>
                           <div className='flex items-center gap-1.5'>
                              <HiDocumentText className='w-3 h-3' />
                              <span>
                                 Ordem:{" "}
                                 {tipoDoc === "om" ? "Missão" : "Serviço"}
                              </span>
                              <button
                                 onClick={() => setTipoDoc("")}
                                 className='ml-1 hover:text-red-600'
                              >
                                 <HiX className='w-3 h-3' />
                              </button>
                           </div>
                        </Badge>
                     )}

                     {nDoc && (
                        <Badge color='red'>
                           <div className='flex items-center gap-1.5'>
                              <HiHashtag className='w-3 h-3' />
                              <span>Nº {nDoc}</span>
                              <button
                                 onClick={() => setNDoc(undefined)}
                                 className='ml-1 hover:text-red-600'
                              >
                                 <HiX className='w-3 h-3' />
                              </button>
                           </div>
                        </Badge>
                     )}

                     {selectedTipo && (
                        <Badge color='red'>
                           <div className='flex items-center gap-1.5'>
                              <HiClipboardList className='w-3 h-3' />
                              <span>Tipo: {selectedTipo.toUpperCase()}</span>
                              <button
                                 onClick={() => setSelectedTipo("")}
                                 className='ml-1 hover:text-red-600'
                              >
                                 <HiX className='w-3 h-3' />
                              </button>
                           </div>
                        </Badge>
                     )}

                     {userSearch && (
                        <Badge color='red'>
                           <div className='flex items-center gap-1.5'>
                              <HiUser className='w-3 h-3' />
                              <span>Militar: {userSearch}</span>
                              <button
                                 onClick={() => setUserSearch("")}
                                 className='ml-1 hover:text-red-600'
                              >
                                 <HiX className='w-3 h-3' />
                              </button>
                           </div>
                        </Badge>
                     )}

                     {citySearch && (
                        <Badge color='red'>
                           <div className='flex items-center gap-1.5'>
                              <HiLocationMarker className='w-3 h-3' />
                              <span>Cidade: {citySearch}</span>
                              <button
                                 onClick={() => setCitySearch("")}
                                 className='ml-1 hover:text-red-600'
                              >
                                 <HiX className='w-3 h-3' />
                              </button>
                           </div>
                        </Badge>
                     )}

                     {dataInicio && (
                        <Badge color='red'>
                           <div className='flex items-center gap-1.5'>
                              <HiCalendar className='w-3 h-3' />
                              <span>
                                 Afastamento:{" "}
                                 {new Date(
                                    dataInicio + "T00:00:00"
                                 ).toLocaleDateString("pt-BR")}
                              </span>
                              <button
                                 onClick={() => {
                                    const hoje = new Date();
                                    const quinzeDiasAntes = new Date(
                                       hoje.getFullYear(),
                                       0,
                                       1
                                    );
                                    setDataInicio(
                                       quinzeDiasAntes
                                          .toISOString()
                                          .split("T")[0]
                                    );
                                 }}
                                 className='ml-1 hover:text-red-600'
                              >
                                 <HiX className='w-3 h-3' />
                              </button>
                           </div>
                        </Badge>
                     )}

                     {dataFim && (
                        <Badge color='red'>
                           <div className='flex items-center gap-1.5'>
                              <HiCalendar className='w-3 h-3' />
                              <span>
                                 Regresso:{" "}
                                 {new Date(
                                    dataFim + "T00:00:00"
                                 ).toLocaleDateString("pt-BR")}
                              </span>
                              <button
                                 onClick={() => {
                                    const hoje = new Date();
                                    setDataFim(
                                       hoje.toISOString().split("T")[0]
                                    );
                                 }}
                                 className='ml-1 hover:text-red-600'
                              >
                                 <HiX className='w-3 h-3' />
                              </button>
                           </div>
                        </Badge>
                     )}

                     {/* Etiquetas selecionadas */}
                     {selectedEtiquetaIds.map(id => {
                        const etiqueta = etiquetasDisponiveis.find(e => e.id === id);
                        if (!etiqueta) return null;
                        return (
                           <span
                              key={id}
                              className='inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full text-white'
                              style={{ backgroundColor: etiqueta.cor }}
                           >
                              <HiTag className='w-3 h-3' />
                              {etiqueta.nome}
                              <button
                                 onClick={() => setSelectedEtiquetaIds(prev => prev.filter(eid => eid !== id))}
                                 className='ml-0.5 hover:bg-white/20 rounded-full p-0.5'
                              >
                                 <HiX className='w-3 h-3' />
                              </button>
                           </span>
                        );
                     })}

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
                           <Label className='mb-1.5 text-xs text-gray-600 flex items-center gap-1.5'>
                              <HiDocumentText className='text-gray-500' />
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
                           <Label className='mb-1.5 text-xs text-gray-600 flex items-center gap-1.5'>
                              <HiHashtag className='text-gray-500' />
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
                           <Label className='mb-1.5 text-xs text-gray-600 flex items-center gap-1.5'>
                              <HiClipboardList className='text-gray-500' />
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
                           <Label className='mb-1.5 text-xs text-gray-600 flex items-center gap-1.5'>
                              <HiUser className='text-gray-500' />
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
                           <Label className='mb-1.5 text-xs text-gray-600 flex items-center gap-1.5'>
                              <HiLocationMarker className='text-gray-500' />
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
                           <Label className='mb-1.5 text-xs text-gray-600 flex items-center gap-1.5'>
                              <HiCalendar className='text-gray-500' />
                              Afastamento
                           </Label>
                           <input
                              type='date'
                              value={dataInicio}
                              onChange={(e) => setDataInicio(e.target.value)}
                              className='block w-full p-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500'
                           />
                        </div>

                        {/* Data Regresso */}
                        <div>
                           <Label className='mb-1.5 text-xs text-gray-600 flex items-center gap-1.5'>
                              <HiCalendar className='text-gray-500' />
                              Regresso
                           </Label>
                           <input
                              type='date'
                              value={dataFim}
                              onChange={(e) => setDataFim(e.target.value)}
                              className='block w-full p-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500'
                           />
                        </div>
                     </div>

                     {/* Multi-select Etiquetas */}
                     {etiquetasDisponiveis.length > 0 && (
                        <div className='mt-4 pt-4 border-t border-gray-200'>
                           <Label className='mb-2 text-xs text-gray-600 flex items-center gap-1.5'>
                              <HiTag className='text-gray-500' />
                              Filtrar por Etiquetas
                           </Label>
                           <div className='flex flex-wrap gap-2'>
                              {etiquetasDisponiveis.map(etiqueta => {
                                 const isSelected = selectedEtiquetaIds.includes(etiqueta.id!);
                                 return (
                                    <button
                                       key={etiqueta.id}
                                       onClick={() => {
                                          if (isSelected) {
                                             setSelectedEtiquetaIds(prev => prev.filter(id => id !== etiqueta.id));
                                          } else {
                                             setSelectedEtiquetaIds(prev => [...prev, etiqueta.id!]);
                                          }
                                       }}
                                       className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full transition-all ${isSelected
                                          ? 'text-white shadow-sm'
                                          : 'border border-dashed'
                                          }`}
                                       style={isSelected ? {
                                          backgroundColor: etiqueta.cor
                                       } : {
                                          borderColor: etiqueta.cor,
                                          color: etiqueta.cor,
                                          backgroundColor: `${etiqueta.cor}10`
                                       }}
                                    >
                                       <HiTag className='w-3 h-3' />
                                       {etiqueta.nome}
                                       {isSelected && <HiX className='w-3 h-3' />}
                                    </button>
                                 );
                              })}
                           </div>
                        </div>
                     )}
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
                     {/* Results Grid */}
                     {missoes?.length === 0 ? (
                        <div className='flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200'>
                           <p className='text-sm text-gray-600 mb-3'>
                              Nenhuma missão encontrada
                           </p>
                           {hasActiveFilters && (
                              <button
                                 onClick={clearFilters}
                                 className='text-sm text-red-600 hover:text-red-700'
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
