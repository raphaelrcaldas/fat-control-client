"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
   Modal,
   ModalHeader,
   ModalBody,
   ModalFooter,
   Button,
   Label,
   TextInput,
   HelperText,
   Spinner,
} from "flowbite-react";
import { HiLocationMarker, HiClock, HiLightningBolt } from "react-icons/hi";
import { HiPaperAirplane } from "react-icons/hi2";
import clsx from "clsx";
import type { EtapaOut } from "services/routes/om/ordens";
import {
   extractDate,
   extractTime,
   toIsoDatetime,
   minutesToTime,
   calcularTempoVooMinutos,
} from "utils/dateHandler";
import { createNextEtapa } from "./utils/ordemUtils";
import { useRouteSuggestion } from "@/hooks/queries";

interface EtapaModalProps {
   isOpen: boolean;
   onClose: () => void;
   onSave: (etapa: EtapaOut) => void;
   etapa: EtapaOut | null; // null = nova etapa
   etapaIndex: number | null; // null = adicionar, >= 0 = editar
   referenceEtapa?: EtapaOut; // Etapa de referência para pré-preencher nova etapa
}

// Arredonda hora para múltiplo de 5 minutos
const roundTimeToFiveMinutes = (time: string): string => {
   if (!time) return time;
   const [hours, minutes] = time.split(":").map(Number);
   const roundedMinutes = Math.round(minutes / 5) * 5;
   const finalMinutes = roundedMinutes === 60 ? 0 : roundedMinutes;
   const finalHours = roundedMinutes === 60 ? (hours + 1) % 24 : hours;
   return `${String(finalHours).padStart(2, "0")}:${String(finalMinutes).padStart(2, "0")}`;
};

export function EtapaModal({
   isOpen,
   onClose,
   onSave,
   etapa,
   etapaIndex,
   referenceEtapa,
}: EtapaModalProps) {
   const isEditing = etapaIndex !== null && etapa !== null;
   const modalTitle = isEditing
      ? `Editar Etapa #${etapaIndex + 1}`
      : "Nova Etapa";

   // Estado local do formulário
   const [formData, setFormData] = useState<Partial<EtapaOut>>({});

   // Inicializar formulário quando modal abre
   useEffect(() => {
      if (!isOpen) return;

      if (isEditing && etapa) {
         // Modo edição: carregar dados da etapa
         setFormData({ ...etapa });
      } else if (referenceEtapa) {
         // Modo adicionar: pré-preencher com dados da etapa anterior
         setFormData(createNextEtapa(referenceEtapa));
      } else {
         // Nova etapa sem referência
         setFormData({
            dt_dep: "",
            origem: "",
            dt_arr: "",
            dest: "",
            alternativa: "",
            tvoo_alt: 0,
            qtd_comb: 0,
            esf_aer: "",
         });
      }
   }, [isOpen, isEditing, etapa, referenceEtapa]);

   // Extrair data e hora dos campos ISO
   const dataDecolagem = extractDate(formData.dt_dep || "");
   const horaDecolagem = extractTime(formData.dt_dep || "");
   const dataPouso = extractDate(formData.dt_arr || "");
   const horaPouso = extractTime(formData.dt_arr || "");
   const tempoVooAlternativa = minutesToTime(formData.tvoo_alt || 0);

   // Tempo de voo calculado
   const tempoVoo = useMemo(() => {
      if (!formData.dt_dep || !formData.dt_arr) return "00:00";
      const minutes = calcularTempoVooMinutos(formData.dt_dep, formData.dt_arr);
      return minutesToTime(minutes);
   }, [formData.dt_dep, formData.dt_arr]);

   // Busca sugestão de rota baseada em missões anteriores
   const origem = formData.origem || "";
   const dest = formData.dest || "";
   const { data: routeSuggestion, isFetching: isLoadingRoute } =
      useRouteSuggestion(origem, dest);

   // Flag para indicar que sugestão foi aplicada (para exibir mensagem)
   const [suggestionApplied, setSuggestionApplied] = useState(false);

   // Resetar estado quando origem ou dest mudam
   const prevRouteRef = useRef<string>("");
   useEffect(() => {
      const routeKey = `${origem}-${dest}`;
      if (prevRouteRef.current !== routeKey) {
         prevRouteRef.current = routeKey;
         setSuggestionApplied(false);
      }
   }, [origem, dest]);

   // Auto-preencher quando encontrar sugestão de rota
   useEffect(() => {
      if (isEditing) return;
      if (origem.length !== 4 || dest.length !== 4) return;

      // Se não há sugestão, manter suggestionApplied como false
      if (!routeSuggestion) {
         return;
      }

      // Aplicar sugestão
      setSuggestionApplied(true);

      // Calcular dt_arr baseado no tempo de voo sugerido
      setFormData((prev) => {
         let newDtArr = prev.dt_arr;
         if (prev.dt_dep && routeSuggestion.tvoo_etp > 0) {
            const depDate = new Date(prev.dt_dep);
            const arrDate = new Date(
               depDate.getTime() + routeSuggestion.tvoo_etp * 60 * 1000
            );
            newDtArr = arrDate.toISOString();
         }

         return {
            ...prev,
            alternativa: routeSuggestion.alternativa,
            tvoo_alt: routeSuggestion.tvoo_alt,
            qtd_comb: routeSuggestion.qtd_comb,
            dt_arr: newDtArr,
         };
      });
   }, [routeSuggestion, isEditing, origem, dest]);

   // Resetar refs e flags quando modal fecha
   useEffect(() => {
      if (!isOpen) {
         prevRouteRef.current = "";
         setSuggestionApplied(false);
      }
   }, [isOpen]);

   // Ref para rastrear o último ajuste e evitar loop infinito
   const lastAdjustmentRef = useRef<string>("");

   // Auto-ajuste: quando data decolagem > data pouso, ajustar data pouso
   useEffect(() => {
      if (!dataDecolagem || !dataPouso) return;

      if (dataDecolagem > dataPouso) {
         const adjustmentKey = `data-${dataDecolagem}`;
         if (lastAdjustmentRef.current !== adjustmentKey) {
            lastAdjustmentRef.current = adjustmentKey;
            const newIsoDatetime = toIsoDatetime(
               dataDecolagem,
               horaPouso || "00:00"
            );
            setFormData((prev) => ({ ...prev, dt_arr: newIsoDatetime }));
         }
      } else {
         lastAdjustmentRef.current = "";
      }
   }, [dataDecolagem, dataPouso, horaPouso]);

   // Auto-ajuste: se mesma data mas hora decolagem >= hora pouso
   useEffect(() => {
      if (!dataDecolagem || !horaDecolagem || !dataPouso || !horaPouso) return;

      if (dataDecolagem === dataPouso && horaDecolagem >= horaPouso) {
         const [hours, minutes] = horaDecolagem.split(":").map(Number);
         const totalMinutes = hours * 60 + minutes + 5;
         const newHours = Math.floor(totalMinutes / 60) % 24;
         const newMinutes = totalMinutes % 60;
         const newHoraPouso = `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(2, "0")}`;

         const adjustmentKey = `hora-${newHoraPouso}`;
         if (lastAdjustmentRef.current !== adjustmentKey) {
            lastAdjustmentRef.current = adjustmentKey;
            const newIsoDatetime = toIsoDatetime(dataPouso, newHoraPouso);
            setFormData((prev) => ({ ...prev, dt_arr: newIsoDatetime }));
         }
      } else {
         lastAdjustmentRef.current = "";
      }
   }, [dataDecolagem, horaDecolagem, dataPouso, horaPouso]);

   // Validações
   const erroDataHora = useMemo(() => {
      if (!formData.dt_dep || !formData.dt_arr) return null;
      const decolagem = new Date(formData.dt_dep);
      const pouso = new Date(formData.dt_arr);
      if (decolagem >= pouso) {
         return "A data/hora de decolagem deve ser anterior a data/hora de pouso.";
      }
      return null;
   }, [formData.dt_dep, formData.dt_arr]);

   const erroTempoVooEtapa = useMemo(() => {
      if (!formData.dt_dep || !formData.dt_arr) return null;
      const minutes = calcularTempoVooMinutos(formData.dt_dep, formData.dt_arr);
      if (minutes > 0 && minutes < 5) {
         return `Tempo de voo mínimo é 5 minutos (calculado: ${minutes} min).`;
      }
      return null;
   }, [formData.dt_dep, formData.dt_arr]);

   const erroTempoVooAlternativa = useMemo(() => {
      if (!formData.tvoo_alt || formData.tvoo_alt === 0) return null;
      if (formData.tvoo_alt > 0 && formData.tvoo_alt < 5) {
         return "Tempo de voo alternativa mínimo é 5 minutos.";
      }
      return null;
   }, [formData.tvoo_alt]);

   // Validação de campos obrigatórios
   const camposObrigatorios = useMemo(() => {
      const erros: string[] = [];
      if (!formData.dt_dep) erros.push("Data/hora de decolagem");
      if (!formData.dt_arr) erros.push("Data/hora de pouso");
      if (!formData.dest) erros.push("Destino");
      if (!formData.alternativa) erros.push("Alternativa");
      if (!formData.tvoo_alt || formData.tvoo_alt === 0)
         erros.push("Tempo de voo alternativa");
      if (!formData.qtd_comb || formData.qtd_comb === 0)
         erros.push("Quantidade de combustível");
      return erros;
   }, [
      formData.dt_dep,
      formData.dt_arr,
      formData.dest,
      formData.alternativa,
      formData.tvoo_alt,
      formData.qtd_comb,
   ]);

   const hasValidationErrors = !!(
      erroDataHora ||
      erroTempoVooEtapa ||
      erroTempoVooAlternativa
   );

   const hasRequiredFieldErrors = camposObrigatorios.length > 0;

   const cannotSave = hasValidationErrors || hasRequiredFieldErrors;

   // Handlers
   const updateDateTime = useCallback(
      (field: "dt_dep" | "dt_arr", date: string, time: string) => {
         const isoDatetime = toIsoDatetime(date, time);
         setFormData((prev) => ({ ...prev, [field]: isoDatetime }));
      },
      []
   );

   const handleSave = () => {
      if (cannotSave) return;
      onSave(formData as EtapaOut);
      onClose();
   };

   const inputBaseClass =
      "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-transparent focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50";

   return (
      <Modal show={isOpen} onClose={onClose} dismissible size="4xl">
         <ModalHeader>
            <div className="flex items-center gap-2">
               <HiPaperAirplane className="h-5 w-5 text-amber-500" />
               {modalTitle}
            </div>
         </ModalHeader>

         <ModalBody>
            <div className="space-y-6">
               {/* Linha 1: Decolagem e Pouso */}
               <div className="grid grid-cols-2 gap-3">
                  {/* Grupo Decolagem */}
                  <div className="rounded-xl border border-blue-200 bg-blue-50/30 p-4">
                     <div className="mb-4 flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                           1
                        </span>
                        <h4 className="text-sm font-semibold tracking-wide text-blue-700 uppercase">
                           Decolagem
                        </h4>
                     </div>
                     <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-2">
                           <Label
                              htmlFor="dt_dep_date"
                              className="mb-2 block text-xs font-medium text-gray-600"
                           >
                              Data
                           </Label>
                           <input
                              type="date"
                              id="dt_dep_date"
                              value={dataDecolagem}
                              onChange={(e) =>
                                 updateDateTime(
                                    "dt_dep",
                                    e.target.value,
                                    horaDecolagem || "00:00"
                                 )
                              }
                              className={clsx(
                                 inputBaseClass,
                                 "border-gray-300 focus:ring-blue-500"
                              )}
                           />
                        </div>
                        <div>
                           <Label
                              htmlFor="dt_dep_time"
                              className="mb-2 block text-xs font-medium text-gray-600"
                           >
                              Hora (Z)
                           </Label>
                           <input
                              type="time"
                              id="dt_dep_time"
                              value={horaDecolagem}
                              onChange={(e) => {
                                 const rounded = roundTimeToFiveMinutes(
                                    e.target.value
                                 );
                                 updateDateTime(
                                    "dt_dep",
                                    dataDecolagem,
                                    rounded
                                 );
                              }}
                              step="300"
                              className={clsx(
                                 inputBaseClass,
                                 "border-gray-300 focus:ring-blue-500"
                              )}
                           />
                        </div>
                        <div>
                           <Label
                              htmlFor="origem"
                              className="mb-2 block text-xs font-medium text-gray-600"
                           >
                              Origem
                           </Label>
                           <input
                              type="text"
                              id="origem"
                              value={formData.origem || ""}
                              onChange={(e) => {
                                 const value = e.target.value.replace(
                                    /[^a-zA-Z]/g,
                                    ""
                                 );
                                 setFormData((prev) => ({
                                    ...prev,
                                    origem: value.toUpperCase(),
                                 }));
                              }}
                              placeholder="SBGL"
                              maxLength={4}
                              className={clsx(
                                 inputBaseClass,
                                 "border-gray-300 text-center font-mono uppercase placeholder:text-gray-400 focus:ring-blue-500"
                              )}
                           />
                        </div>
                     </div>
                  </div>

                  {/* Grupo Pouso */}
                  <div className="rounded-xl border border-green-200 bg-green-50/30 p-4">
                     <div className="mb-4 flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">
                           2
                        </span>
                        <h4 className="text-sm font-semibold tracking-wide text-green-700 uppercase">
                           Pouso
                        </h4>
                     </div>
                     <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-2">
                           <Label
                              htmlFor="dt_arr_date"
                              className="mb-2 block text-xs font-medium text-gray-600"
                           >
                              Data
                           </Label>
                           <input
                              type="date"
                              id="dt_arr_date"
                              value={dataPouso}
                              min={dataDecolagem}
                              onChange={(e) =>
                                 updateDateTime(
                                    "dt_arr",
                                    e.target.value,
                                    horaPouso || "00:00"
                                 )
                              }
                              className={clsx(
                                 inputBaseClass,
                                 !formData.dt_arr
                                    ? "border-red-300 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-green-500"
                              )}
                           />
                           {!formData.dt_arr && (
                              <span className="mt-1 text-xs text-red-500">
                                 Obrigatório
                              </span>
                           )}
                        </div>
                        <div>
                           <Label
                              htmlFor="dt_arr_time"
                              className="mb-2 block text-xs font-medium text-gray-600"
                           >
                              Hora (Z)
                           </Label>
                           <input
                              type="time"
                              id="dt_arr_time"
                              value={horaPouso}
                              onChange={(e) => {
                                 const rounded = roundTimeToFiveMinutes(
                                    e.target.value
                                 );
                                 updateDateTime("dt_arr", dataPouso, rounded);
                              }}
                              step="300"
                              className={clsx(
                                 inputBaseClass,
                                 "border-gray-300 focus:ring-green-500"
                              )}
                           />
                        </div>
                        <div>
                           <Label
                              htmlFor="dest"
                              className="mb-2 block text-xs font-medium text-gray-600"
                           >
                              Destino
                           </Label>
                           <input
                              type="text"
                              id="dest"
                              value={formData.dest || ""}
                              onChange={(e) => {
                                 const value = e.target.value.replace(
                                    /[^a-zA-Z]/g,
                                    ""
                                 );
                                 setFormData((prev) => ({
                                    ...prev,
                                    dest: value.toUpperCase(),
                                 }));
                              }}
                              placeholder="SBBR"
                              maxLength={4}
                              className={clsx(
                                 inputBaseClass,
                                 !formData.dest
                                    ? "border-red-300 text-center font-mono uppercase placeholder:text-gray-400 focus:ring-red-500"
                                    : "border-gray-300 text-center font-mono uppercase placeholder:text-gray-400 focus:ring-green-500"
                              )}
                           />
                           {!formData.dest && (
                              <span className="mt-1 text-xs text-red-500">
                                 Obrigatório
                              </span>
                           )}
                        </div>
                     </div>
                  </div>
               </div>

               {/* Tempo de Voo Calculado + Status da Busca de Rota */}
               <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-gray-50 px-6 py-2">
                     <HiClock className="h-5 w-5 text-gray-500" />
                     <span className="text-sm font-medium text-gray-600">
                        Tempo de Voo:
                     </span>
                     <span className="font-mono text-lg font-bold text-gray-900">
                        {tempoVoo}
                     </span>
                  </div>

                  {/* Indicador de busca de rota */}
                  {isLoadingRoute && (
                     <div className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2">
                        <Spinner size="sm" color="info" />
                        <span className="text-sm text-blue-600">
                           Buscando dados da rota...
                        </span>
                     </div>
                  )}

                  {/* Indicador de sugestão aplicada */}
                  {!isLoadingRoute && suggestionApplied && !isEditing && (
                     <div className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2">
                        <HiLightningBolt className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600">
                           Sugestão baseada em rota anterior
                        </span>
                     </div>
                  )}

                  {/* Indicador de rota não encontrada */}
                  {!isLoadingRoute &&
                     !suggestionApplied &&
                     !isEditing &&
                     origem.length === 4 &&
                     dest.length === 4 && (
                        <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2">
                           <span className="text-sm text-gray-500">
                              Nenhuma sugestão encontrada para esta rota
                           </span>
                        </div>
                     )}
               </div>

               {/* Linha 2: Alternativa, Combustível, Esforço Aéreo */}
               <div className="grid grid-cols-3 gap-3">
                  {/* Alternativa */}
                  <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-4">
                     <div className="mb-4 flex items-center gap-2">
                        <HiLocationMarker className="h-5 w-5 text-amber-500" />
                        <h4 className="text-sm font-semibold tracking-wide text-amber-700 uppercase">
                           Alternativa
                        </h4>
                     </div>
                     <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                           <Label
                              htmlFor="alternativa"
                              className="mb-2 block text-xs font-medium text-gray-600"
                           >
                              ICAO <span className="text-red-500">*</span>
                           </Label>
                           <input
                              type="text"
                              id="alternativa"
                              value={formData.alternativa || ""}
                              onChange={(e) => {
                                 const value = e.target.value.replace(
                                    /[^a-zA-Z]/g,
                                    ""
                                 );
                                 setFormData((prev) => ({
                                    ...prev,
                                    alternativa: value.toUpperCase(),
                                 }));
                              }}
                              placeholder="SBSP"
                              maxLength={4}
                              className={clsx(
                                 inputBaseClass,
                                 !formData.alternativa
                                    ? "border-red-300 text-center font-mono uppercase placeholder:text-gray-400 focus:ring-red-500"
                                    : "border-gray-300 text-center font-mono uppercase placeholder:text-gray-400 focus:ring-amber-500"
                              )}
                           />
                           {!formData.alternativa && (
                              <span className="mt-1 text-xs text-red-500">
                                 Obrigatório
                              </span>
                           )}
                        </div>
                        <div>
                           <Label
                              htmlFor="tvoo_alt"
                              className="mb-2 block text-xs font-medium text-gray-600"
                           >
                              T. Voo <span className="text-red-500">*</span>
                           </Label>
                           <input
                              type="time"
                              id="tvoo_alt"
                              value={tempoVooAlternativa}
                              onChange={(e) => {
                                 const rounded = roundTimeToFiveMinutes(
                                    e.target.value
                                 );
                                 const [hours, minutes] = rounded
                                    .split(":")
                                    .map(Number);
                                 const totalMinutes =
                                    (hours || 0) * 60 + (minutes || 0);
                                 setFormData((prev) => ({
                                    ...prev,
                                    tvoo_alt: totalMinutes,
                                 }));
                              }}
                              step="300"
                              className={clsx(
                                 inputBaseClass,
                                 !formData.tvoo_alt || formData.tvoo_alt === 0
                                    ? "border-red-300 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-amber-500"
                              )}
                           />
                           {(!formData.tvoo_alt || formData.tvoo_alt === 0) && (
                              <span className="mt-1 text-xs text-red-500">
                                 Obrigatório
                              </span>
                           )}
                           {erroTempoVooAlternativa && (
                              <span className="mt-1 text-xs text-red-500">
                                 {erroTempoVooAlternativa}
                              </span>
                           )}
                        </div>
                     </div>
                  </div>

                  {/* Combustível */}
                  <div className="rounded-xl border border-purple-200 bg-purple-50/30 p-4">
                     <div className="mb-4 flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded bg-purple-500 text-xs font-bold text-white">
                           T
                        </span>
                        <h4 className="text-sm font-semibold tracking-wide text-purple-700 uppercase">
                           Combustível
                        </h4>
                     </div>
                     <div>
                        <Label
                           htmlFor="qtd_comb"
                           className="mb-2 block text-xs font-medium text-gray-600"
                        >
                           Quantidade (Toneladas)
                        </Label>
                        <input
                           type="number"
                           id="qtd_comb"
                           min="1"
                           max="30"
                           value={formData.qtd_comb || ""}
                           onChange={(e) => {
                              const value = e.target.value.replace(
                                 /[^0-9]/g,
                                 ""
                              );
                              if (value === "" || parseInt(value, 10) > 0) {
                                 setFormData((prev) => ({
                                    ...prev,
                                    qtd_comb: value ? parseInt(value, 10) : 0,
                                 }));
                              }
                           }}
                           placeholder="15"
                           className={clsx(
                              inputBaseClass,
                              !formData.qtd_comb || formData.qtd_comb === 0
                                 ? "border-red-300 text-center font-mono placeholder:text-gray-400 focus:ring-red-500"
                                 : "border-gray-300 text-center font-mono placeholder:text-gray-400 focus:ring-purple-500"
                           )}
                        />
                        {(!formData.qtd_comb || formData.qtd_comb === 0) && (
                           <span className="mt-1 text-xs text-red-500">
                              Obrigatório
                           </span>
                        )}
                     </div>
                  </div>

                  {/* Esforço Aéreo */}
                  <div className="rounded-xl border border-red-200 bg-red-50/30 p-4">
                     <div className="mb-4 flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                           E
                        </span>
                        <h4 className="text-sm font-semibold tracking-wide text-red-700 uppercase">
                           Esforço Aéreo
                        </h4>
                     </div>
                     <div>
                        <Label
                           htmlFor="esf_aer"
                           className="mb-2 block text-xs font-medium text-gray-600"
                        >
                           Descrição
                        </Label>
                        <input
                           type="text"
                           id="esf_aer"
                           value={formData.esf_aer || ""}
                           onChange={(e) =>
                              setFormData((prev) => ({
                                 ...prev,
                                 esf_aer: e.target.value.toUpperCase(),
                              }))
                           }
                           placeholder="ESFORÇO ALOCADO"
                           className={clsx(
                              inputBaseClass,
                              "border-gray-300 uppercase placeholder:text-gray-400 focus:ring-red-500"
                           )}
                        />
                     </div>
                  </div>
               </div>

               {/* Erros de Validação de Data/Hora */}
               {erroDataHora && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                     <span className="text-sm text-red-600">
                        {erroDataHora}
                     </span>
                  </div>
               )}
               {erroTempoVooEtapa && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                     <span className="text-sm text-red-600">
                        {erroTempoVooEtapa}
                     </span>
                  </div>
               )}
            </div>
         </ModalBody>

         <ModalFooter>
            <div className="flex w-full justify-end gap-3">
               <Button color="gray" onClick={onClose}>
                  Cancelar
               </Button>
               <Button color="red" onClick={handleSave} disabled={cannotSave}>
                  {isEditing ? "Salvar Alterações" : "Adicionar Etapa"}
               </Button>
            </div>
         </ModalFooter>
      </Modal>
   );
}
