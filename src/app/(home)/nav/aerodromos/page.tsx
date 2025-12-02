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
      <div className='w-full h-full flex flex-col bg-gray-50 overflow-hidden'>
         {/* Header com busca e contador */}
         <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-2'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4'>
               <div className='flex items-center gap-3'>
                  <div className='p-2 bg-red-100 rounded-lg'>
                     <HiLocationMarker className='w-6 h-6 text-red-600' />
                  </div>
                  <div>
                     <h5 className='font-semibold text-lg text-gray-900'>
                        Cadastro de Aeródromos
                     </h5>
                     <p className='text-sm text-gray-500'>
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
                  color='red'
                  onClick={() => handleOpenModal()}
                  className='whitespace-nowrap'
                  disabled={loading}
               >
                  <HiPlus className='w-5 h-5 mr-2' />
                  Novo Aeródromo
               </Button>
            </div>

            {/* Alerta de erro */}
            {error && (
               <Alert color='failure' icon={HiExclamation} className='mb-4'>
                  <span className='font-medium'>Erro!</span> {error}
               </Alert>
            )}

            {/* Filtros */}
            <div className='flex items-center gap-4'>
               <div className='flex-1'>
                  <div className='relative'>
                     <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                        <HiSearch className='w-5 h-5 text-gray-400' />
                     </div>
                     <TextInput
                        className='w-full'
                        placeholder='Buscar por nome, código ICAO, cidade, país ou base aérea...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: "2.5rem" }}
                        disabled={loading}
                     />
                  </div>
               </div>
               <div className='flex items-center gap-2 bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200'>
                  <input
                     type='checkbox'
                     id='filterBases'
                     checked={showOnlyBases}
                     onChange={(e) => setShowOnlyBases(e.target.checked)}
                     className='w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500'
                     disabled={loading}
                  />
                  <label
                     htmlFor='filterBases'
                     className='text-sm font-medium text-gray-700 cursor-pointer whitespace-nowrap flex items-center gap-1.5'
                  >
                     <HiShieldCheck className='w-4 h-4 text-red-600' />
                     Somente Bases Aéreas
                  </label>
               </div>
            </div>
         </div>

         <div className='flex-1 min-h-0'>
            <div className='h-full grid grid-cols-1 xl:grid-cols-5 gap-4'>
               <div className='xl:col-span-3 flex flex-col min-h-0 h-full'>
                  <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col min-h-0'>
                     {loading ? (
                        <div className='flex flex-col justify-center items-center h-64'>
                           <Spinner size='xl' color='failure' />
                           <p className='mt-4 text-gray-600'>
                              Carregando aeródromos...
                           </p>
                        </div>
                     ) : filteredAerodromos.length === 0 ? (
                        <div className='flex flex-col justify-center items-center h-64'>
                           <div className='p-4 bg-gray-100 rounded-full mb-4'>
                              <HiLocationMarker className='w-12 h-12 text-gray-400' />
                           </div>
                           <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                              {searchTerm || showOnlyBases
                                 ? "Nenhum aeródromo encontrado"
                                 : "Nenhum aeródromo cadastrado"}
                           </h3>
                           <p className='text-gray-500 text-center max-w-md mb-4'>
                              {searchTerm || showOnlyBases
                                 ? "Não encontramos resultados com os filtros aplicados. Tente ajustar sua busca."
                                 : "Comece adicionando o primeiro aeródromo ao sistema."}
                           </p>
                           {!searchTerm && !showOnlyBases && (
                              <Button
                                 color='red'
                                 onClick={() => handleOpenModal()}
                              >
                                 <HiPlus className='w-5 h-5 mr-2' />
                                 Adicionar Primeiro Aeródromo
                              </Button>
                           )}
                        </div>
                     ) : (
                        <div className='overflow-y-auto flex-1 min-h-0'>
                           <table className='w-full text-sm text-gray-600 text-left'>
                              <thead className='sticky top-0 z-10 text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200'>
                                 <tr>
                                    <th
                                       scope='col'
                                       className='px-4 py-3 font-semibold'
                                    >
                                       Nome
                                    </th>
                                    <th
                                       scope='col'
                                       className='px-4 py-3 font-semibold'
                                    >
                                       ICAO
                                    </th>
                                    <th
                                       scope='col'
                                       className='px-4 py-3 font-semibold'
                                    >
                                       Localização
                                    </th>
                                    <th
                                       scope='col'
                                       className='px-4 py-3 font-semibold'
                                    >
                                       País
                                    </th>
                                    <th
                                       scope='col'
                                       className='px-4 py-3 font-semibold'
                                    >
                                       UTC
                                    </th>
                                    <th
                                       scope='col'
                                       className='px-4 py-3 font-semibold'
                                    >
                                       Elevação
                                    </th>
                                    <th scope='col' className='px-4 py-3'>
                                       <span className='sr-only'>Ações</span>
                                    </th>
                                 </tr>
                              </thead>
                              <tbody>
                                 {filteredAerodromos.map((aero) => (
                                    <tr
                                       key={aero.id}
                                       className={clsx(
                                          "border-b last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors",
                                          {
                                             "bg-slate-100":
                                                selectedAero &&
                                                selectedAero.id == aero.id,
                                          }
                                       )}
                                       onClick={() => setSelectedAero(aero)}
                                    >
                                       <td className='px-4 py-3 font-medium text-gray-900'>
                                          <div className='flex items-center gap-2'>
                                             <LuMapPin className='h-4 w-4 text-blue-600' />
                                             <div className='flex flex-col gap-0.5'>
                                                {aero.base_aerea ? (
                                                   <>
                                                      <div className='font-bold text-red-700 flex items-center gap-1.5'>
                                                         {aero.base_aerea.nome}
                                                         <span className='text-xs font-mono bg-red-100 px-1.5 py-0.5 rounded'>
                                                            {
                                                               aero.base_aerea
                                                                  .sigla
                                                            }
                                                         </span>
                                                      </div>
                                                      <div className='text-xs text-gray-500 font-normal'>
                                                         {aero.nome}
                                                      </div>
                                                   </>
                                                ) : (
                                                   <div
                                                      className='max-w-xs truncate'
                                                      title={aero.nome}
                                                   >
                                                      {aero.nome}
                                                   </div>
                                                )}
                                             </div>
                                          </div>
                                       </td>
                                       <td className='px-4 py-3'>
                                          <span className='font-mono font-semibold text-red-600'>
                                             {aero.codigo_icao}
                                          </span>
                                       </td>
                                       <td className='px-4 py-3'>
                                          <div className='text-sm'>
                                             {aero.cidade ? (
                                                <div className='flex items-center gap-1.5 font-medium text-gray-900'>
                                                   {aero.cidade.nome}-
                                                   {aero.cidade.uf}
                                                </div>
                                             ) : aero.cidade_manual ? (
                                                <div className='flex items-center gap-1.5 font-medium text-gray-900'>
                                                   {aero.cidade_manual}
                                                </div>
                                             ) : (
                                                <span className='text-gray-400'>
                                                   -
                                                </span>
                                             )}
                                          </div>
                                       </td>
                                       <td className='px-4 py-3'>
                                          <div className='text-sm'>
                                             <div className='flex items-center gap-1.5 text-gray-500 text-xs mt-0.5'>
                                                {aero.pais}
                                             </div>
                                          </div>
                                       </td>
                                       <td className='px-4 py-3'>
                                          <div className='text-sm'>
                                             <span className='font-mono font-semibold text-gray-700'>
                                                {aero.utc >= 0 ? "+" : ""}
                                                {aero.utc}
                                             </span>
                                          </div>
                                       </td>
                                       <td className='px-4 py-3'>
                                          <div className='space-y-1'>
                                             <div className='flex items-center gap-1.5 text-xs text-gray-600'>
                                                <MdTerrain className='w-3.5 h-3.5 text-green-600' />
                                                <span>{aero.elevacao} ft</span>
                                             </div>
                                          </div>
                                       </td>
                                       <td className='px-4 py-3'>
                                          <div className='flex gap-2 justify-end'>
                                             <button
                                                onClick={(e) => {
                                                   e.stopPropagation();
                                                   handleOpenModal(aero);
                                                }}
                                                className='text-gray-600 hover:text-red-600'
                                                title='Editar'
                                             >
                                                <HiPencil className='h-5 w-5' />
                                             </button>
                                             <button
                                                onClick={(e) => {
                                                   e.stopPropagation();
                                                   handleDelete(aero.id);
                                                }}
                                                className='text-gray-600 hover:text-red-600'
                                                title='Excluir'
                                             >
                                                <HiTrash className='h-5 w-5' />
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

               <div className='hidden xl:block xl:col-span-2 bg-gray-200 rounded-lg shadow border border-gray-300 overflow-hidden relative min-h-0 h-full'>
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
                           className='absolute top-4 right-4 bg-white/95 backdrop-blur p-2.5 rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors z-[500] group'
                           title='Resetar visualização do mapa'
                        >
                           <HiHome className='w-5 h-5 text-gray-600 group-hover:text-red-600 transition-colors' />
                        </button>

                        {/* Overlay de Informação */}
                        {selectedAero && (
                           <div className='absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur p-4 rounded-lg shadow-lg border border-gray-200 z-[500] flex justify-between items-center'>
                              <div>
                                 <h4 className='font-bold text-gray-900'>
                                    {selectedAero.base_aerea?.nome ||
                                       selectedAero.nome ||
                                       "Sem nome"}
                                 </h4>
                                 <p className='text-xs text-gray-500 font-mono'>
                                    {selectedAero.codigo_icao} | Lat:{" "}
                                    {selectedAero.latitude.toFixed(4)} | Lon:{" "}
                                    {selectedAero.longitude.toFixed(4)}
                                 </p>
                              </div>
                              <Button
                                 size='xs'
                                 color='gray'
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
