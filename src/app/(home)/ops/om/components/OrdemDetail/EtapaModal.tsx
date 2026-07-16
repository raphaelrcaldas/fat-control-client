"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
   Modal,
   ModalHeader,
   ModalBody,
   ModalFooter,
   Button,
   Label,
} from "flowbite-react";
import { HiCheckCircle } from "react-icons/hi";
import { HiPaperAirplane } from "react-icons/hi2";
import clsx from "clsx";
import type { EtapaOut } from "services/routes/om/ordens";
import {
   extractDate,
   extractTime,
   toIsoDatetime,
   minutesToTime,
   roundTimeToFiveMinutes,
   calcularTempoVooMinutos,
} from "utils/dateHandler";
import { createNextEtapa } from "./utils/ordemUtils";
import {
   getErroDataHora,
   getErroTempoVooMinimo,
   getErroTvooAltMinimo,
   getEtapaCamposFaltantes,
   isEtapaFieldMissing,
} from "./utils/ordemValidation";
import { DateTimeField, FieldError, inputBaseClass } from "./DateTimeField";
import { RouteSuggestionStrip } from "./RouteSuggestionStrip";
import { useRouteSuggestionAutofill } from "./hooks/useRouteSuggestionAutofill";

interface EtapaModalProps {
   isOpen: boolean;
   onClose: () => void;
   onSave: (etapa: EtapaOut) => void;
   etapa: EtapaOut | null; // null = nova etapa
   etapaIndex: number | null; // null = adicionar, >= 0 = editar
   referenceEtapa?: EtapaOut; // Etapa de referência para pré-preencher nova etapa
}

// Inputs de código ICAO: protagonistas visuais do cartão de rota
const icaoInputClass =
   "w-full min-w-0 rounded border bg-white px-2 py-2 text-center font-mono text-xl font-semibold tracking-[0.18em] text-slate-900 uppercase placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-300 focus:border-transparent focus:ring-2";

const sectionTitleClass =
   "text-xs font-semibold tracking-widest text-slate-500 uppercase";

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

   // Campos visitados pelo usuário — erro de obrigatório só aparece após blur,
   // para o formulário não "nascer" coberto de vermelho
   const [touched, setTouched] = useState<Record<string, boolean>>({});
   const markTouched = (field: string) =>
      setTouched((prev) => ({ ...prev, [field]: true }));

   // Inicializar formulário quando modal abre
   useEffect(() => {
      if (!isOpen) return;

      setTouched({});

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

   // Sugestão de rota baseada em missões anteriores, com auto-preenchimento
   // (lógica no hook useRouteSuggestionAutofill)
   const origem = formData.origem || "";
   const dest = formData.dest || "";
   const {
      routeSuggestion,
      isLoadingRoute,
      suggestionType,
      markUserChangedRoute,
   } = useRouteSuggestionAutofill({
      isOpen,
      isEditing,
      origem,
      dest,
      setFormData,
   });

   // Ref para ler valores de pouso dentro dos effects sem torná-los deps.
   // Evita que digitação em dt_arr dispare auto-ajuste e sobrescreva o valor parcial.
   const currentPousoRef = useRef({ dataPouso, horaPouso });
   useEffect(() => {
      currentPousoRef.current = { dataPouso, horaPouso };
   });

   // Auto-ajuste: quando data decolagem > data pouso, ajustar data pouso.
   // Reage apenas a mudanças em decolagem (não em pouso) para não brigar com digitação.
   useEffect(() => {
      if (!dataDecolagem) return;
      const { dataPouso: pouso, horaPouso: hora } = currentPousoRef.current;
      if (!pouso) return;

      if (dataDecolagem > pouso) {
         const newIsoDatetime = toIsoDatetime(dataDecolagem, hora || "00:00");
         setFormData((prev) => ({ ...prev, dt_arr: newIsoDatetime }));
      }
   }, [dataDecolagem]);

   // Auto-ajuste: se mesma data mas hora decolagem >= hora pouso.
   // Reage apenas a mudanças em decolagem (não em pouso) para não brigar com digitação.
   useEffect(() => {
      if (!dataDecolagem || !horaDecolagem) return;
      const { dataPouso: pouso, horaPouso: hora } = currentPousoRef.current;
      if (!pouso || !hora) return;

      if (dataDecolagem === pouso && horaDecolagem >= hora) {
         const [hours, minutes] = horaDecolagem.split(":").map(Number);
         const totalMinutes = hours * 60 + minutes + 5;
         const newHours = Math.floor(totalMinutes / 60) % 24;
         const newMinutes = totalMinutes % 60;
         const newHoraPouso = `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(2, "0")}`;

         const newIsoDatetime = toIsoDatetime(pouso, newHoraPouso);
         setFormData((prev) => ({ ...prev, dt_arr: newIsoDatetime }));
      }
   }, [dataDecolagem, horaDecolagem]);

   // Validações (regras compartilhadas em utils/ordemValidation —
   // mesma fonte usada pelo useOrdemForm na validação agregada)
   const erroDataHora = useMemo(() => getErroDataHora(formData), [formData]);

   const erroTempoVooEtapa = useMemo(
      () => getErroTempoVooMinimo(formData),
      [formData]
   );

   const erroTempoVooAlternativa = useMemo(
      () => getErroTvooAltMinimo(formData.tvoo_alt),
      [formData.tvoo_alt]
   );

   // Validação de campos obrigatórios (rótulos para o rodapé)
   const camposObrigatorios = useMemo(
      () => getEtapaCamposFaltantes(formData),
      [formData]
   );

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

   // Erros de obrigatoriedade (só após blur do campo)
   const origemVazia =
      touched.origem && isEtapaFieldMissing(formData, "origem");
   const dtDepVazia = touched.dt_dep && isEtapaFieldMissing(formData, "dt_dep");
   const destVazio = touched.dest && isEtapaFieldMissing(formData, "dest");
   const dtArrVazia = touched.dt_arr && isEtapaFieldMissing(formData, "dt_arr");
   const alternativaVazia =
      touched.alternativa && isEtapaFieldMissing(formData, "alternativa");
   const tvooAltVazio =
      touched.tvoo_alt && isEtapaFieldMissing(formData, "tvoo_alt");
   const qtdCombVazia =
      touched.qtd_comb && isEtapaFieldMissing(formData, "qtd_comb");
   const esfAerVazio =
      touched.esf_aer && isEtapaFieldMissing(formData, "esf_aer");

   const rotaCompleta = origem.length === 4 && dest.length === 4;
   const showSuggestionStrip = isLoadingRoute || rotaCompleta;

   return (
      <Modal show={isOpen} onClose={onClose} dismissible size="4xl">
         <ModalHeader>
            <div className="flex items-center gap-3">
               <HiPaperAirplane className="h-5 w-5 text-amber-500" />
               <span>{modalTitle}</span>
               {rotaCompleta && (
                  <span className="hidden rounded-md bg-slate-100 px-2 py-0.5 font-mono text-sm font-medium tracking-wider text-slate-500 sm:inline">
                     {origem} → {dest}
                  </span>
               )}
            </div>
         </ModalHeader>

         <ModalBody>
            <div className="space-y-4">
               {/* Cartão de rota: o trecho de voo como protagonista */}
               <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
                  <div className="grid md:grid-cols-[1fr_auto_1fr]">
                     {/* Decolagem */}
                     <div className="p-4 md:p-5">
                        <div className="mb-3 flex items-center gap-2">
                           <span className="h-2 w-2 rounded-full bg-sky-500" />
                           <h4 className={sectionTitleClass}>Decolagem</h4>
                        </div>
                        <div className="space-y-3">
                           <div>
                              <Label
                                 htmlFor="origem"
                                 className="mb-1.5 block text-xs font-medium text-slate-500"
                              >
                                 Origem <span className="text-red-500">*</span>
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
                                    markUserChangedRoute();
                                    setFormData((prev) => ({
                                       ...prev,
                                       origem: value.toUpperCase(),
                                    }));
                                 }}
                                 onBlur={() => markTouched("origem")}
                                 placeholder="SBGL"
                                 maxLength={4}
                                 className={clsx(
                                    icaoInputClass,
                                    origemVazia
                                       ? "border-red-300 focus:ring-red-500"
                                       : "border-slate-300 focus:ring-sky-500"
                                 )}
                              />
                              {origemVazia && <FieldError />}
                           </div>
                           <DateTimeField
                              idPrefix="dt_dep"
                              date={dataDecolagem}
                              time={horaDecolagem}
                              focusRingClass="focus:ring-sky-500"
                              dateMissing={!!dtDepVazia}
                              onChange={(date, time) =>
                                 updateDateTime("dt_dep", date, time)
                              }
                              onDateBlur={() => markTouched("dt_dep")}
                           />
                        </div>
                     </div>

                     {/* Conector: tempo de voo do trecho */}
                     <div className="flex items-center justify-center border-y border-dashed border-slate-200 bg-slate-50/60 px-6 py-3 md:border-y-0 md:bg-transparent md:px-3 md:py-0">
                        <div className="flex items-center gap-3 md:flex-col md:gap-1">
                           <div className="flex items-center gap-1.5">
                              <span className="hidden w-6 border-t border-dashed border-slate-300 md:block" />
                              <HiPaperAirplane className="h-4 w-4 rotate-90 text-amber-500 md:rotate-0" />
                              <span className="hidden w-6 border-t border-dashed border-slate-300 md:block" />
                           </div>
                           <span className="font-mono text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
                              {tempoVoo}
                           </span>
                           <span className="text-[10px] font-medium tracking-widest text-slate-400 uppercase">
                              Tempo de voo
                           </span>
                        </div>
                     </div>

                     {/* Pouso */}
                     <div className="p-4 md:p-5">
                        <div className="mb-3 flex items-center gap-2">
                           <span className="h-2 w-2 rounded-full bg-emerald-500" />
                           <h4 className={sectionTitleClass}>Pouso</h4>
                        </div>
                        <div className="space-y-3">
                           <div>
                              <Label
                                 htmlFor="dest"
                                 className="mb-1.5 block text-xs font-medium text-slate-500"
                              >
                                 Destino <span className="text-red-500">*</span>
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
                                    markUserChangedRoute();
                                    setFormData((prev) => ({
                                       ...prev,
                                       dest: value.toUpperCase(),
                                    }));
                                 }}
                                 onBlur={() => markTouched("dest")}
                                 placeholder="SBBR"
                                 maxLength={4}
                                 className={clsx(
                                    icaoInputClass,
                                    destVazio
                                       ? "border-red-300 focus:ring-red-500"
                                       : "border-slate-300 focus:ring-emerald-500"
                                 )}
                              />
                              {destVazio && <FieldError />}
                           </div>
                           <DateTimeField
                              idPrefix="dt_arr"
                              date={dataPouso}
                              time={horaPouso}
                              minDate={dataDecolagem}
                              focusRingClass="focus:ring-emerald-500"
                              dateMissing={!!dtArrVazia}
                              onChange={(date, time) =>
                                 updateDateTime("dt_arr", date, time)
                              }
                              onDateBlur={() => markTouched("dt_arr")}
                           />
                        </div>
                     </div>
                  </div>

                  {/* Faixa de sugestão de rota: integrada ao cartão, sem saltos de layout */}
                  {showSuggestionStrip && (
                     <RouteSuggestionStrip
                        isLoading={isLoadingRoute}
                        suggestionType={suggestionType}
                        suggestion={routeSuggestion}
                     />
                  )}
               </div>

               {/* Erros de validação de data/hora */}
               {(erroDataHora || erroTempoVooEtapa) && (
                  <div className="space-y-1 rounded border border-red-200 bg-red-50 px-3 py-2">
                     {erroDataHora && (
                        <p className="text-sm text-red-600">{erroDataHora}</p>
                     )}
                     {erroTempoVooEtapa && (
                        <p className="text-sm text-red-600">
                           {erroTempoVooEtapa}
                        </p>
                     )}
                  </div>
               )}

               {/* Cartão de planejamento: alternativa, combustível e esforço aéreo */}
               <div className="rounded border border-slate-200 bg-white shadow-sm">
                  <div className="grid divide-y divide-slate-100 md:grid-cols-5 md:divide-x md:divide-y-0">
                     {/* Alternativa */}
                     <div className="p-4 md:col-span-2">
                        <div className="mb-3 flex items-center gap-2">
                           <span className="h-2 w-2 rounded-full bg-slate-300" />
                           <h4 className={sectionTitleClass}>Alternativa</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                           <div>
                              <Label
                                 htmlFor="alternativa"
                                 className="mb-1.5 block text-xs font-medium text-slate-500"
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
                                 onBlur={() => markTouched("alternativa")}
                                 placeholder="SBSP"
                                 maxLength={4}
                                 className={clsx(
                                    inputBaseClass,
                                    "text-center font-mono uppercase placeholder:text-slate-300",
                                    alternativaVazia
                                       ? "border-red-300 focus:ring-red-500"
                                       : "border-slate-300 focus:ring-sky-500"
                                 )}
                              />
                              {alternativaVazia && <FieldError />}
                           </div>
                           <div>
                              <Label
                                 htmlFor="tvoo_alt"
                                 className="mb-1.5 block text-xs font-medium text-slate-500"
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
                                 onBlur={() => markTouched("tvoo_alt")}
                                 step="300"
                                 className={clsx(
                                    inputBaseClass,
                                    tvooAltVazio
                                       ? "border-red-300 focus:ring-red-500"
                                       : "border-slate-300 focus:ring-sky-500"
                                 )}
                              />
                              {tvooAltVazio && <FieldError />}
                              {erroTempoVooAlternativa && (
                                 <FieldError>
                                    {erroTempoVooAlternativa}
                                 </FieldError>
                              )}
                           </div>
                        </div>
                     </div>

                     {/* Combustível */}
                     <div className="p-4 md:col-span-1">
                        <div className="mb-3 flex items-center gap-2">
                           <span className="h-2 w-2 rounded-full bg-slate-300" />
                           <h4 className={sectionTitleClass}>Combustível</h4>
                        </div>
                        <div>
                           <Label
                              htmlFor="qtd_comb"
                              className="mb-1.5 block text-xs font-medium text-slate-500"
                           >
                              Toneladas <span className="text-red-500">*</span>
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
                                       qtd_comb: value
                                          ? parseInt(value, 10)
                                          : 0,
                                    }));
                                 }
                              }}
                              onBlur={() => markTouched("qtd_comb")}
                              placeholder="15"
                              className={clsx(
                                 inputBaseClass,
                                 "text-center font-mono placeholder:text-slate-300",
                                 qtdCombVazia
                                    ? "border-red-300 focus:ring-red-500"
                                    : "border-slate-300 focus:ring-sky-500"
                              )}
                           />
                           {qtdCombVazia && <FieldError />}
                        </div>
                     </div>

                     {/* Esforço Aéreo */}
                     <div className="p-4 md:col-span-2">
                        <div className="mb-3 flex items-center gap-2">
                           <span className="h-2 w-2 rounded-full bg-slate-300" />
                           <h4 className={sectionTitleClass}>Esforço Aéreo</h4>
                        </div>
                        <div>
                           <Label
                              htmlFor="esf_aer"
                              className="mb-1.5 block text-xs font-medium text-slate-500"
                           >
                              Descrição <span className="text-red-500">*</span>
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
                              onBlur={() => markTouched("esf_aer")}
                              placeholder="ESFORÇO ALOCADO"
                              className={clsx(
                                 inputBaseClass,
                                 "uppercase placeholder:text-slate-300",
                                 esfAerVazio
                                    ? "border-red-300 focus:ring-red-500"
                                    : "border-slate-300 focus:ring-sky-500"
                              )}
                           />
                           {esfAerVazio && <FieldError />}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </ModalBody>

         <ModalFooter>
            <div className="flex w-full items-center justify-between gap-3">
               {hasRequiredFieldErrors ? (
                  <p className="min-w-0 flex-1 truncate text-xs text-slate-400">
                     <span className="font-medium text-amber-600">
                        {camposObrigatorios.length}{" "}
                        {camposObrigatorios.length === 1
                           ? "pendente"
                           : "pendentes"}
                        :
                     </span>{" "}
                     {camposObrigatorios.join(", ")}
                  </p>
               ) : hasValidationErrors ? (
                  <p className="min-w-0 flex-1 truncate text-xs text-red-500">
                     Corrija os erros de data/hora para salvar
                  </p>
               ) : (
                  <p className="flex min-w-0 flex-1 items-center gap-1.5 text-xs font-medium text-emerald-600">
                     <HiCheckCircle className="h-4 w-4 shrink-0" />
                     Etapa pronta para salvar
                  </p>
               )}
               <div className="flex shrink-0 gap-3">
                  <Button color="gray" onClick={onClose}>
                     Cancelar
                  </Button>
                  <Button
                     color="primary"
                     onClick={handleSave}
                     disabled={cannotSave}
                  >
                     {isEditing ? "Salvar Alterações" : "Adicionar Etapa"}
                  </Button>
               </div>
            </div>
         </ModalFooter>
      </Modal>
   );
}
