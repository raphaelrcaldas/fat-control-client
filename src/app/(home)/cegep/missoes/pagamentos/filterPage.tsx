import { useEffect, useState, useMemo, useCallback } from "react";
import {
   Label,
   TextInput,
   Select,
   Checkbox,
   Badge,
} from "flowbite-react";
import { Spinner } from "@/components/Spinner";
import { getPgts } from "services/routes/cegep/financeiro";
import { UserRow } from "./components/userRow";
import { useFilterContext } from "../../context/filterContext";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import {
   HiDocumentText,
   HiCurrencyDollar,
   HiFilter,
   HiX,
} from "react-icons/hi";

export function FilterPage({ active }) {
   const [showFilters, setShowFilters] = useState(false);
   const [loading, setLoading] = useState(true);
   const {
      misRecords,
      setMisRecords,
      nDoc,
      setNDoc,
      tipoDoc,
      setTipoDoc,
      selectedTipo,
      userSearch,
      setUserSearch,
      setSelectedTipo,
      selectedSit,
      setSelectedSit,
      dataInicio,
      setDataInicio,
      dataFim,
      setDataFim,
      selectedAll,
      setSelectedAll,
      valorSoma,
      setValorSoma,
      listKey,
      setListKey,
      selectedIds,
      setSelectedIds,
   } = useFilterContext();

   const memoUsersRowPgto = useMemo(() => {
      return misRecords?.map((record) => (
         <UserRow
            key={record.user_mis.id}
            record={record}
            checked={selectedIds.includes(record.user_mis.id)}
            onSelect={handleSelect}
         />
      ));
   }, [misRecords, selectedIds]);

   // Agrupa os filtros em um objeto para debounce
   const filters = useMemo(() => ({
      userSearch,
      tipoDoc,
      nDoc,
      selectedTipo,
      selectedSit,
      dataInicio,
      dataFim,
   }), [userSearch, tipoDoc, nDoc, selectedTipo, selectedSit, dataInicio, dataFim]);

   const debouncedFilters = useDebouncedValue(filters, 500);

   const fetchData = useCallback(async () => {
      setLoading(true);

      let req: { [key: string]: any } = {};

      if (debouncedFilters.userSearch) req.user = debouncedFilters.userSearch.toLowerCase();
      if (debouncedFilters.tipoDoc) req.tipo_doc = debouncedFilters.tipoDoc;
      if (debouncedFilters.nDoc) req.n_doc = debouncedFilters.nDoc;
      if (debouncedFilters.selectedTipo) req.tipo = debouncedFilters.selectedTipo;
      if (debouncedFilters.selectedSit) req.sit = debouncedFilters.selectedSit;
      if (debouncedFilters.dataInicio) req.ini = debouncedFilters.dataInicio;
      if (debouncedFilters.dataFim) req.fim = debouncedFilters.dataFim;

      const data = await getPgts(req);

      setMisRecords(data);
      setListKey(Date.now());
      setSelectedIds([]);
      setValorSoma(0);
      setSelectedAll(false);
      setLoading(false);
   }, [debouncedFilters]);

   useEffect(() => {
      if (!active) return;
      if (misRecords == null) {
         fetchData();
      }
   }, [active]);

   // Chama fetchData quando os filtros debounced mudarem
   useEffect(() => {
      if (!active || misRecords == null) return;
      fetchData();
   }, [debouncedFilters, active]);

   useEffect(() => {
      if (misRecords && selectedAll) {
         setSelectedIds(misRecords.map((r) => r.user_mis.id));
         setValorSoma(
            misRecords.reduce((acc, r) => acc + Number(r.missao.valor_total), 0)
         );
      } else if (misRecords && !selectedAll) {
         setSelectedIds([]);
         setValorSoma(0);
      }
   }, [selectedAll, misRecords]);

   function handleSelect(id, valor, checked) {
      if (checked) {
         setSelectedIds((prev) => [...prev, id]);
         setValorSoma((prev) => prev + Number(valor));
      } else {
         setSelectedIds((prev) => prev.filter((item) => item !== id));
         setValorSoma((prev) => prev - Number(valor));
      }
   }

   const hasActiveFilters = !!(
      tipoDoc ||
      nDoc ||
      selectedTipo ||
      selectedSit ||
      userSearch
   );

   const clearFilters = () => {
      setTipoDoc("");
      setNDoc(undefined);
      setSelectedTipo("");
      setSelectedSit("");
      setUserSearch("");
      setDataInicio("");
      setDataFim("");
   };

   return (
      <div className='space-y-6'>
         {/* Header Section */}
         <section>
            <div className='flex items-center justify-between flex-wrap gap-3'>
               <h5 className='font-semibold text-xl text-gray-800'>
                  Pagamentos
               </h5>

               <div className='flex items-center gap-3 flex-wrap'>
                  {/* Checkbox Selecionar Todos */}
                  <div className='flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5'>
                     <Checkbox
                        className='w-4 h-4'
                        checked={selectedAll}
                        color='red'
                        onChange={() => setSelectedAll(!selectedAll)}
                     />
                     <Label className='text-xs font-medium text-gray-700 cursor-pointer'>
                        Selecionar Todos
                     </Label>
                  </div>

                  {/* Valor Total */}
                  <div className='flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200'>
                     <div className='flex items-center gap-1.5'>
                        <HiCurrencyDollar
                           className='text-green-600'
                           size={16}
                        />
                        <span className='text-xs text-gray-600'>Total:</span>
                     </div>
                     <div className='flex flex-col items-end'>
                        <span className='text-sm font-bold text-green-700'>
                           {valorSoma.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                           })}
                        </span>
                        <span className='text-[10px] text-gray-500'>
                           {selectedIds.length}{" "}
                           {selectedIds.length === 1
                              ? "selecionado"
                              : "selecionados"}
                        </span>
                     </div>
                  </div>

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
                                 selectedSit,
                                 userSearch,
                              }).filter((v) => v).length
                           }
                        </Badge>
                     )}
                  </button>
               </div>
            </div>
         </section>

         {/* Filters Section */}
         {showFilters && (
            <section>
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

                  <div className='flex flex-wrap gap-3 justify-around'>
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
                     <div className='w-24'>
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

                     {/* Situação */}
                     <div>
                        <Label className='mb-1.5 text-xs text-gray-600'>
                           Situação
                        </Label>
                        <Select
                           value={selectedSit}
                           onChange={(e) => setSelectedSit(e.target.value)}
                           className='text-sm'
                           sizing='sm'
                        >
                           <option value=''>Todos</option>
                           <option value='d'>Diária</option>
                           <option value='c'>Comissionado</option>
                           <option value='g'>Grat Rep</option>
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

                     {/* Data Início */}
                     <div>
                        <Label className='mb-1.5 text-xs text-gray-600'>
                           Afastamento
                        </Label>
                        <input
                           type='date'
                           value={dataInicio}
                           onChange={(e) => setDataInicio(e.target.value)}
                           className='block w-full p-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500'
                        />
                     </div>

                     {/* Data Fim */}
                     <div>
                        <Label className='mb-1.5 text-xs text-gray-600'>
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
               </div>
            </section>
         )}

         {/* Results Section */}
         <section className='relative'>
            <div className='bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden'>
               {loading ? (
                  <div className='flex flex-col items-center justify-center gap-4 p-16'>
                     <Spinner size='xl' />
                     <p className='text-gray-600 font-medium text-lg'>
                        Carregando registros...
                     </p>
                  </div>
               ) : misRecords && misRecords.length > 0 ? (
                  <div>
                     <div className='bg-gray-50 px-6 py-4 border-b border-gray-200'>
                        <h3 className='text-lg font-bold text-gray-800'>
                           Registros Encontrados ({misRecords.length})
                        </h3>
                     </div>
                     <div className='overflow-x-auto'>
                        <ul
                           className='divide-y divide-gray-200 p-2'
                           key={listKey}
                        >
                           {memoUsersRowPgto}
                        </ul>
                     </div>
                  </div>
               ) : (
                  <div className='flex flex-col items-center justify-center gap-4 p-16'>
                     <div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center'>
                        <HiDocumentText className='text-gray-400 text-4xl' />
                     </div>
                     <p className='text-gray-500 font-medium text-lg'>
                        Nenhum registro encontrado
                     </p>
                     <p className='text-gray-400 text-sm'>
                        Ajuste os filtros para encontrar resultados
                     </p>
                  </div>
               )}
            </div>
         </section>
      </div>
   );
}
