"use client";
import { useState, useMemo, useEffect } from "react";
import { Button, TextInput, Spinner, Alert } from "flowbite-react";
import {
   HiPlus,
   HiPencil,
   HiTrash,
   HiLocationMarker,
   HiSearch,
   HiShieldCheck,
   HiHome,
   HiExclamation,
} from "react-icons/hi";
import { MdTerrain, MdMyLocation } from "react-icons/md";
import { LuMapPin } from "react-icons/lu";
import AerodromoMap from "./components/AerodromoMap";
import AerodromoFormModal from "./components/AerodromoFormModal";
import clsx from "clsx";
import { Aerodromo, AerodromoFormData } from "./types";
import {
   getAerodromos,
   createAerodromo,
   updateAerodromo,
   deleteAerodromo,
} from "services/routes/nav/aerodromos";
import { useToast } from "../../../context/toast";

export default function AerodromoCadastro() {
   const [aerodromos, setAerodromos] = useState<Aerodromo[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [showModal, setShowModal] = useState(false);
   const [editingAerodromo, setEditingAerodromo] = useState<Aerodromo | null>(
      null
   );
   const [searchTerm, setSearchTerm] = useState("");
   const [showOnlyBases, setShowOnlyBases] = useState(true);
   const [selectedAero, setSelectedAero] = useState<Aerodromo | null>(null);
   const [mapResetKey, setMapResetKey] = useState(0);
   const [isXlScreen, setIsXlScreen] = useState(false);
   const { push } = useToast();

   // Detecta se a tela é xl+ para renderizar o mapa apenas quando visível
   useEffect(() => {
      const mediaQuery = window.matchMedia("(min-width: 1280px)");

      // Define o estado inicial
      setIsXlScreen(mediaQuery.matches);

      // Listener para mudanças no tamanho da tela
      const handleChange = (e: MediaQueryListEvent) => {
         setIsXlScreen(e.matches);
      };

      mediaQuery.addEventListener("change", handleChange);

      return () => {
         mediaQuery.removeEventListener("change", handleChange);
      };
   }, []);

   // Carrega aeródromos da API
   useEffect(() => {
      loadAerodromos();
   }, []);

   const loadAerodromos = async () => {
      try {
         setLoading(true);
         setError(null);
         const data = await getAerodromos();
         setAerodromos(data);
      } catch (err: any) {
         const errorMessage =
            err?.message || "Erro ao carregar aeródromos. Tente novamente.";
         setError(errorMessage);
         push({
            title: "Erro",
            message: errorMessage,
            type: "error",
         });
         console.error(err);
      } finally {
         setLoading(false);
      }
   };

   const handleOpenModal = (aerodromo: Aerodromo | null = null) => {
      setEditingAerodromo(aerodromo);
      setShowModal(true);
   };

   const handleCloseModal = () => {
      setShowModal(false);
      setEditingAerodromo(null);
   };

   const handleSubmit = async (formData: AerodromoFormData) => {
      try {
         setError(null);

         // Prepara os dados para envio
         const dataToSend = {
            nome: formData.nome,
            codigo_icao: formData.codigo_icao,
            codigo_iata: formData.codigo_iata || null,
            latitude: formData.latitude,
            longitude: formData.longitude,
            elevacao: formData.elevacao,
            pais: formData.pais,
            utc: formData.utc,
            base_aerea:
               formData.base_aerea &&
               formData.base_aerea.nome &&
               formData.base_aerea.sigla
                  ? formData.base_aerea
                  : null,
            codigo_cidade: formData.codigo_cidade || null,
            cidade_manual: formData.cidade_manual || null,
         };

         if (editingAerodromo) {
            const updated = await updateAerodromo(
               editingAerodromo.id,
               dataToSend
            );
            setAerodromos(
               aerodromos.map((a) =>
                  a.id === editingAerodromo.id ? updated : a
               )
            );
            push({
               title: "Sucesso!",
               message: `${updated.codigo_icao} atualizado com sucesso`,
               type: "success",
            });
         } else {
            const created = await createAerodromo(dataToSend);
            setAerodromos([...aerodromos, created]);
            push({
               title: "Sucesso!",
               message: `${created.codigo_icao} cadastrado com sucesso`,
               type: "success",
            });
         }

         handleCloseModal();
      } catch (err: any) {
         const errorMessage =
            err?.message || "Erro ao salvar aeródromo. Tente novamente.";
         push({
            title: "Erro",
            message: errorMessage,
            type: "error",
         });
         console.error(err);
      }
   };

   const handleDelete = async (id: number) => {
      const aeroToDelete = aerodromos.find((a) => a.id === id);
      if (confirm("Tem certeza que deseja excluir este aeródromo?")) {
         try {
            setError(null);
            await deleteAerodromo(id);
            setAerodromos(aerodromos.filter((a) => a.id !== id));
            if (selectedAero?.id === id) {
               setSelectedAero(null);
            }
            push({
               title: "Sucesso!",
               message: `Aeródromo ${
                  aeroToDelete?.codigo_icao || ""
               } excluído com sucesso`,
               type: "success",
            });
         } catch (err: any) {
            const errorMessage =
               err?.message || "Erro ao excluir aeródromo. Tente novamente.";
            push({
               title: "Erro",
               message: errorMessage,
               type: "error",
            });
            console.error(err);
         }
      }
   };

   const filteredAerodromos = useMemo(() => {
      return aerodromos.filter((aero) => {
         const matchesSearch =
            aero.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            aero.codigo_icao.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (aero.cidade?.nome || "")
               .toLowerCase()
               .includes(searchTerm.toLowerCase()) ||
            (aero.cidade?.uf || "")
               .toLowerCase()
               .includes(searchTerm.toLowerCase()) ||
            aero.pais.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (aero.base_aerea?.nome || "")
               .toLowerCase()
               .includes(searchTerm.toLowerCase()) ||
            (aero.base_aerea?.sigla || "")
               .toLowerCase()
               .includes(searchTerm.toLowerCase());

         const matchesFilter = showOnlyBases ? aero.base_aerea !== null : true;

         return matchesSearch && matchesFilter;
      });
   }, [aerodromos, searchTerm, showOnlyBases]);

   return (
      <div className="flex h-full w-full flex-col overflow-hidden bg-gray-50">
         {/* Header com busca e contador */}
         <div className="mb-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
               <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-red-100 p-2">
                     <HiLocationMarker className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                     <h5 className="text-lg font-semibold text-gray-900">
                        Cadastro de Aeródromos
                     </h5>
                     <p className="text-sm text-gray-500">
                        {loading ? (
                           "Carregando..."
                        ) : (
                           <>
                              {filteredAerodromos.length}{" "}
                              {filteredAerodromos.length === 1
                                 ? showOnlyBases
                                    ? "base aérea encontrada"
                                    : "aeródromo encontrado"
                                 : showOnlyBases
                                   ? "bases aéreas encontradas"
                                   : "aeródromos encontrados"}
                           </>
                        )}
                     </p>
                  </div>
               </div>
               <Button
                  color="red"
                  onClick={() => handleOpenModal()}
                  className="whitespace-nowrap"
                  disabled={loading}
               >
                  <HiPlus className="mr-2 h-5 w-5" />
                  Novo Aeródromo
               </Button>
            </div>

            {/* Alerta de erro */}
            {error && (
               <Alert color="failure" icon={HiExclamation} className="mb-4">
                  <span className="font-medium">Erro!</span> {error}
               </Alert>
            )}

            {/* Filtros */}
            <div className="flex items-center gap-4">
               <div className="flex-1">
                  <div className="relative">
                     <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <HiSearch className="h-5 w-5 text-gray-400" />
                     </div>
                     <TextInput
                        className="w-full"
                        placeholder="Buscar por nome, código ICAO, cidade, país ou base aérea..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: "2.5rem" }}
                        disabled={loading}
                     />
                  </div>
               </div>
               <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5">
                  <input
                     type="checkbox"
                     id="filterBases"
                     checked={showOnlyBases}
                     onChange={(e) => setShowOnlyBases(e.target.checked)}
                     className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-red-600 focus:ring-red-500"
                     disabled={loading}
                  />
                  <label
                     htmlFor="filterBases"
                     className="flex cursor-pointer items-center gap-1.5 text-sm font-medium whitespace-nowrap text-gray-700"
                  >
                     <HiShieldCheck className="h-4 w-4 text-red-600" />
                     Somente Bases Aéreas
                  </label>
               </div>
            </div>
         </div>

         <div className="min-h-0 flex-1">
            <div className="grid h-full grid-cols-1 gap-4 xl:grid-cols-5">
               <div className="flex h-full min-h-0 flex-col xl:col-span-3">
                  <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                     {loading ? (
                        <div className="flex h-64 flex-col items-center justify-center">
                           <Spinner size="xl" color="failure" />
                           <p className="mt-4 text-gray-600">
                              Carregando aeródromos...
                           </p>
                        </div>
                     ) : filteredAerodromos.length === 0 ? (
                        <div className="flex h-64 flex-col items-center justify-center">
                           <div className="mb-4 rounded-full bg-gray-100 p-4">
                              <HiLocationMarker className="h-12 w-12 text-gray-400" />
                           </div>
                           <h3 className="mb-2 text-lg font-semibold text-gray-900">
                              {searchTerm || showOnlyBases
                                 ? "Nenhum aeródromo encontrado"
                                 : "Nenhum aeródromo cadastrado"}
                           </h3>
                           <p className="mb-4 max-w-md text-center text-gray-500">
                              {searchTerm || showOnlyBases
                                 ? "Não encontramos resultados com os filtros aplicados. Tente ajustar sua busca."
                                 : "Comece adicionando o primeiro aeródromo ao sistema."}
                           </p>
                           {!searchTerm && !showOnlyBases && (
                              <Button
                                 color="red"
                                 onClick={() => handleOpenModal()}
                              >
                                 <HiPlus className="mr-2 h-5 w-5" />
                                 Adicionar Primeiro Aeródromo
                              </Button>
                           )}
                        </div>
                     ) : (
                        <div className="min-h-0 flex-1 overflow-y-auto">
                           <table className="w-full text-left text-sm text-gray-600">
                              <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50 text-xs text-gray-700 uppercase">
                                 <tr>
                                    <th
                                       scope="col"
                                       className="px-4 py-3 font-semibold"
                                    >
                                       Nome
                                    </th>
                                    <th
                                       scope="col"
                                       className="px-4 py-3 font-semibold"
                                    >
                                       ICAO
                                    </th>
                                    <th
                                       scope="col"
                                       className="px-4 py-3 font-semibold"
                                    >
                                       Localização
                                    </th>
                                    <th
                                       scope="col"
                                       className="px-4 py-3 font-semibold"
                                    >
                                       País
                                    </th>
                                    <th
                                       scope="col"
                                       className="px-4 py-3 font-semibold"
                                    >
                                       UTC
                                    </th>
                                    <th
                                       scope="col"
                                       className="px-4 py-3 font-semibold"
                                    >
                                       Elevação
                                    </th>
                                    <th scope="col" className="px-4 py-3">
                                       <span className="sr-only">Ações</span>
                                    </th>
                                 </tr>
                              </thead>
                              <tbody>
                                 {filteredAerodromos.map((aero) => (
                                    <tr
                                       key={aero.id}
                                       className={clsx(
                                          "cursor-pointer border-b border-gray-200 transition-colors last:border-b-0 hover:bg-gray-50",
                                          {
                                             "bg-slate-100":
                                                selectedAero &&
                                                selectedAero.id == aero.id,
                                          }
                                       )}
                                       onClick={() => setSelectedAero(aero)}
                                    >
                                       <td className="px-4 py-3 font-medium text-gray-900">
                                          <div className="flex items-center gap-2">
                                             <LuMapPin className="h-4 w-4 text-blue-600" />
                                             <div className="flex flex-col gap-0.5">
                                                {aero.base_aerea ? (
                                                   <>
                                                      <div className="flex items-center gap-1.5 font-bold text-red-700">
                                                         {aero.base_aerea.nome}
                                                         <span className="rounded bg-red-100 px-1.5 py-0.5 font-mono text-xs">
                                                            {
                                                               aero.base_aerea
                                                                  .sigla
                                                            }
                                                         </span>
                                                      </div>
                                                      <div className="text-xs font-normal text-gray-500">
                                                         {aero.nome}
                                                      </div>
                                                   </>
                                                ) : (
                                                   <div
                                                      className="max-w-xs truncate"
                                                      title={aero.nome}
                                                   >
                                                      {aero.nome}
                                                   </div>
                                                )}
                                             </div>
                                          </div>
                                       </td>
                                       <td className="px-4 py-3">
                                          <span className="font-mono font-semibold text-red-600">
                                             {aero.codigo_icao}
                                          </span>
                                       </td>
                                       <td className="px-4 py-3">
                                          <div className="text-sm">
                                             {aero.cidade ? (
                                                <div className="flex items-center gap-1.5 font-medium text-gray-900">
                                                   {aero.cidade.nome}-
                                                   {aero.cidade.uf}
                                                </div>
                                             ) : aero.cidade_manual ? (
                                                <div className="flex items-center gap-1.5 font-medium text-gray-900">
                                                   {aero.cidade_manual}
                                                </div>
                                             ) : (
                                                <span className="text-gray-400">
                                                   -
                                                </span>
                                             )}
                                          </div>
                                       </td>
                                       <td className="px-4 py-3">
                                          <div className="text-sm">
                                             <div className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
                                                {aero.pais}
                                             </div>
                                          </div>
                                       </td>
                                       <td className="px-4 py-3">
                                          <div className="text-sm">
                                             <span className="font-mono font-semibold text-gray-700">
                                                {aero.utc >= 0 ? "+" : ""}
                                                {aero.utc}
                                             </span>
                                          </div>
                                       </td>
                                       <td className="px-4 py-3">
                                          <div className="space-y-1">
                                             <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                <MdTerrain className="h-3.5 w-3.5 text-green-600" />
                                                <span>{aero.elevacao} ft</span>
                                             </div>
                                          </div>
                                       </td>
                                       <td className="px-4 py-3">
                                          <div className="flex justify-end gap-2">
                                             <button
                                                onClick={(e) => {
                                                   e.stopPropagation();
                                                   handleOpenModal(aero);
                                                }}
                                                className="text-gray-600 hover:text-red-600"
                                                title="Editar"
                                             >
                                                <HiPencil className="h-5 w-5" />
                                             </button>
                                             <button
                                                onClick={(e) => {
                                                   e.stopPropagation();
                                                   handleDelete(aero.id);
                                                }}
                                                className="text-gray-600 hover:text-red-600"
                                                title="Excluir"
                                             >
                                                <HiTrash className="h-5 w-5" />
                                             </button>
                                          </div>
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     )}
                  </div>
               </div>

               <div className="relative hidden h-full min-h-0 overflow-hidden rounded-lg border border-gray-300 bg-gray-200 shadow xl:col-span-2 xl:block">
                  {/* Renderiza o mapa apenas quando a tela é xl+ para evitar erro do Leaflet */}
                  {isXlScreen && (
                     <>
                        <AerodromoMap
                           aerodromos={filteredAerodromos}
                           selectedAero={selectedAero}
                           resetKey={mapResetKey}
                        />

                        {/* Botão de Reset */}
                        <button
                           onClick={() => {
                              setSelectedAero(null);
                              setMapResetKey((prev) => prev + 1);
                           }}
                           className="group absolute top-4 right-4 z-[500] rounded-lg border border-gray-200 bg-white/95 p-2.5 shadow-lg backdrop-blur transition-colors hover:bg-gray-50"
                           title="Resetar visualização do mapa"
                        >
                           <HiHome className="h-5 w-5 text-gray-600 transition-colors group-hover:text-red-600" />
                        </button>

                        {/* Overlay de Informação */}
                        {selectedAero && (
                           <div className="absolute right-4 bottom-4 left-4 z-[500] flex items-center justify-between rounded-lg border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur">
                              <div>
                                 <h4 className="font-bold text-gray-900">
                                    {selectedAero.base_aerea?.nome ||
                                       selectedAero.nome ||
                                       "Sem nome"}
                                 </h4>
                                 <p className="font-mono text-xs text-gray-500">
                                    {selectedAero.codigo_icao} | Lat:{" "}
                                    {selectedAero.latitude.toFixed(4)} | Lon:{" "}
                                    {selectedAero.longitude.toFixed(4)}
                                 </p>
                              </div>
                              <Button
                                 size="xs"
                                 color="gray"
                                 onClick={() => setSelectedAero(null)}
                              >
                                 Fechar
                              </Button>
                           </div>
                        )}
                     </>
                  )}
               </div>
            </div>
         </div>

         {/* Modal de Cadastro/Edição */}
         <AerodromoFormModal
            show={showModal}
            editingAerodromo={editingAerodromo}
            onClose={handleCloseModal}
            onSubmit={handleSubmit}
         />
      </div>
   );
}
