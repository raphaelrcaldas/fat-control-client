import { useEffect, useState, useMemo, useCallback } from "react";
import { Label, TextInput, Spinner, Select, Checkbox } from "flowbite-react";
import { getPgts } from "services/routes/cegep/financeiro";
import { UserRow } from "./components/userRow";
import { useFilterContext } from "../../context/filterContext";
import { HiDocumentText, HiUser, HiCalendar, HiCheckCircle, HiCurrencyDollar } from "react-icons/hi";
import { MdCategory, MdNumbers } from "react-icons/md";

export function FilterPage({ active }) {
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

   const fetchData = useCallback(async () => {
      setLoading(true);

      let req: { [key: string]: any } = {};

      if (userSearch) req.user = userSearch.toLowerCase();
      if (tipoDoc) req.tipo_doc = tipoDoc;
      if (nDoc) req.n_doc = nDoc;
      if (selectedTipo) req.tipo = selectedTipo;
      if (selectedSit) req.sit = selectedSit;
      if (dataInicio) req.ini = dataInicio;
      if (dataFim) req.fim = dataFim;

      const data = await getPgts(req);

      setMisRecords(data);
      setListKey(Date.now());
      setSelectedIds([]);
      setValorSoma(0);
      setSelectedAll(false);
      setLoading(false);
   }, [
      userSearch,
      tipoDoc,
      nDoc,
      selectedTipo,
      selectedSit,
      dataInicio,
      dataFim,
   ]);

   useEffect(() => {
      if (!active) return;
      if (misRecords == null) {
         fetchData();
      }
   }, [active]);

   // Debounce para os filtros
   useEffect(() => {
      if (!active || misRecords == null) return;

      const timer = setTimeout(() => {
         fetchData();
      }, 500);

      return () => clearTimeout(timer);
   }, [fetchData, active]);

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

   return (
      <div className='space-y-6'>
         {/* Filters Section */}
         <section className='relative'>
            <div className='absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-2xl blur-xl'></div>
            <div className='relative bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-6'>
               <div className='flex items-center gap-2 mb-6'>
                  <HiDocumentText className='text-blue-600 text-2xl' />
                  <h2 className='text-xl font-bold text-gray-800'>Filtros de Pesquisa</h2>
               </div>

               <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                  {/* Tipo da Ordem */}
                  <div className='group'>
                     <div className='flex items-center gap-2 mb-2'>
                        <HiDocumentText className='text-blue-500 group-hover:text-blue-600 transition-colors' />
                        <Label className='font-semibold text-gray-700'>Tipo da Ordem</Label>
                     </div>
                     <Select
                        value={tipoDoc}
                        onChange={(e) => setTipoDoc(e.target.value)}
                        className='transition-all hover:shadow-md'
                     >
                        <option value=''>Selecione</option>
                        <option value='om'>Missão</option>
                        <option value='os'>Serviço</option>
                     </Select>
                  </div>

                  {/* Nº da Ordem */}
                  <div className='group'>
                     <div className='flex items-center gap-2 mb-2'>
                        <MdNumbers className='text-blue-500 group-hover:text-blue-600 transition-colors' />
                        <Label className='font-semibold text-gray-700'>Nº da Ordem</Label>
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
                        className='transition-all hover:shadow-md'
                     />
                  </div>

                  {/* Militar */}
                  <div className='group md:col-span-2'>
                     <div className='flex items-center gap-2 mb-2'>
                        <HiUser className='text-blue-500 group-hover:text-blue-600 transition-colors' />
                        <Label className='font-semibold text-gray-700'>Militar</Label>
                     </div>
                     <TextInput
                        type='text'
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder='Nome completo ou de guerra'
                        className='transition-all hover:shadow-md'
                     />
                  </div>

                  {/* Tipo de Missão */}
                  <div className='group'>
                     <div className='flex items-center gap-2 mb-2'>
                        <MdCategory className='text-blue-500 group-hover:text-blue-600 transition-colors' />
                        <Label className='font-semibold text-gray-700'>Tipo de Missão</Label>
                     </div>
                     <Select
                        value={selectedTipo}
                        onChange={(e) => setSelectedTipo(e.target.value)}
                        className='transition-all hover:shadow-md'
                     >
                        <option value=''>Selecione</option>
                        <option value='tal'>TAL</option>
                        <option value='adm'>ADM</option>
                        <option value='opr'>OPR</option>
                     </Select>
                  </div>

                  {/* Situação */}
                  <div className='group'>
                     <div className='flex items-center gap-2 mb-2'>
                        <HiCheckCircle className='text-blue-500 group-hover:text-blue-600 transition-colors' />
                        <Label className='font-semibold text-gray-700'>Situação</Label>
                     </div>
                     <Select
                        value={selectedSit}
                        onChange={(e) => setSelectedSit(e.target.value)}
                        className='transition-all hover:shadow-md'
                     >
                        <option value=''>Selecione</option>
                        <option value='d'>Diária</option>
                        <option value='c'>Comissionado</option>
                        <option value='g'>Grat Rep</option>
                     </Select>
                  </div>

                  {/* Data Início */}
                  <div className='group'>
                     <div className='flex items-center gap-2 mb-2'>
                        <HiCalendar className='text-blue-500 group-hover:text-blue-600 transition-colors' />
                        <Label className='font-semibold text-gray-700'>Data Início</Label>
                     </div>
                     <input
                        type='date'
                        value={dataInicio}
                        onChange={(e) => setDataInicio(e.target.value)}
                        className='block w-full p-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:shadow-md'
                     />
                  </div>

                  {/* Data Fim */}
                  <div className='group'>
                     <div className='flex items-center gap-2 mb-2'>
                        <HiCalendar className='text-blue-500 group-hover:text-blue-600 transition-colors' />
                        <Label className='font-semibold text-gray-700'>Data Fim</Label>
                     </div>
                     <input
                        type='date'
                        value={dataFim}
                        onChange={(e) => setDataFim(e.target.value)}
                        className='block w-full p-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:shadow-md'
                     />
                  </div>
               </div>
            </div>
         </section>

         {/* Summary Section */}
         <section className='relative'>
            <div className='absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl blur-xl'></div>
            <div className='relative bg-gradient-to-br from-white to-green-50/30 rounded-2xl shadow-lg border border-green-200 overflow-hidden'>
               <div className='bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4'>
                  <div className='flex items-center gap-2'>
                     <HiCurrencyDollar className='text-white text-2xl' />
                     <h2 className='text-xl font-bold text-white'>Resumo de Pagamentos</h2>
                  </div>
               </div>

               <div className='p-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                     {/* Marcar Todos */}
                     <div className='flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all'>
                        <div className='flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center'>
                           <HiCheckCircle className='text-white text-2xl' />
                        </div>
                        <div className='flex-1'>
                           <Label className='text-base font-semibold text-gray-700'>Selecionar Todos</Label>
                           <p className='text-xs text-gray-500'>Marcar todos os registros</p>
                        </div>
                        <Checkbox
                           className='w-6 h-6'
                           checked={selectedAll}
                           color="blue"
                           onChange={(e) => setSelectedAll(!selectedAll)}
                        />
                     </div>

                     {/* Total */}
                     <div className='relative overflow-hidden p-6 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl shadow-lg'>
                        <div className='absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16'></div>
                        <div className='absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12'></div>
                        <div className='relative'>
                           <div className='flex items-center gap-2 mb-2'>
                              <HiCurrencyDollar className='text-white/90 text-xl' />
                              <Label className='text-white/90 text-sm font-medium'>Valor Total</Label>
                           </div>
                           <div className='text-3xl font-bold text-white'>
                              {valorSoma.toLocaleString("pt-BR", {
                                 style: "currency",
                                 currency: "BRL",
                              })}
                           </div>
                           <div className='mt-2 text-white/80 text-xs'>
                              {selectedIds.length} {selectedIds.length === 1 ? 'registro selecionado' : 'registros selecionados'}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* Results Section */}
         <section className='relative'>
            <div className='bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden'>
               {loading ? (
                  <div className='flex flex-col items-center justify-center gap-4 p-16'>
                     <Spinner size='xl' color='info' />
                     <p className='text-gray-600 font-medium text-lg'>Carregando registros...</p>
                  </div>
               ) : misRecords && misRecords.length > 0 ? (
                  <div>
                     <div className='bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200'>
                        <h3 className='text-lg font-bold text-gray-800'>
                           Registros Encontrados ({misRecords.length})
                        </h3>
                     </div>
                     <ul className='divide-y divide-gray-200 px-1' key={listKey}>
                        {memoUsersRowPgto}
                     </ul>
                  </div>
               ) : (
                  <div className='flex flex-col items-center justify-center gap-4 p-16'>
                     <div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center'>
                        <HiDocumentText className='text-gray-400 text-4xl' />
                     </div>
                     <p className='text-gray-500 font-medium text-lg'>Nenhum registro encontrado</p>
                     <p className='text-gray-400 text-sm'>Ajuste os filtros para encontrar resultados</p>
                  </div>
               )}
            </div>
         </section>
      </div>
   );
}
