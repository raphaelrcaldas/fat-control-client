"use client";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import CoordinateInput from "../../CoordinateInput";
import {
   aerodromoSchema,
   AerodromoFormOutput,
   AerodromoFormValues,
} from "../schema";

interface AerodromoFormModalProps {
   show: boolean;
   editingAerodromo: Aerodromo | null;
   onClose: () => void;
   onSubmit: (data: AerodromoFormData) => void;
}

const initialValues: AerodromoFormValues = {
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

const FieldError = ({ message }: { message?: string }) =>
   message ? <p className="mt-1 text-xs text-red-600">{message}</p> : null;

export default function AerodromoFormModal({
   show,
   editingAerodromo,
   onClose,
   onSubmit,
}: AerodromoFormModalProps) {
   const [cidadeSelecionada, setCidadeSelecionada] = useState<Cidade | null>(
      null
   );
   const [showSearchModal, setShowSearchModal] = useState(false);

   const {
      control,
      register,
      handleSubmit,
      reset,
      watch,
      setValue,
      formState: { errors, isSubmitting },
   } = useForm<AerodromoFormValues, unknown, AerodromoFormOutput>({
      resolver: zodResolver(aerodromoSchema),
      defaultValues: initialValues,
      mode: "onBlur",
   });

   const pais = watch("pais");
   const isNacional = pais === "Brasil";
   const baseAereaValue = watch("base_aerea");

   useEffect(() => {
      if (editingAerodromo) {
         const { id, cidade, ...rest } = editingAerodromo;
         reset({
            ...rest,
            codigo_iata: rest.codigo_iata ?? "",
         });
         setCidadeSelecionada(cidade || null);
      } else {
         reset(initialValues);
         setCidadeSelecionada(null);
      }
   }, [editingAerodromo, reset]);

   const submit = handleSubmit((data) => {
      onSubmit(data as AerodromoFormData);
      reset(initialValues);
      setCidadeSelecionada(null);
   });

   const handleClose = () => {
      reset(initialValues);
      setCidadeSelecionada(null);
      onClose();
   };

   const handleNacionalChange = (checked: boolean) => {
      if (checked) {
         setValue("pais", "Brasil", { shouldValidate: true });
         setValue("cidade_manual", null, { shouldValidate: true });
      } else {
         setValue("pais", "", { shouldValidate: true });
         setValue("codigo_cidade", null, { shouldValidate: true });
         setCidadeSelecionada(null);
      }
   };

   const handleCitySelect = (selectedCity: {
      codigo: number;
      nome: string;
      uf: string;
   }) => {
      setValue("codigo_cidade", selectedCity.codigo, { shouldValidate: true });
      setValue("cidade_manual", null);
      setCidadeSelecionada(selectedCity);
   };

   const updateBaseAerea = (field: "nome" | "sigla", value: string) => {
      const current = baseAereaValue ?? { nome: "", sigla: "" };
      const next = { ...current, [field]: value };
      const nextOrNull = next.nome === "" && next.sigla === "" ? null : next;
      setValue("base_aerea", nextOrNull, { shouldValidate: true });
   };

   const baseAereaErrors = errors.base_aerea as
      | { nome?: { message?: string }; sigla?: { message?: string } }
      | undefined;

   return (
      <Modal show={show} onClose={handleClose} size="xl" dismissible>
         <ModalHeader>
            {editingAerodromo ? "Editar Aeródromo" : "Novo Aeródromo"}
         </ModalHeader>
         <ModalBody>
            <form onSubmit={submit} className="space-y-4" autoComplete="off">
               {/* Informações Básicas */}
               <div>
                  <h6 className="mb-3 flex items-center gap-2 border-b border-gray-200 pb-2 text-sm font-semibold text-gray-900">
                     <MdFlight className="h-5 w-5 text-red-600" />
                     Informações Básicas
                  </h6>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                     <div className="md:col-span-2">
                        <Label htmlFor="nome">Nome do Aeródromo *</Label>
                        <TextInput
                           id="nome"
                           autoComplete="off"
                           placeholder="Ex: Aeroporto Internacional de Brasília"
                           color={errors.nome ? "failure" : undefined}
                           {...register("nome")}
                        />
                        <FieldError message={errors.nome?.message} />
                     </div>
                     <div className="grid grid-cols-3 gap-4 md:col-span-2">
                        <div>
                           <Label htmlFor="codigo_icao">Código ICAO *</Label>
                           <TextInput
                              id="codigo_icao"
                              name="codigo_icao_field"
                              maxLength={4}
                              autoComplete="new-password"
                              placeholder="Ex: SBBR"
                              color={errors.codigo_icao ? "failure" : undefined}
                              {...register("codigo_icao", {
                                 setValueAs: (v: string) =>
                                    (v ?? "").toUpperCase(),
                              })}
                           />
                           <FieldError message={errors.codigo_icao?.message} />
                        </div>
                        <div>
                           <Label htmlFor="codigo_iata">Código IATA</Label>
                           <TextInput
                              id="codigo_iata"
                              name="codigo_iata_field"
                              maxLength={3}
                              autoComplete="new-password"
                              placeholder="Ex: BSB"
                              color={errors.codigo_iata ? "failure" : undefined}
                              {...register("codigo_iata", {
                                 setValueAs: (v: string) =>
                                    (v ?? "").toUpperCase(),
                              })}
                           />
                           <FieldError message={errors.codigo_iata?.message} />
                        </div>
                        <div>
                           <Label htmlFor="utc">Fuso Horário (UTC) *</Label>
                           <TextInput
                              id="utc"
                              type="number"
                              autoComplete="off"
                              placeholder="Ex: -3"
                              color={errors.utc ? "failure" : undefined}
                              {...register("utc", { valueAsNumber: true })}
                           />
                           <FieldError message={errors.utc?.message} />
                        </div>
                     </div>
                  </div>
               </div>

               {/* Base Aérea */}
               <div>
                  <h6 className="mb-3 flex items-center gap-2 border-b border-gray-200 pb-2 text-sm font-semibold text-gray-900">
                     <HiShieldCheck className="h-5 w-5 text-red-600" />
                     Informações da Base Aérea (Opcional)
                  </h6>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                     <div>
                        <Label htmlFor="base_nome">Nome da Base Aérea</Label>
                        <TextInput
                           id="base_nome"
                           autoComplete="off"
                           value={baseAereaValue?.nome ?? ""}
                           color={baseAereaErrors?.nome ? "failure" : undefined}
                           onChange={(e) =>
                              updateBaseAerea("nome", e.target.value)
                           }
                           placeholder="Ex: Base Aérea de Anápolis"
                        />
                        <FieldError message={baseAereaErrors?.nome?.message} />
                     </div>
                     <div>
                        <Label htmlFor="base_sigla">Sigla da Base</Label>
                        <TextInput
                           id="base_sigla"
                           maxLength={4}
                           autoComplete="off"
                           value={baseAereaValue?.sigla ?? ""}
                           color={baseAereaErrors?.sigla ? "failure" : undefined}
                           onChange={(e) =>
                              updateBaseAerea(
                                 "sigla",
                                 e.target.value.toUpperCase()
                              )
                           }
                           placeholder="Ex: BAAN"
                        />
                        <FieldError
                           message={baseAereaErrors?.sigla?.message}
                        />
                     </div>
                  </div>
               </div>

               {/* Localização */}
               <div>
                  <h6 className="mb-3 flex items-center gap-2 border-b border-gray-200 pb-2 text-sm font-semibold text-gray-900">
                     <MdFlight className="h-5 w-5 text-red-600" />
                     Localização
                  </h6>

                  <div className="mb-4">
                     <div className="flex items-center gap-2">
                        <Checkbox
                           id="nacional"
                           checked={isNacional}
                           className="size-5"
                           color="red"
                           onChange={(e) =>
                              handleNacionalChange(e.target.checked)
                           }
                        />
                        <Label htmlFor="nacional" className="cursor-pointer">
                           Aeródromo Nacional (Brasil)
                        </Label>
                     </div>
                  </div>

                  {isNacional ? (
                     <div className="grid grid-cols-1 gap-4">
                        <div className="flex flex-row items-center justify-between gap-3">
                           {cidadeSelecionada && cidadeSelecionada.nome ? (
                              <div className="flex-1 rounded-lg border-2 border-green-300 bg-white px-4 py-3 shadow-sm">
                                 <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                    <span className="text-base font-semibold text-gray-800">
                                       {cidadeSelecionada.nome},{" "}
                                       {cidadeSelecionada.uf}
                                    </span>
                                 </div>
                              </div>
                           ) : (
                              <div className="flex-1 rounded-lg border-2 border-red-300 bg-white px-4 py-3 shadow-sm">
                                 <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-red-500"></span>
                                    <span className="text-sm font-medium text-red-600">
                                       Nenhuma localidade selecionada
                                    </span>
                                 </div>
                              </div>
                           )}
                           <Button
                              size="lg"
                              pill
                              type="button"
                              onClick={() => setShowSearchModal(true)}
                              color="red"
                              className="shadow-md transition-shadow hover:shadow-lg"
                           >
                              <IoMdSearch className="size-5" />
                           </Button>
                        </div>
                        <FieldError message={errors.codigo_cidade?.message} />

                        <SearchLocal
                           show={showSearchModal}
                           setShow={setShowSearchModal}
                           setLocal={handleCitySelect}
                        />
                     </div>
                  ) : (
                     <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                           <Label htmlFor="pais">País *</Label>
                           <TextInput
                              id="pais"
                              autoComplete="off"
                              placeholder="Ex: Estados Unidos"
                              color={errors.pais ? "failure" : undefined}
                              {...register("pais")}
                           />
                           <FieldError message={errors.pais?.message} />
                        </div>
                        <div>
                           <Label htmlFor="cidade_manual">Cidade *</Label>
                           <TextInput
                              id="cidade_manual"
                              autoComplete="off"
                              placeholder="Ex: Los Angeles, CA"
                              color={
                                 errors.cidade_manual ? "failure" : undefined
                              }
                              {...register("cidade_manual", {
                                 setValueAs: (v: string) =>
                                    v && v.trim() !== "" ? v : null,
                              })}
                           />
                           <FieldError
                              message={errors.cidade_manual?.message}
                           />
                        </div>
                     </div>
                  )}
               </div>

               {/* Coordenadas */}
               <div>
                  <h6 className="mb-3 text-sm font-semibold text-gray-900">
                     Coordenadas Geográficas
                  </h6>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
                     <Controller
                        control={control}
                        name="latitude"
                        render={({ field }) => (
                           <div>
                              <CoordinateInput
                                 id="latitude"
                                 label="Latitude"
                                 type="latitude"
                                 value={field.value}
                                 onChange={field.onChange}
                                 required
                              />
                              <FieldError message={errors.latitude?.message} />
                           </div>
                        )}
                     />
                     <Controller
                        control={control}
                        name="longitude"
                        render={({ field }) => (
                           <div>
                              <CoordinateInput
                                 id="longitude"
                                 label="Longitude"
                                 type="longitude"
                                 value={field.value}
                                 onChange={field.onChange}
                                 required
                              />
                              <FieldError message={errors.longitude?.message} />
                           </div>
                        )}
                     />
                     <div>
                        <Label htmlFor="elevacao">Elevação (pés) *</Label>
                        <TextInput
                           id="elevacao"
                           type="number"
                           autoComplete="off"
                           placeholder="Ex: 3497"
                           color={errors.elevacao ? "failure" : undefined}
                           {...register("elevacao", { valueAsNumber: true })}
                        />
                        <FieldError message={errors.elevacao?.message} />
                     </div>
                  </div>
               </div>

               <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                  <Button color="gray" type="button" onClick={handleClose}>
                     Cancelar
                  </Button>
                  <Button color="red" type="submit" disabled={isSubmitting}>
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
