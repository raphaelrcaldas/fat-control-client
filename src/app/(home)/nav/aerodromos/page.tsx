"use client";
import { useState, useMemo } from "react";
import { Button, TextInput } from "flowbite-react";
import {
   HiPlus,
   HiPencil,
   HiTrash,
   HiLocationMarker,
   HiSearch,
   HiShieldCheck,
   HiHome,
} from "react-icons/hi";
import { MdTerrain, MdMyLocation } from "react-icons/md";
import { LuMapPin } from "react-icons/lu";
import AerodromoMap from "./components/AerodromoMap";
import AerodromoFormModal from "./components/AerodromoFormModal";
import clsx from "clsx";
import { Aerodromo, AerodromoFormData } from "./types";

export default function AerodromoCadastro() {
   const [aerodromos, setAerodromos] = useState<Aerodromo[]>([
      {
         id: "1",
         nome: "Aeroporto Internacional de Brasília",
         codigo_icao: "SBBR",
         codigo_iata: "BSB",
         latitude: -15.8697,
         longitude: -47.9206,
         elevacao: 3497,
         codigo_cidade: 5300108,
         cidade: { codigo: 5300108, nome: "Brasília", uf: "DF" },
         pais: "Brasil",
         utc: -3,
         base_aerea: null,
         cidade_manual: null,
      },
      {
         id: "2",
         nome: "Aeroporto de Anápolis",
         codigo_icao: "SBAN",
         latitude: -16.2267,
         longitude: -48.9644,
         elevacao: 3730,
         codigo_cidade: 5201108,
         cidade: { codigo: 5201108, nome: "Anápolis", uf: "GO" },
         cidade_manual: null,
         pais: "Brasil",
         utc: -3,
         base_aerea: { nome: "Base Aérea de Anápolis", sigla: "BAAN" },
      },
      {
         id: "3",
         nome: "Aeroporto Internacional de São Paulo/Guarulhos",
         codigo_icao: "SBGR",
         codigo_iata: "GRU",
         latitude: -23.4356,
         longitude: -46.4731,
         elevacao: 2459,
         codigo_cidade: 3518800,
         cidade: { codigo: 3518800, nome: "Guarulhos", uf: "SP" },
         cidade_manual: null,
         pais: "Brasil",
         utc: -3,
         base_aerea: null,
      },
      {
         id: "4",
         nome: "Aeroporto Santos Dumont",
         codigo_icao: "SBRJ",
         codigo_iata: "SDU",
         latitude: -22.9104,
         longitude: -43.1631,
         elevacao: 11,
         codigo_cidade: 3304557,
         cidade: { codigo: 3304557, nome: "Rio de Janeiro", uf: "RJ" },
         cidade_manual: null,
         pais: "Brasil",
         utc: -3,
         base_aerea: null,
      },
      {
         id: "5",
         nome: "Aeroporto do Galeão",
         codigo_icao: "SBSC",
         latitude: -22.9324,
         longitude: -43.7189,
         elevacao: 10,
         codigo_cidade: 3304557,
         cidade: { codigo: 3304557, nome: "Rio de Janeiro", uf: "RJ" },
         cidade_manual: null,
         pais: "Brasil",
         utc: -3,
         base_aerea: { nome: "Base Aérea de Santa Cruz", sigla: "BASC" },
      },
      {
         id: "6",
         nome: "Aeroporto Internacional de Confins",
         codigo_icao: "SBCF",
         codigo_iata: "CNF",
         latitude: -19.6244,
         longitude: -43.9719,
         elevacao: 2715,
         codigo_cidade: 3118007,
         cidade: { codigo: 3118007, nome: "Confins", uf: "MG" },
         cidade_manual: null,
         pais: "Brasil",
         utc: -3,
         base_aerea: null,
      },
      {
         id: "7",
         nome: "Aeroporto de Congonhas",
         codigo_icao: "SBSP",
         codigo_iata: "CGH",
         latitude: -23.6261,
         longitude: -46.6564,
         elevacao: 2631,
         codigo_cidade: 3550308,
         cidade: { codigo: 3550308, nome: "São Paulo", uf: "SP" },
         cidade_manual: null,
         pais: "Brasil",
         utc: -3,
         base_aerea: null,
      },
      {
         id: "8",
         nome: "Aeroporto de Canoas",
         codigo_icao: "SBCO",
         latitude: -29.9461,
         longitude: -51.1444,
         elevacao: 26,
         codigo_cidade: 4305108,
         cidade: { codigo: 4305108, nome: "Canoas", uf: "RS" },
         cidade_manual: null,
         pais: "Brasil",
         utc: -3,
         base_aerea: { nome: "Base Aérea de Canoas", sigla: "BACO" },
      },
      {
         id: "9",
         nome: "Aeroporto Internacional Salgado Filho",
         codigo_icao: "SBPA",
         codigo_iata: "POA",
         latitude: -29.9939,
         longitude: -51.1714,
         elevacao: 11,
         codigo_cidade: 4314902,
         cidade: { codigo: 4314902, nome: "Porto Alegre", uf: "RS" },
         cidade_manual: null,
         pais: "Brasil",
         utc: -3,
         base_aerea: null,
      },
      {
         id: "10",
         nome: "Aeroporto Internacional de Recife",
         codigo_icao: "SBRF",
         codigo_iata: "REC",
         latitude: -8.1264,
         longitude: -34.9236,
         elevacao: 33,
         codigo_cidade: 2611606,
         cidade: { codigo: 2611606, nome: "Recife", uf: "PE" },
         cidade_manual: null,
         pais: "Brasil",
         utc: -3,
         base_aerea: null,
      },
      {
         id: "11",
         nome: "Aeroporto de Recife",
         codigo_icao: "SBRF",
         latitude: -8.0326,
         longitude: -34.9228,
         elevacao: 31,
         codigo_cidade: 2611606,
         cidade: { codigo: 2611606, nome: "Recife", uf: "PE" },
         cidade_manual: null,
         pais: "Brasil",
         utc: -3,
         base_aerea: { nome: "Base Aérea de Recife", sigla: "BARF" },
      },
      {
         id: "12",
         nome: "Aeroporto Internacional de Salvador",
         codigo_icao: "SBSV",
         codigo_iata: "SSA",
         latitude: -12.9086,
         longitude: -38.3225,
         elevacao: 64,
         codigo_cidade: 2927408,
         cidade: { codigo: 2927408, nome: "Salvador", uf: "BA" },
         cidade_manual: null,
         pais: "Brasil",
         utc: -3,
         base_aerea: null,
      },
      {
         id: "13",
         nome: "Aeroporto Internacional de Fortaleza",
         codigo_icao: "SBFZ",
         codigo_iata: "FOR",
         latitude: -3.7763,
         longitude: -38.5326,
         elevacao: 82,
         codigo_cidade: 2304400,
         cidade: { codigo: 2304400, nome: "Fortaleza", uf: "CE" },
         cidade_manual: null,
         pais: "Brasil",
         utc: -3,
         base_aerea: null,
      },
      {
         id: "14",
         nome: "Aeroporto Pinto Martins",
         codigo_icao: "SBFZ",
         latitude: -3.7628,
         longitude: -38.5367,
         elevacao: 79,
         codigo_cidade: 2304400,
         cidade: { codigo: 2304400, nome: "Fortaleza", uf: "CE" },
         cidade_manual: null,
         pais: "Brasil",
         utc: -3,
         base_aerea: { nome: "Base Aérea de Fortaleza", sigla: "BAFZ" },
      },
      {
         id: "15",
         nome: "Aeroporto de Viracopos",
         codigo_icao: "SBKP",
         codigo_iata: "VCP",
         latitude: -23.0074,
         longitude: -47.1345,
         elevacao: 2170,
         codigo_cidade: 3509502,
         cidade: { codigo: 3509502, nome: "Campinas", uf: "SP" },
         cidade_manual: null,
         pais: "Brasil",
         utc: -3,
         base_aerea: null,
      },
      {
         id: "16",
         nome: "Aeroporto Internacional de Manaus",
         codigo_icao: "SBEG",
         codigo_iata: "MAO",
         latitude: -3.0386,
         longitude: -60.0497,
         elevacao: 264,
         codigo_cidade: 1302603,
         cidade: { codigo: 1302603, nome: "Manaus", uf: "AM" },
         cidade_manual: null,
         pais: "Brasil",
         utc: -4,
         base_aerea: null,
      },
      {
         id: "17",
         nome: "Aeroporto Internacional de Belém",
         codigo_icao: "SBBE",
         codigo_iata: "BEL",
         latitude: -1.3793,
         longitude: -48.4763,
         elevacao: 54,
         codigo_cidade: 1501402,
         cidade: { codigo: 1501402, nome: "Belém", uf: "PA" },
         cidade_manual: null,
         pais: "Brasil",
         utc: -3,
         base_aerea: null,
      },
      {
         id: "18",
         nome: "Aeródromo de Jundiaí",
         codigo_icao: "SBJD",
         latitude: -23.2081,
         longitude: -46.9436,
         elevacao: 2477,
         codigo_cidade: 3522208,
         cidade: { codigo: 3522208, nome: "Jundiaí", uf: "SP" },
         cidade_manual: null,
         pais: "Brasil",
         utc: -3,
         base_aerea: null,
      },
      {
         id: "19",
         nome: "Aeroporto de Curitiba",
         codigo_icao: "SBCT",
         codigo_iata: "CWB",
         latitude: -25.5285,
         longitude: -49.1758,
         elevacao: 2988,
         codigo_cidade: 4106902,
         cidade: { codigo: 4106902, nome: "Curitiba", uf: "PR" },
         cidade_manual: null,
         pais: "Brasil",
         utc: -3,
         base_aerea: null,
      },
      {
         id: "20",
         nome: "Aeroporto Internacional de Campo Grande",
         codigo_icao: "SBCG",
         latitude: -20.4686,
         longitude: -54.6725,
         elevacao: 1833,
         codigo_cidade: 5002704,
         cidade: { codigo: 5002704, nome: "Campo Grande", uf: "MS" },
         cidade_manual: null,
         pais: "Brasil",
         utc: -4,
         base_aerea: { nome: "Base Aérea de Campo Grande", sigla: "BACG" },
      },
   ]);

   const [showModal, setShowModal] = useState(false);
   const [editingAerodromo, setEditingAerodromo] = useState<Aerodromo | null>(
      null
   );
   const [searchTerm, setSearchTerm] = useState("");
   const [showOnlyBases, setShowOnlyBases] = useState(true);
   const [selectedAero, setSelectedAero] = useState<Aerodromo | null>(null);
   const [mapResetKey, setMapResetKey] = useState(0);

   const handleOpenModal = (aerodromo: Aerodromo | null = null) => {
      setEditingAerodromo(aerodromo);
      setShowModal(true);
   };

   const handleCloseModal = () => {
      setShowModal(false);
      setEditingAerodromo(null);
   };

   const handleSubmit = (formData: AerodromoFormData) => {
      if (editingAerodromo) {
         setAerodromos(
            aerodromos.map((a) =>
               a.id === editingAerodromo.id
                  ? { ...formData, id: editingAerodromo.id }
                  : a
            )
         );
      } else {
         const newAerodromo: Aerodromo = {
            ...formData,
            id: Date.now().toString(),
         };
         setAerodromos([...aerodromos, newAerodromo]);
      }

      handleCloseModal();
   };

   const handleDelete = (id: string) => {
      if (confirm("Tem certeza que deseja excluir este aeródromo?")) {
         setAerodromos(aerodromos.filter((a) => a.id !== id));
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
                        {filteredAerodromos.length}{" "}
                        {filteredAerodromos.length === 1
                           ? showOnlyBases
                              ? "base aérea encontrada"
                              : "aeródromo encontrado"
                           : showOnlyBases
                           ? "bases aéreas encontradas"
                           : "aeródromos encontrados"}
                     </p>
                  </div>
               </div>
               <Button
                  color='red'
                  onClick={() => handleOpenModal()}
                  className='whitespace-nowrap'
               >
                  <HiPlus className='w-5 h-5 mr-2' />
                  Novo Aeródromo
               </Button>
            </div>

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
            <div className='h-full grid grid-cols-1 lg:grid-cols-5 gap-4'>
               <div className='lg:col-span-3 flex flex-col min-h-0 h-full'>
                  <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col min-h-0'>
                     {filteredAerodromos.length === 0 ? (
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
                                       Coordernadas
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
                                          "border-b last:border-b-0 cursor-pointer",
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
                                             <div className='flex items-center gap-1.5 font-medium text-gray-900'>
                                                {aero.cidade?.nome}-{aero.cidade?.uf}
                                             </div>
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
                                                <MdMyLocation className='w-3.5 h-3.5 text-blue-500' />
                                                <span className='font-mono'>
                                                   {aero.latitude.toFixed(4)},{" "}
                                                   {aero.longitude.toFixed(4)}
                                                </span>
                                             </div>
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
                                                onClick={() =>
                                                   handleOpenModal(aero)
                                                }
                                                className='text-gray-600 hover:text-red-600'
                                                title='Editar'
                                             >
                                                <HiPencil className='h-5 w-5' />
                                             </button>
                                             <button
                                                onClick={() =>
                                                   handleDelete(aero.id)
                                                }
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

               <div className='hidden lg:block lg:col-span-2 bg-gray-200 rounded-lg shadow border border-gray-300 overflow-hidden relative min-h-0 h-full'>
                  {/* 1. Chamada do Componente */}
                  <AerodromoMap
                     aerodromos={filteredAerodromos}
                     selectedAero={selectedAero}
                     resetKey={mapResetKey}
                  />

                  {/* Botão de Reset - sempre visível */}
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

                  {/* 2. Overlay de Informação (Pode ficar aqui no pai ou mover para dentro do componente filho se preferir) */}
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
