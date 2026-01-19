"use client";

import { useState, useCallback, useEffect } from "react";
import { Label, TextInput, Badge, Spinner } from "flowbite-react";
import { Missao } from "services/routes/cegep/missoes";
import { CardMission } from "./components/cardMission";
import MissionDetail from "./components/missionDetail";
import { useRegisterContext } from "../../context/registerContext";
import { useMissoes } from "@/hooks/queries/useMissoes";
import { useEtiquetasMissoes } from "@/hooks/queries/useEtiquetasMissoes";
import { Pagination } from "@/components/Pagination";
import { MultiSelect } from "@/components/MultiSelect";
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
import clsx from "clsx";

export function RegisPage() {
   const [cloneMis, setCloneMis] = useState<Missao | null>(null);
   const [showForm, setShowForm] = useState(false);
   const [showFilters, setShowFilters] = useState(false);
   const [selectedEtiquetaIds, setSelectedEtiquetaIds] = useState<number[]>([]);

   // Pagination states
   const [currentPage, setCurrentPage] = useState(1);
   const [perPage] = useState(20);

   const { data: etiquetasDisponiveis = [] } = useEtiquetasMissoes();

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

   // React Query para buscar missoes
   const { data, isLoading, isFetching } = useMissoes({
      page: currentPage,
      per_page: perPage,
      tipo_doc: tipoDoc.length > 0 ? tipoDoc.join(",") : undefined,
      n_doc: nDoc,
      tipo: selectedTipo.length > 0 ? selectedTipo.join(",") : undefined,
      ini: dataInicio || undefined,
      fim: dataFim || undefined,
      user_search: userSearch || undefined,
      city: citySearch || undefined,
      etiqueta_ids:
         selectedEtiquetaIds.length > 0
            ? selectedEtiquetaIds.join(",")
            : undefined,
   });

   const missoes = data?.items ?? null;
   const totalPages = data?.pages ?? 1;
   const total = data?.total ?? 0;

   const hasActiveFilters = !!(
      tipoDoc.length > 0 ||
      nDoc ||
      selectedTipo.length > 0 ||
      userSearch ||
      citySearch ||
      dataInicio ||
      dataFim ||
      selectedEtiquetaIds.length > 0
   );

   const clearFilters = () => {
      setTipoDoc([]);
      setNDoc(undefined);
      setSelectedTipo([]);
      setUserSearch("");
      setCitySearch("");
      setSelectedEtiquetaIds([]);
      const hoje = new Date();
      const quinzeDiasAntes = new Date(hoje.getFullYear(), 0, 1);
      setDataInicio(quinzeDiasAntes.toISOString().split("T")[0]);
      setDataFim(hoje.toISOString().split("T")[0]);
      setCurrentPage(1);
   };

   const handleSetClone = useCallback((missao: Missao) => {
      setCloneMis(missao);
   }, []);

   const handleSetShowForm = useCallback((show: boolean) => {
      setShowForm(show);
   }, []);

   const handlePageChange = useCallback((page: number) => {
      setCurrentPage(page);
   }, []);

   // Reset to page 1 when any filter changes
   useEffect(() => {
      setCurrentPage(1);
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

   return (
      <>
         <div className="flex h-full flex-col overflow-hidden">
            {/* Active Filters Tags */}
            {hasActiveFilters && (
               <section className="mb-3 flex shrink-0 justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                     <span className="text-xs font-medium text-gray-600">
                        Filtros ativos:
                     </span>

                     {tipoDoc.map((tipo) => (
                        <Badge key={tipo} color="red" className="">
                           <div className="flex items-center gap-1.5">
                              <HiDocumentText className="h-3 w-3" />
                              <span>
                                 Ordem: {tipo === "om" ? "Missão" : "Serviço"}
                              </span>
                              <button
                                 onClick={() =>
                                    setTipoDoc((prev) =>
                                       prev.filter((t) => t !== tipo)
                                    )
                                 }
                                 className="ml-1 hover:text-red-600"
                              >
                                 <HiX className="h-3 w-3" />
                              </button>
                           </div>
                        </Badge>
                     ))}

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

                     {selectedTipo.map((tipo) => (
                        <Badge key={tipo} color="red">
                           <div className="flex items-center gap-1.5">
                              <HiClipboardList className="h-3 w-3" />
                              <span>Tipo: {tipo.toUpperCase()}</span>
                              <button
                                 onClick={() =>
                                    setSelectedTipo((prev) =>
                                       prev.filter((t) => t !== tipo)
                                    )
                                 }
                                 className="ml-1 hover:text-red-600"
                              >
                                 <HiX className="h-3 w-3" />
                              </button>
                           </div>
                        </Badge>
                     ))}

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

                     {citySearch && (
                        <Badge color="red">
                           <div className="flex items-center gap-1.5">
                              <HiLocationMarker className="h-3 w-3" />
                              <span>Cidade: {citySearch}</span>
                              <button
                                 onClick={() => setCitySearch("")}
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
                                       quinzeDiasAntes
                                          .toISOString()
                                          .split("T")[0]
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
                                    setDataFim(
                                       hoje.toISOString().split("T")[0]
                                    );
                                 }}
                                 className="ml-1 hover:text-red-600"
                              >
                                 <HiX className="h-3 w-3" />
                              </button>
                           </div>
                        </Badge>
                     )}

                     {/* Etiquetas selecionadas */}
                     {selectedEtiquetaIds.map((id) => {
                        const etiqueta = etiquetasDisponiveis.find(
                           (e) => e.id === id
                        );
                        if (!etiqueta) return null;
                        return (
                           <span
                              key={id}
                              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-white"
                              style={{ backgroundColor: etiqueta.cor }}
                           >
                              <HiTag className="h-3 w-3" />
                              {etiqueta.nome}
                              <button
                                 onClick={() =>
                                    setSelectedEtiquetaIds((prev) =>
                                       prev.filter((eid) => eid !== id)
                                    )
                                 }
                                 className="ml-0.5 rounded-full p-0.5 hover:bg-white/20"
                              >
                                 <HiX className="h-3 w-3" />
                              </button>
                           </span>
                        );
                     })}

                     <button
                        onClick={clearFilters}
                        className="text-xs text-gray-500 underline hover:text-gray-700"
                     >
                        Limpar todos
                     </button>
                  </div>
                  <div className="flex items-center gap-2">
                     <button
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                     >
                        <HiFilter />
                        {showFilters ? "Ocultar" : "Filtros"}
                        {hasActiveFilters && (
                           <Badge color="red" size="sm">
                              {tipoDoc.length +
                                 selectedTipo.length +
                                 (nDoc ? 1 : 0) +
                                 (userSearch ? 1 : 0) +
                                 (citySearch ? 1 : 0) +
                                 (dataInicio ? 1 : 0) +
                                 (dataFim ? 1 : 0)}
                           </Badge>
                        )}
                     </button>
                     <button
                        type="button"
                        onClick={() => handleSetShowForm(true)}
                        className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                     >
                        <span>+</span>
                        Nova Missão
                     </button>
                  </div>
               </section>
            )}

            {/* Filters Section */}
            <div
               className={`mb-2 shrink-0 overflow-hidden transition-all duration-300 ease-in-out ${
                  showFilters ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
               }`}
            >
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
                           <MultiSelect
                              options={[
                                 { value: "om", label: "Missão" },
                                 { value: "os", label: "Serviço" },
                              ]}
                              selected={tipoDoc}
                              onChange={setTipoDoc}
                              placeholder="Selecione..."
                           />
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
                           <MultiSelect
                              options={[
                                 { value: "tal", label: "TAL" },
                                 { value: "adm", label: "ADM" },
                                 { value: "opr", label: "OPR" },
                              ]}
                              selected={selectedTipo}
                              onChange={setSelectedTipo}
                              placeholder="Selecione..."
                           />
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
                              placeholder="Nome de guerra"
                              sizing="sm"
                           />
                        </div>

                        {/* Cidade */}
                        <div>
                           <Label className="mb-1.5 flex items-center gap-1.5 text-xs text-gray-600">
                              <HiLocationMarker className="text-gray-500" />
                              Cidade
                           </Label>
                           <TextInput
                              type="text"
                              value={citySearch}
                              onChange={(e) => setCitySearch(e.target.value)}
                              placeholder="Município"
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

                     {/* Multi-select Etiquetas */}
                     {etiquetasDisponiveis.length > 0 && (
                        <div className="mt-4 border-t border-gray-200 pt-4">
                           <Label className="mb-2 flex items-center gap-1.5 text-xs text-gray-600">
                              <HiTag className="text-gray-500" />
                              Filtrar por Etiquetas
                           </Label>
                           <div className="flex flex-wrap gap-2">
                              {etiquetasDisponiveis.map((etiqueta, index) => {
                                 const isSelected =
                                    selectedEtiquetaIds.includes(etiqueta.id!);
                                 return (
                                    <button
                                       key={etiqueta.id ?? `etiqueta-${index}`}
                                       onClick={() => {
                                          if (isSelected) {
                                             setSelectedEtiquetaIds((prev) =>
                                                prev.filter(
                                                   (id) => id !== etiqueta.id
                                                )
                                             );
                                          } else {
                                             setSelectedEtiquetaIds((prev) => [
                                                ...prev,
                                                etiqueta.id!,
                                             ]);
                                          }
                                       }}
                                       className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                                          isSelected
                                             ? "text-white shadow-sm"
                                             : "border border-dashed"
                                       }`}
                                       style={
                                          isSelected
                                             ? {
                                                  backgroundColor: etiqueta.cor,
                                               }
                                             : {
                                                  borderColor: etiqueta.cor,
                                                  color: etiqueta.cor,
                                                  backgroundColor: `${etiqueta.cor}10`,
                                               }
                                       }
                                    >
                                       <HiTag className="h-3 w-3" />
                                       {etiqueta.nome}
                                       {isSelected && (
                                          <HiX className="h-3 w-3" />
                                       )}
                                    </button>
                                 );
                              })}
                           </div>
                        </div>
                     )}
                  </div>
               </section>
            </div>

            {/* Results Section */}
            <section className="flex-1">
               {isLoading && !missoes ? (
                  <div className="flex min-h-75 flex-col items-center justify-center gap-2 p-8">
                     <Spinner size="lg" color="failure" />
                     <p className="text-sm text-gray-500">Carregando...</p>
                  </div>
               ) : (
                  <div
                     className={clsx(
                        "transition-opacity duration-200",
                        isFetching && "opacity-50"
                     )}
                  >
                     {/* Results Grid */}
                     {missoes?.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-8">
                           <p className="mb-3 text-sm text-gray-600">
                              Nenhuma missão encontrada
                           </p>
                           {hasActiveFilters && (
                              <button
                                 onClick={clearFilters}
                                 className="text-sm text-red-600 hover:text-red-700"
                              >
                                 Limpar Filtros
                              </button>
                           )}
                        </div>
                     ) : (
                        <div>
                           <h3 className="mb-4 text-lg font-bold text-gray-800">
                              Registros Encontrados ({total})
                           </h3>
                           <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                              {missoes?.map((m) => (
                                 <CardMission
                                    key={m.id}
                                    missao={m}
                                    setClone={handleSetClone}
                                    setShowForm={handleSetShowForm}
                                 />
                              ))}
                           </div>

                           {/* Pagination Section */}
                           {missoes && missoes.length > 0 && (
                              <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-gray-200 pt-4 sm:flex-row">
                                 <p className="text-sm text-gray-600">
                                    Mostrando{" "}
                                    <span className="font-medium text-gray-900">
                                       {(currentPage - 1) * perPage + 1}
                                    </span>
                                    -
                                    <span className="font-medium text-gray-900">
                                       {Math.min(currentPage * perPage, total)}
                                    </span>{" "}
                                    de{" "}
                                    <span className="font-medium text-gray-900">
                                       {total}
                                    </span>{" "}
                                    missões
                                 </p>
                                 <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                 />
                              </div>
                           )}
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
               setShowForm={handleSetShowForm}
               setClone={handleSetClone}
            />
         )}
      </>
   );
}
