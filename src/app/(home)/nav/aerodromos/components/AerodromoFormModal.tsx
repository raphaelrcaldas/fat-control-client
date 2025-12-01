"use client";
import { useState, useEffect } from "react";
import {
   Button,
   Label,
   Modal,
   ModalBody,
   ModalHeader,
   TextInput,
   Checkbox,
} from "flowbite-react";
import { HiShieldCheck } from "react-icons/hi";
import { MdFlight } from "react-icons/md";
import { IoMdSearch } from "react-icons/io";
import { Aerodromo, AerodromoFormData } from "../types";
import { Cidade } from "services/routes/cities";
import { SearchLocal } from "@/components/location/SearchLocal";

interface AerodromoFormModalProps {
   show: boolean;
   editingAerodromo: Aerodromo | null;
   onClose: () => void;
   onSubmit: (data: AerodromoFormData) => void;
}

const initialFormState: AerodromoFormData = {
   nome: "",
   codigo_icao: "",
   codigo_iata: "",
   latitude: 0,
   longitude: 0,
   elevacao: 0,
   codigo_cidade: null,
   cidade_manual: null,
   pais: "Brasil",
   utc: -3,
   base_aerea: null,
};

export default function AerodromoFormModal({
   show,
   editingAerodromo,
   onClose,
   onSubmit,
}: AerodromoFormModalProps) {
   const [formData, setFormData] =
      useState<AerodromoFormData>(initialFormState);
   const [isNacional, setIsNacional] = useState(true);
   const [cidadeSelecionada, setCidadeSelecionada] = useState<Cidade | null>(
      null
   );
   const [showSearchModal, setShowSearchModal] = useState(false);

   useEffect(() => {
      if (editingAerodromo) {
         const { id, cidade, ...rest } = editingAerodromo;
         setFormData(rest);
         setIsNacional(rest.pais === "Brasil");
         setCidadeSelecionada(cidade || null);
      } else {
         setFormData(initialFormState);
         setIsNacional(true);
         setCidadeSelecionada(null);
      }
   }, [editingAerodromo]);

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
      setFormData(initialFormState);
      setIsNacional(true);
      setCidadeSelecionada(null);
   };

   const handleClose = () => {
      setFormData(initialFormState);
      setIsNacional(true);
      setCidadeSelecionada(null);
      onClose();
   };

   const handleNacionalChange = (checked: boolean) => {
      setIsNacional(checked);
      if (checked) {
         // Nacional: define Brasil e limpa cidade_manual
         setFormData({
            ...formData,
            pais: "Brasil",
            cidade_manual: null,
         });
      } else {
         // Internacional: limpa codigo_cidade e cidade selecionada
         setFormData({
            ...formData,
            pais: "",
            codigo_cidade: null,
         });
         setCidadeSelecionada(null);
      }
   };

   const handleCitySelect = (selectedCity: {
      codigo: number;
      nome: string;
      uf: string;
   }) => {
      setFormData({
         ...formData,
         codigo_cidade: selectedCity.codigo,
         cidade_manual: null,
      });
      setCidadeSelecionada(selectedCity);
   };

   return (
      <Modal show={show} onClose={handleClose} size='xl'>
         <ModalHeader>
            {editingAerodromo ? "Editar Aeródromo" : "Novo Aeródromo"}
         </ModalHeader>
         <ModalBody>
            <form
               onSubmit={handleSubmit}
               className='space-y-4'
               autoComplete='off'
            >
               {/* Informações Básicas */}
               <div>
                  <h6 className='flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200'>
                     <MdFlight className='w-5 h-5 text-red-600' />
                     Informações Básicas
                  </h6>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                     <div className='md:col-span-2'>
                        <Label htmlFor='nome'>Nome do Aeródromo *</Label>
                        <TextInput
                           id='nome'
                           required
                           autoComplete='off'
                           value={formData.nome}
                           onChange={(e) =>
                              setFormData({
                                 ...formData,
                                 nome: e.target.value,
                              })
                           }
                           placeholder='Ex: Aeroporto Internacional de Brasília'
                        />
                     </div>
                     <div className='grid grid-cols-3 gap-4 md:col-span-2'>
                        <div>
                           <Label htmlFor='codigo_icao'>Código ICAO *</Label>
                           <TextInput
                              id='codigo_icao'
                              name='codigo_icao_field'
                              required
                              maxLength={4}
                              autoComplete='new-password'
                              placeholder='Ex: SBBR'
                              value={formData.codigo_icao}
                              onChange={(e) =>
                                 setFormData({
                                    ...formData,
                                    codigo_icao: e.target.value.toUpperCase(),
                                 })
                              }
                           />
                        </div>
                        <div>
                           <Label htmlFor='codigo_iata'>Código IATA</Label>
                           <TextInput
                              id='codigo_iata'
                              name='codigo_iata_field'
                              maxLength={3}
                              autoComplete='new-password'
                              placeholder='Ex: BSB'
                              value={formData.codigo_iata || ""}
                              onChange={(e) =>
                                 setFormData({
                                    ...formData,
                                    codigo_iata: e.target.value.toUpperCase(),
                                 })
                              }
                           />
                        </div>
                        <div>
                           <Label htmlFor='utc'>Fuso Horário (UTC) *</Label>
                           <TextInput
                              id='utc'
                              type='number'
                              required
                              autoComplete='off'
                              placeholder='Ex: -3'
                              value={formData.utc}
                              onChange={(e) =>
                                 setFormData({
                                    ...formData,
                                    utc: parseInt(e.target.value) || 0,
                                 })
                              }
                           />
                        </div>
                     </div>
                  </div>
               </div>

               {/* Base Aérea */}
               <div>
                  <h6 className='flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200'>
                     <HiShieldCheck className='w-5 h-5 text-red-600' />
                     Informações da Base Aérea (Opcional)
                  </h6>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                     <div>
                        <Label htmlFor='base_nome'>Nome da Base Aérea</Label>
                        <TextInput
                           id='base_nome'
                           value={formData.base_aerea?.nome || ""}
                           autoComplete='off'
                           onChange={(e) =>
                              setFormData({
                                 ...formData,
                                 base_aerea: {
                                    nome: e.target.value,
                                    sigla: formData.base_aerea?.sigla || "",
                                 },
                              })
                           }
                           placeholder='Ex: Base Aérea de Anápolis'
                        />
                     </div>
                     <div>
                        <Label htmlFor='base_sigla'>Sigla da Base</Label>
                        <TextInput
                           id='base_sigla'
                           maxLength={4}
                           autoComplete='off'
                           value={formData.base_aerea?.sigla || ""}
                           onChange={(e) =>
                              setFormData({
                                 ...formData,
                                 base_aerea: {
                                    nome: formData.base_aerea?.nome || "",
                                    sigla: e.target.value.toUpperCase(),
                                 },
                              })
                           }
                           placeholder='Ex: BAAN'
                        />
                     </div>
                  </div>
               </div>

               {/* Localização */}
               <div>
                  <h6 className='flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200'>
                     <MdFlight className='w-5 h-5 text-red-600' />
                     Localização
                  </h6>

                  {/* Checkbox Aeródromo Nacional */}
                  <div className='mb-4'>
                     <div className='flex items-center gap-2'>
                        <Checkbox
                           id='nacional'
                           checked={isNacional}
                           className='size-5'
                           color='red'
                           onChange={(e) =>
                              handleNacionalChange(e.target.checked)
                           }
                        />
                        <Label htmlFor='nacional' className='cursor-pointer'>
                           Aeródromo Nacional (Brasil)
                        </Label>
                     </div>
                  </div>

                  {/* Se Nacional: Seletor de Cidade */}
                  {isNacional ? (
                     <div className='grid grid-cols-1 gap-4'>
                        <div className='flex flex-row gap-3 justify-between items-center'>
                           {cidadeSelecionada && cidadeSelecionada.nome ? (
                              <div className='flex-1 bg-white border-2 border-green-300 rounded-lg px-4 py-3 shadow-sm'>
                                 <div className='flex items-center gap-2'>
                                    <span className='w-2 h-2 bg-green-500 rounded-full'></span>
                                    <span className='font-semibold text-gray-800 text-base'>
                                       {cidadeSelecionada.nome},{" "}
                                       {cidadeSelecionada.uf}
                                    </span>
                                 </div>
                              </div>
                           ) : (
                              <div className='flex-1 bg-white border-2 border-red-300 rounded-lg px-4 py-3 shadow-sm'>
                                 <div className='flex items-center gap-2'>
                                    <span className='w-2 h-2 bg-red-500 rounded-full'></span>
                                    <span className='text-red-600 text-sm font-medium'>
                                       Nenhuma localidade selecionada
                                    </span>
                                 </div>
                              </div>
                           )}
                           <Button
                              size='lg'
                              pill
                              onClick={() => setShowSearchModal(true)}
                              color='red'
                              className='shadow-md hover:shadow-lg transition-shadow'
                           >
                              <IoMdSearch className='size-5' />
                           </Button>
                        </div>

                        <SearchLocal
                           show={showSearchModal}
                           setShow={setShowSearchModal}
                           setLocal={handleCitySelect}
                        />
                     </div>
                  ) : (
                     /* Se Internacional: Campos manuais */
                     <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                           <Label htmlFor='pais'>País *</Label>
                           <TextInput
                              id='pais'
                              required
                              value={formData.pais}
                              autoComplete='off'
                              onChange={(e) =>
                                 setFormData({
                                    ...formData,
                                    pais: e.target.value,
                                 })
                              }
                              placeholder='Ex: Estados Unidos'
                           />
                        </div>
                        <div>
                           <Label htmlFor='cidade_manual'>Cidade *</Label>
                           <TextInput
                              id='cidade_manual'
                              required
                              value={formData.cidade_manual || ""}
                              autoComplete='off'
                              onChange={(e) =>
                                 setFormData({
                                    ...formData,
                                    cidade_manual: e.target.value,
                                 })
                              }
                              placeholder='Ex: Los Angeles, CA'
                           />
                        </div>
                     </div>
                  )}
               </div>

               {/* Coordenadas */}
               <div>
                  <h6 className='text-sm font-semibold text-gray-900'>
                     Coordenadas Geográficas
                  </h6>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                     <div>
                        <Label htmlFor='latitude'>Latitude *</Label>
                        <TextInput
                           id='latitude'
                           type='number'
                           step='0.000001'
                           autoComplete='off'
                           required
                           placeholder='Ex: -15.869722'
                           value={formData.latitude}
                           onChange={(e) =>
                              setFormData({
                                 ...formData,
                                 latitude: parseFloat(e.target.value) || 0,
                              })
                           }
                        />
                     </div>
                     <div>
                        <Label htmlFor='longitude'>Longitude *</Label>
                        <TextInput
                           id='longitude'
                           type='number'
                           step='0.000001'
                           autoComplete='off'
                           required
                           placeholder='Ex: -47.920556'
                           value={formData.longitude}
                           onChange={(e) =>
                              setFormData({
                                 ...formData,
                                 longitude: parseFloat(e.target.value) || 0,
                              })
                           }
                        />
                     </div>
                     <div>
                        <Label htmlFor='elevacao'>Elevação (pés) *</Label>
                        <TextInput
                           id='elevacao'
                           type='number'
                           autoComplete='off'
                           required
                           placeholder='Ex: 3497'
                           value={formData.elevacao}
                           onChange={(e) =>
                              setFormData({
                                 ...formData,
                                 elevacao: parseInt(e.target.value) || 0,
                              })
                           }
                        />
                     </div>
                  </div>
               </div>

               {/* Botões */}
               <div className='flex justify-end gap-3 pt-4 border-t border-gray-200'>
                  <Button color='gray' onClick={handleClose}>
                     Cancelar
                  </Button>
                  <Button color='red' type='submit'>
                     {editingAerodromo
                        ? "Salvar Alterações"
                        : "Cadastrar Aeródromo"}
                  </Button>
               </div>
            </form>
         </ModalBody>
      </Modal>
   );
}
