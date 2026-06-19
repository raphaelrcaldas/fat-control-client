"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
   Modal,
   ModalHeader,
   ModalBody,
   ModalFooter,
   Button,
   Label,
   Spinner,
} from "flowbite-react";
import { HiLightningBolt, HiCheckCircle } from "react-icons/hi";
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
   // 23:58 não pode virar 00:00 (mudaria de dia silenciosamente): trava em 23:55
   if (roundedMinutes === 60 && hours === 23) return "23:55";
   const finalMinutes = roundedMinutes === 60 ? 0 : roundedMinutes;
   const finalHours = roundedMinutes === 60 ? hours + 1 : hours;
   return `${String(finalHours).padStart(2, "0")}:${String(finalMinutes).padStart(2, "0")}`;
};

const inputBaseClass =
   "w-full min-w-0 rounded border bg-white px-2.5 py-2 text-sm text-slate-900 focus:border-transparent focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50";

// Inputs de código ICAO: protagonistas visuais do cartão de rota
const icaoInputClass =
   "w-full min-w-0 rounded border bg-white px-2 py-2 text-center font-mono text-xl font-semibold tracking-[0.18em] text-slate-900 uppercase placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-300 focus:border-transparent focus:ring-2";

const sectionTitleClass =
   "text-xs font-semibold tracking-widest text-slate-500 uppercase";

function FieldError({ children = "Obrigatório" }: { children?: string }) {
   return <span className="mt-1 block text-xs text-red-500">{children}</span>;
}

function SuggestionChip({
   tone,
   label,
   value,
}: {
   tone: "emerald" | "amber";
   label: string;
   value: string;
}) {
   return (
      <span
         className={clsx(
            "rounded-full px-2 py-0.5 text-[11px] ring-1",
            tone === "emerald"
               ? "bg-emerald-50 text-emerald-700 ring-emerald-200/70"
               : "bg-amber-50 text-amber-700 ring-amber-200/70"
         )}
      >
         {label}: <span className="font-mono font-semibold">{value}</span>
      </span>
   );
}

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

   // Busca sugestão de rota baseada em missões anteriores
   const origem = formData.origem || "";
   const dest = formData.dest || "";
   const { data: routeSuggestion, isFetching: isLoadingRoute } =
      useRouteSuggestion(origem, dest);

   // Tipo de sugestão aplicada: 'none', 'full' (rota completa) ou 'partial' (apenas destino)
   const [suggestionType, setSuggestionType] = useState<
      "none" | "full" | "partial"
   >("none");

   // Flag para rastrear se o usuário mudou a rota manualmente (evita sobrescrever dados ao abrir modal)
   const userChangedRouteRef = useRef(false);

   // Resetar estado quando origem ou dest mudam
   const prevRouteRef = useRef<string>("");
   useEffect(() => {
      const routeKey = `${origem}-${dest}`;
      if (prevRouteRef.current !== routeKey) {
         prevRouteRef.current = routeKey;
         setSuggestionType("none");
      }
   }, [origem, dest]);

   // Auto-preencher quando encontrar sugestão de rota
   useEffect(() => {
      if (origem.length !== 4 || dest.length !== 4) return;

      // Em modo edição, só aplicar sugestão se usuário mudou a rota manualmente
      if (isEditing && !userChangedRouteRef.current) {
         return;
      }

      // Se não há sugestão, manter suggestionType como 'none'
      if (!routeSuggestion) {
         return;
      }

      // Guard contra respostas stale de queries anteriores
      // Para sugestão parcial, origem é null (esperado), verificar só dest
      if (routeSuggestion.dest !== dest) {
         return;
      }
      if (routeSuggestion.has_route_data && routeSuggestion.origem !== origem) {
         return;
      }

      // Determinar tipo de sugestão baseado nas flags
      if (
         routeSuggestion.has_route_data &&
         routeSuggestion.has_destination_data
      ) {
         setSuggestionType("full");
      } else if (routeSuggestion.has_destination_data) {
         setSuggestionType("partial");
      } else {
         setSuggestionType("none");
         return;
      }

      // Aplicar sugestão
      setFormData((prev) => {
         let newDtArr = prev.dt_arr;

         // Calcular dt_arr apenas se temos dados da rota completa
         if (
            prev.dt_dep &&
            routeSuggestion.tvoo_etp &&
            routeSuggestion.tvoo_etp > 0
         ) {
            const depDate = new Date(prev.dt_dep);
            const arrDate = new Date(
               depDate.getTime() + routeSuggestion.tvoo_etp * 60 * 1000
            );
            newDtArr = arrDate.toISOString();
         }

         return {
            ...prev,
            // Sempre aplicar dados do destino se disponíveis
            alternativa: routeSuggestion.alternativa ?? prev.alternativa,
            tvoo_alt: routeSuggestion.tvoo_alt ?? prev.tvoo_alt,
            // Apenas aplicar dados da rota se disponíveis
            qtd_comb: routeSuggestion.qtd_comb ?? prev.qtd_comb,
            dt_arr: newDtArr,
         };
      });
   }, [routeSuggestion, isEditing, origem, dest]);

   // Resetar refs e flags quando modal fecha
   useEffect(() => {
      if (!isOpen) {
         prevRouteRef.current = "";
         setSuggestionType("none");
         userChangedRouteRef.current = false;
      }
   }, [isOpen]);

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
      if (!formData.origem?.trim()) erros.push("Origem");
      if (!formData.dt_arr) erros.push("Data/hora de pouso");
      if (!formData.dest) erros.push("Destino");
      if (!formData.alternativa) erros.push("Alternativa");
      if (!formData.tvoo_alt || formData.tvoo_alt === 0)
         erros.push("Tempo de voo alternativa");
      if (!formData.qtd_comb || formData.qtd_comb === 0)
         erros.push("Quantidade de combustível");
      if (!formData.esf_aer?.trim()) erros.push("Esforço aéreo");
      return erros;
   }, [
      formData.dt_dep,
      formData.origem,
      formData.dt_arr,
      formData.dest,
      formData.alternativa,
      formData.tvoo_alt,
      formData.qtd_comb,
      formData.esf_aer,
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

   // Erros de obrigatoriedade (só após blur do campo)
   const origemVazia = touched.origem && !formData.origem?.trim();
   const dtDepVazia = touched.dt_dep && !formData.dt_dep;
   const destVazio = touched.dest && !formData.dest;
   const dtArrVazia = touched.dt_arr && !formData.dt_arr;
   const alternativaVazia = touched.alternativa && !formData.alternativa;
   const tvooAltVazio =
      touched.tvoo_alt && (!formData.tvoo_alt || formData.tvoo_alt === 0);
   const qtdCombVazia =
      touched.qtd_comb && (!formData.qtd_comb || formData.qtd_comb === 0);
   const esfAerVazio = touched.esf_aer && !formData.esf_aer?.trim();

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
                                    userChangedRouteRef.current = true;
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
                           <div className="grid grid-cols-2 gap-3">
                              <div>
                                 <Label
                                    htmlFor="dt_dep_date"
                                    className="mb-1.5 block text-xs font-medium text-slate-500"
                                 >
                                    Data <span className="text-red-500">*</span>
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
                                    onBlur={() => markTouched("dt_dep")}
                                    className={clsx(
                                       inputBaseClass,
                                       dtDepVazia
                                          ? "border-red-300 focus:ring-red-500"
                                          : "border-slate-300 focus:ring-sky-500"
                                    )}
                                 />
                                 {dtDepVazia && <FieldError />}
                              </div>
                              <div>
                                 <Label
                                    htmlFor="dt_dep_time"
                                    className="mb-1.5 block text-xs font-medium text-slate-500"
                                 >
                                    Hora (Z)
                                 </Label>
                                 <input
                                    type="time"
                                    id="dt_dep_time"
                                    value={horaDecolagem}
                                    onChange={(e) =>
                                       updateDateTime(
                                          "dt_dep",
                                          dataDecolagem,
                                          e.target.value
                                       )
                                    }
                                    onBlur={(e) => {
                                       if (!e.target.value) return;
                                       const rounded = roundTimeToFiveMinutes(
                                          e.target.value
                                       );
                                       if (rounded !== e.target.value) {
                                          updateDateTime(
                                             "dt_dep",
                                             dataDecolagem,
                                             rounded
                                          );
                                       }
                                    }}
                                    step="300"
                                    className={clsx(
                                       inputBaseClass,
                                       "border-slate-300 focus:ring-sky-500"
                                    )}
                                 />
                              </div>
                           </div>
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
                                    userChangedRouteRef.current = true;
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
                           <div className="grid grid-cols-2 gap-3">
                              <div>
                                 <Label
                                    htmlFor="dt_arr_date"
                                    className="mb-1.5 block text-xs font-medium text-slate-500"
                                 >
                                    Data <span className="text-red-500">*</span>
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
                                    onBlur={() => markTouched("dt_arr")}
                                    className={clsx(
                                       inputBaseClass,
                                       dtArrVazia
                                          ? "border-red-300 focus:ring-red-500"
                                          : "border-slate-300 focus:ring-emerald-500"
                                    )}
                                 />
                                 {dtArrVazia && <FieldError />}
                              </div>
                              <div>
                                 <Label
                                    htmlFor="dt_arr_time"
                                    className="mb-1.5 block text-xs font-medium text-slate-500"
                                 >
                                    Hora (Z)
                                 </Label>
                                 <input
                                    type="time"
                                    id="dt_arr_time"
                                    value={horaPouso}
                                    onChange={(e) =>
                                       updateDateTime(
                                          "dt_arr",
                                          dataPouso,
                                          e.target.value
                                       )
                                    }
                                    onBlur={(e) => {
                                       if (!e.target.value) return;
                                       const rounded = roundTimeToFiveMinutes(
                                          e.target.value
                                       );
                                       if (rounded !== e.target.value) {
                                          updateDateTime(
                                             "dt_arr",
                                             dataPouso,
                                             rounded
                                          );
                                       }
                                    }}
                                    step="300"
                                    className={clsx(
                                       inputBaseClass,
                                       "border-slate-300 focus:ring-emerald-500"
                                    )}
                                 />
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Faixa de sugestão de rota: integrada ao cartão, sem saltos de layout */}
                  {showSuggestionStrip && (
                     <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-slate-100 bg-slate-50/70 px-4 py-2.5">
                        {isLoadingRoute ? (
                           <>
                              <Spinner size="sm" color="info" />
                              <span className="text-xs text-slate-500">
                                 Buscando dados da rota...
                              </span>
                           </>
                        ) : suggestionType === "full" && routeSuggestion ? (
                           <>
                              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                                 <HiLightningBolt className="h-3.5 w-3.5" />
                                 Sugestão aplicada — rota já voada
                              </span>
                              {routeSuggestion.alternativa && (
                                 <SuggestionChip
                                    tone="emerald"
                                    label="Alt"
                                    value={routeSuggestion.alternativa}
                                 />
                              )}
                              {routeSuggestion.tvoo_alt != null && (
                                 <SuggestionChip
                                    tone="emerald"
                                    label="Tvoo Alt"
                                    value={minutesToTime(
                                       routeSuggestion.tvoo_alt
                                    )}
                                 />
                              )}
                              {routeSuggestion.qtd_comb != null && (
                                 <SuggestionChip
                                    tone="emerald"
                                    label="Combustível"
                                    value={`${routeSuggestion.qtd_comb.toLocaleString("pt-BR")}T`}
                                 />
                              )}
                              {routeSuggestion.tvoo_etp != null &&
                                 routeSuggestion.tvoo_etp > 0 && (
                                    <SuggestionChip
                                       tone="emerald"
                                       label="Chegada calculada"
                                       value={minutesToTime(
                                          routeSuggestion.tvoo_etp
                                       )}
                                    />
                                 )}
                           </>
                        ) : suggestionType === "partial" && routeSuggestion ? (
                           <>
                              <span className="flex items-center gap-1.5 text-xs font-medium text-amber-700">
                                 <HiLightningBolt className="h-3.5 w-3.5" />
                                 Sugestão parcial — dados do destino
                              </span>
                              {routeSuggestion.alternativa && (
                                 <SuggestionChip
                                    tone="amber"
                                    label="Alt"
                                    value={routeSuggestion.alternativa}
                                 />
                              )}
                              {routeSuggestion.tvoo_alt != null && (
                                 <SuggestionChip
                                    tone="amber"
                                    label="Tvoo Alt"
                                    value={minutesToTime(
                                       routeSuggestion.tvoo_alt
                                    )}
                                 />
                              )}
                           </>
                        ) : (
                           <span className="text-xs text-slate-400">
                              Nenhuma sugestão para esta rota
                           </span>
                        )}
                     </div>
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
                     color="red"
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
