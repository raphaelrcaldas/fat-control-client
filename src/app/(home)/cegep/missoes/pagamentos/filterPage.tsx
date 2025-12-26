import { useEffect, useState, useMemo, useCallback } from "react";
import { Label, TextInput, Select, Checkbox, Badge } from "flowbite-react";
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
   HiHashtag,
   HiClipboardList,
   HiUser,
   HiCalendar,
   HiTag,
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
   const filters = useMemo(
      () => ({
         userSearch,
         tipoDoc,
         nDoc,
         selectedTipo,
         selectedSit,
         dataInicio,
         dataFim,
      }),
      [
         userSearch,
         tipoDoc,
         nDoc,
         selectedTipo,
         selectedSit,
         dataInicio,
         dataFim,
      ]
   );

   const debouncedFilters = useDebouncedValue(filters, 500);

   const fetchData = useCallback(async () => {
      setLoading(true);

      let req: { [key: string]: any } = {};

      if (debouncedFilters.userSearch)
         req.user = debouncedFilters.userSearch.toLowerCase();
      if (debouncedFilters.tipoDoc) req.tipo_doc = debouncedFilters.tipoDoc;
      if (debouncedFilters.nDoc) req.n_doc = debouncedFilters.nDoc;
      if (debouncedFilters.selectedTipo)
         req.tipo = debouncedFilters.selectedTipo;
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
      userSearch ||
      dataInicio ||
      dataFim
   );

   const clearFilters = () => {
      setTipoDoc("");
      setNDoc(undefined);
      setSelectedTipo("");
      setSelectedSit("");
      setUserSearch("");
      const hoje = new Date();
      const quinzeDiasAntes = new Date(hoje.getFullYear(), 0, 1);
      setDataInicio(quinzeDiasAntes.toISOString().split("T")[0]);
      setDataFim(hoje.toISOString().split("T")[0]);
   };

   return (
      <div className="space-y-6">
         {/* Header Section */}
         <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
               <h5 className="text-xl font-semibold text-gray-800">
                  Pagamentos
               </h5>

               <div className="flex flex-wrap items-center gap-3">
                  {/* Checkbox Selecionar Todos */}
                  <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5">
                     <Checkbox
                        className="h-4 w-4"
                        checked={selectedAll}
                        color="red"
                        onChange={() => setSelectedAll(!selectedAll)}
                     />
                     <Label className="cursor-pointer text-xs font-medium text-gray-700">
                        Selecionar Todos
                     </Label>
                  </div>

                  {/* Valor Total */}
                  <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5">
                     <div className="flex items-center gap-1.5">
                        <HiCurrencyDollar
                           className="text-green-600"
                           size={16}
                        />
                        <span className="text-xs text-gray-600">Total:</span>
                     </div>
                     <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-green-700">
                           {valorSoma.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                           })}
                        </span>
                        <span className="text-[10px] text-gray-500">
                           {selectedIds.length}{" "}
                           {selectedIds.length === 1
                              ? "selecionado"
                              : "selecionados"}
                        </span>
                     </div>
                  </div>

                  <button
                     type="button"
                     onClick={() => setShowFilters(!showFilters)}
                     className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                     <HiFilter />
                     {showFilters ? "Ocultar" : "Filtros"}
                     {hasActiveFilters && (
                        <Badge color="gray" size="sm">
                           {
                              Object.values({
                                 tipoDoc,
                                 nDoc,
                                 selectedTipo,
                                 selectedSit,
                                 userSearch,
                                 dataInicio,
                                 dataFim,
                              }).filter((v) => v).length
                           }
                        </Badge>
                     )}
                  </button>
               </div>
            </div>
         </section>

         {/* Active Filters Tags */}
         {hasActiveFilters && (
            <section>
               <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-gray-600">
                     Filtros ativos:
                  </span>

                  {tipoDoc && (
                     <Badge color="red">
                        <div className="flex items-center gap-1.5">
                           <HiDocumentText className="h-3 w-3" />
                           <span>
                              Ordem: {tipoDoc === "om" ? "Missão" : "Serviço"}
                           </span>
                           <button
                              onClick={() => setTipoDoc("")}
                              className="ml-1 hover:text-red-600"
                           >
                              <HiX className="h-3 w-3" />
                           </button>
                        </div>
                     </Badge>
                  )}

                  {nDoc && (
                     <Badge color="red">
                        <div className="flex items-center gap-1.5">
                           <HiHashtag className="h-3 w-3" />
                           <span>Nº {nDoc}</span>
                           <button
                              onClick={() => setNDoc(undefined)}
                              className="ml-1 hover:text-red-600"
                           >
                              <HiX className="h-3 w-3" />
                           </button>
                        </div>
                     </Badge>
                  )}

                  {selectedTipo && (
                     <Badge color="red">
                        <div className="flex items-center gap-1.5">
                           <HiClipboardList className="h-3 w-3" />
                           <span>Tipo: {selectedTipo.toUpperCase()}</span>
                           <button
                              onClick={() => setSelectedTipo("")}
                              className="ml-1 hover:text-red-600"
                           >
                              <HiX className="h-3 w-3" />
                           </button>
                        </div>
                     </Badge>
                  )}

                  {selectedSit && (
                     <Badge color="red">
                        <div className="flex items-center gap-1.5">
                           <HiTag className="h-3 w-3" />
                           <span>
                              Situação:{" "}
                              {selectedSit === "d"
                                 ? "Diária"
                                 : selectedSit === "c"
                                   ? "Comissionado"
                                   : "Grat Rep"}
                           </span>
                           <button
                              onClick={() => setSelectedSit("")}
                              className="ml-1 hover:text-red-600"
                           >
                              <HiX className="h-3 w-3" />
                           </button>
                        </div>
                     </Badge>
                  )}

                  {userSearch && (
                     <Badge color="red">
                        <div className="flex items-center gap-1.5">
                           <HiUser className="h-3 w-3" />
                           <span>Militar: {userSearch}</span>
                           <button
                              onClick={() => setUserSearch("")}
                              className="ml-1 hover:text-red-600"
                           >
                              <HiX className="h-3 w-3" />
                           </button>
                        </div>
                     </Badge>
                  )}

                  {dataInicio && (
                     <Badge color="red">
                        <div className="flex items-center gap-1.5">
                           <HiCalendar className="h-3 w-3" />
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
                                    quinzeDiasAntes.toISOString().split("T")[0]
                                 );
                              }}
                              className="ml-1 hover:text-red-600"
                           >
                              <HiX className="h-3 w-3" />
                           </button>
                        </div>
                     </Badge>
                  )}

                  {dataFim && (
                     <Badge color="red">
                        <div className="flex items-center gap-1.5">
                           <HiCalendar className="h-3 w-3" />
                           <span>
                              Regresso:{" "}
                              {new Date(
                                 dataFim + "T00:00:00"
                              ).toLocaleDateString("pt-BR")}
                           </span>
                           <button
                              onClick={() => {
                                 const hoje = new Date();
                                 setDataFim(hoje.toISOString().split("T")[0]);
                              }}
                              className="ml-1 hover:text-red-600"
                           >
                              <HiX className="h-3 w-3" />
                           </button>
                        </div>
                     </Badge>
                  )}

                  <button
                     onClick={clearFilters}
                     className="text-xs text-gray-500 underline hover:text-gray-700"
                  >
                     Limpar todos
                  </button>
               </div>
            </section>
         )}

         {/* Filters Section */}
         {showFilters && (
            <section>
               <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="mb-4 flex items-center justify-between">
                     <h6 className="text-sm font-medium text-gray-700">
                        Filtros
                     </h6>
                     {hasActiveFilters && (
                        <button
                           onClick={clearFilters}
                           className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                        >
                           <HiX />
                           Limpar
                        </button>
                     )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                     {/* Tipo da Ordem */}
                     <div>
                        <Label className="mb-1.5 flex items-center gap-1.5 text-xs text-gray-600">
                           <HiDocumentText className="text-gray-500" />
                           Tipo da Ordem
                        </Label>
                        <Select
                           value={tipoDoc}
                           onChange={(e) => setTipoDoc(e.target.value)}
                           className="text-sm"
                           sizing="sm"
                        >
                           <option value="">Todos</option>
                           <option value="om">Missão</option>
                           <option value="os">Serviço</option>
                        </Select>
                     </div>

                     {/* Nº da Ordem */}
                     <div>
                        <Label className="mb-1.5 flex items-center gap-1.5 text-xs text-gray-600">
                           <HiHashtag className="text-gray-500" />
                           Nº da Ordem
                        </Label>
                        <TextInput
                           type="text"
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
                           placeholder="Número"
                           sizing="sm"
                        />
                     </div>

                     {/* Tipo de Missão */}
                     <div>
                        <Label className="mb-1.5 flex items-center gap-1.5 text-xs text-gray-600">
                           <HiClipboardList className="text-gray-500" />
                           Tipo de Missão
                        </Label>
                        <Select
                           value={selectedTipo}
                           onChange={(e) => setSelectedTipo(e.target.value)}
                           className="text-sm"
                           sizing="sm"
                        >
                           <option value="">Todos</option>
                           <option value="tal">TAL</option>
                           <option value="adm">ADM</option>
                           <option value="opr">OPR</option>
                        </Select>
                     </div>

                     {/* Situação */}
                     <div>
                        <Label className="mb-1.5 flex items-center gap-1.5 text-xs text-gray-600">
                           <HiTag className="text-gray-500" />
                           Situação
                        </Label>
                        <Select
                           value={selectedSit}
                           onChange={(e) => setSelectedSit(e.target.value)}
                           className="text-sm"
                           sizing="sm"
                        >
                           <option value="">Todos</option>
                           <option value="d">Diária</option>
                           <option value="c">Comissionado</option>
                           <option value="g">Grat Rep</option>
                        </Select>
                     </div>

                     {/* Militar */}
                     <div>
                        <Label className="mb-1.5 flex items-center gap-1.5 text-xs text-gray-600">
                           <HiUser className="text-gray-500" />
                           Militar
                        </Label>
                        <TextInput
                           type="text"
                           value={userSearch}
                           onChange={(e) => setUserSearch(e.target.value)}
                           placeholder="Nome de completo ou de guerra"
                           sizing="sm"
                        />
                     </div>

                     {/* Data Afastamento */}
                     <div>
                        <Label className="mb-1.5 flex items-center gap-1.5 text-xs text-gray-600">
                           <HiCalendar className="text-gray-500" />
                           Afastamento
                        </Label>
                        <input
                           type="date"
                           value={dataInicio}
                           onChange={(e) => setDataInicio(e.target.value)}
                           className="block w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 focus:border-red-500 focus:ring-red-500"
                        />
                     </div>

                     {/* Data Regresso */}
                     <div>
                        <Label className="mb-1.5 flex items-center gap-1.5 text-xs text-gray-600">
                           <HiCalendar className="text-gray-500" />
                           Regresso
                        </Label>
                        <input
                           type="date"
                           value={dataFim}
                           onChange={(e) => setDataFim(e.target.value)}
                           className="block w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 focus:border-red-500 focus:ring-red-500"
                        />
                     </div>
                  </div>
               </div>
            </section>
         )}

         {/* Results Section */}
         <section className="relative">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
               {loading ? (
                  <div className="flex flex-col items-center justify-center gap-4 p-16">
                     <Spinner size="xl" />
                     <p className="text-lg font-medium text-gray-600">
                        Carregando registros...
                     </p>
                  </div>
               ) : misRecords && misRecords.length > 0 ? (
                  <div>
                     <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                        <h3 className="text-lg font-bold text-gray-800">
                           Registros Encontrados ({misRecords.length})
                        </h3>
                     </div>
                     <div className="overflow-x-auto">
                        <ul
                           className="divide-y divide-gray-200 p-2"
                           key={listKey}
                        >
                           {memoUsersRowPgto}
                        </ul>
                     </div>
                  </div>
               ) : (
                  <div className="flex flex-col items-center justify-center gap-4 p-16">
                     <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                        <HiDocumentText className="text-4xl text-gray-400" />
                     </div>
                     <p className="text-lg font-medium text-gray-500">
                        Nenhum registro encontrado
                     </p>
                     <p className="text-sm text-gray-400">
                        Ajuste os filtros para encontrar resultados
                     </p>
                  </div>
               )}
            </div>
         </section>
      </div>
   );
}
