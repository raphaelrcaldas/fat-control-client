import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Label, TextInput, Spinner, Select, Checkbox } from "flowbite-react";
import { getPgts } from "services/routes/cegep/financeiro";
import { UserRow } from "./components/userRow";
import { useFilterContext } from "../../context/filterContext";

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
      <div className='grid gap-2'>
         <section className='flex flex-col'>
            <div className='w-full'>
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

                     <div className=''>
                        <div className='mb-2 text-center'>
                           <Label>Militar</Label>
                        </div>
                        <TextInput
                           type='text'
                           value={userSearch}
                           onChange={(e) => setUserSearch(e.target.value)}
                           placeholder='Nome completo ou de guerra'
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
                     <div>
                        <div className='mb-2 text-center'>
                           <Label>Situação</Label>
                        </div>
                        <Select
                           value={selectedSit}
                           onChange={(e) => setSelectedSit(e.target.value)}
                        >
                           <option value=''>Selecione</option>
                           <option value='d'>Diária</option>
                           <option value='c'>Comissionado</option>
                           <option value='g'>Grat Rep</option>
                        </Select>
                     </div>

                     <div className='w-40'>
                        <div className='mb-2 text-center'>
                           <Label>Inicio</Label>
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
                           <Label>Fim</Label>
                        </div>
                        <input
                           type='date'
                           value={dataFim}
                           onChange={(e) => setDataFim(e.target.value)}
                           className='block w-full text-center p-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500'
                        />
                     </div>
                  </div>
               </div>
            </div>
         </section>

         <section className='flex flex-col'>
            <div className='w-full'>
               <div className='relative overflow-hidden bg-white shadow-md sm:rounded-lg'>
                  <div className='grid grid-cols-3 items-center justify-evenly p-4 space-y-3 sm:flex sm:space-y-0 sm:space-x-4'>
                     <div className='p-2 rounded-lg flex gap-2 items-center justify-center'>
                        <Label className='text-base'>Marcar todos</Label>
                        <Checkbox
                           className='size-6'
                           checked={selectedAll}
                           onChange={(e) => setSelectedAll(!selectedAll)}
                        />
                     </div>
                     <div className='flex flex-row col-span-2'>
                        <Label className='text-lg'>Total</Label>
                        <span className='ml-2 font-semibold w-32 text-lg'>
                           {valorSoma.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                           })}{" "}
                        </span>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         <div className='mt-2'>
            {loading ? (
               <div className='flex flex-col font-semibold items-center justify-center gap-2 p-2'>
                  Carregando <Spinner size='lg' color='failure' />
               </div>
            ) : misRecords ? (
               <ul className='list-disc' key={listKey}>
                  {memoUsersRowPgto}
               </ul>
            ) : (
               <p className='text-center'>Nenhum registro encontrado.</p>
            )}
         </div>
      </div>
   );
}
