import { useState, useEffect, useMemo } from "react";
import type {
   OrdemMissaoOut,
   OrdemMissaoCreate,
   OrdemMissaoUpdate,
   EtapaOut,
   CampoEspecial,
   Etiqueta,
   TripulacaoAgrupada,
   TripulacaoOrdemOut,
} from "services/routes/om/ordens";
import { type CrewMember } from "services/routes/trips";
import { type FuncaoTripulante } from "@/constants/tripulantes";
import { createDefaultOrdem, calcularEsfAer } from "../utils/ordemUtils";
import { useCreateOrdem, useUpdateOrdem } from "@/hooks/queries";
import { minutesToTime } from "utils/dateHandler";
import { compareByAntiguidade } from "utils/sortByAntiguidade";

// Local type for tripulacao management (API uses TripulacaoAgrupada)
interface TripulacaoOrdem {
   pil: CrewMember[];
   mc: CrewMember[];
   lm: CrewMember[];
   tf: CrewMember[];
   oe: CrewMember[];
   os: CrewMember[];
}

// Convert API tripulacao array format to grouped object format
const convertTripulacaoFromApi = (
   tripulacaoArray: TripulacaoOrdemOut[]
): TripulacaoOrdem => {
   const result: TripulacaoOrdem = {
      pil: [],
      mc: [],
      lm: [],
      tf: [],
      oe: [],
      os: [],
   };

   if (!tripulacaoArray || !Array.isArray(tripulacaoArray)) {
      return result;
   }

   tripulacaoArray.forEach((item) => {
      const funcao = item.funcao as FuncaoTripulante;
      if (funcao in result && item.tripulante) {
         result[funcao].push(item.tripulante);
      }
   });

   return result;
};

const createDefaultTripulacao = (): TripulacaoOrdem => ({
   pil: [],
   mc: [],
   lm: [],
   tf: [],
   oe: [],
   os: [],
});

interface UseOrdemFormProps {
   ordem: OrdemMissaoOut | null;
   isNew: boolean;
   isCloning?: boolean;
   onSave: () => void;
}

// Monta o estado inicial completo do formulário a partir da ordem (ou defaults)
const buildInitialState = (
   ordem: OrdemMissaoOut | null,
   isCloning: boolean
): {
   formData: OrdemMissaoOut;
   tripulacao: TripulacaoOrdem;
   camposEspeciais: CampoEspecial[];
} => {
   let formData: OrdemMissaoOut;
   if (!ordem) {
      formData = createDefaultOrdem() as OrdemMissaoOut;
   } else {
      // Garantir que esf_aer tenha valor padrão
      const baseOrdem = { ...ordem, esf_aer: ordem.esf_aer ?? 0 };
      formData = isCloning
         ? { ...baseOrdem, id: 0, status: "rascunho" }
         : baseOrdem;
   }

   return {
      formData,
      tripulacao: ordem?.tripulacao
         ? convertTripulacaoFromApi(ordem.tripulacao)
         : createDefaultTripulacao(),
      camposEspeciais: ordem?.campos_especiais || [],
   };
};

export const useOrdemForm = ({
   ordem,
   isNew,
   isCloning = false,
   onSave,
}: UseOrdemFormProps) => {
   // TanStack Query mutations - invalidacao automatica
   const createOrdemMutation = useCreateOrdem();
   const updateOrdemMutation = useUpdateOrdem();

   const [formData, setFormData] = useState<OrdemMissaoOut>(
      () => buildInitialState(ordem, isCloning).formData
   );
   const [tripulacao, setTripulacao] = useState<TripulacaoOrdem>(
      () => buildInitialState(ordem, isCloning).tripulacao
   );
   const [camposEspeciais, setCamposEspeciais] = useState<CampoEspecial[]>(
      () => buildInitialState(ordem, isCloning).camposEspeciais
   );

   // Estado para valores originais (detecção de mudanças)
   const [originalData, setOriginalData] = useState(() =>
      buildInitialState(ordem, isCloning)
   );

   // Estados de loading e erro
   const [isSaving, setIsSaving] = useState(false);
   const [isApproving, setIsApproving] = useState(false);
   const [isCancelling, setIsCancelling] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [formValidationErrors, setFormValidationErrors] = useState<string[]>(
      []
   );

   // Estado de modo somente leitura (separado da editabilidade)
   const [isReadOnlyMode, setIsReadOnlyMode] = useState(false);

   // Sincronizar o formData quando a ordem ou isCloning mudar
   useEffect(() => {
      const initial = buildInitialState(ordem, isCloning);

      setFormData(initial.formData);
      setTripulacao(initial.tripulacao);
      setCamposEspeciais(initial.camposEspeciais);

      // Atualizar dados originais para detecção de mudanças
      setOriginalData(initial);

      if (!ordem || isCloning) {
         setIsReadOnlyMode(false);
      } else {
         setIsReadOnlyMode(ordem.status !== "rascunho");
      }
   }, [ordem, isCloning]);

   const isEditable = !isReadOnlyMode;

   // Memoiza a comparação para evitar JSON.stringify em cada render
   const hasChanges = useMemo(() => {
      return (
         JSON.stringify(formData) !== JSON.stringify(originalData.formData) ||
         JSON.stringify(tripulacao) !==
            JSON.stringify(originalData.tripulacao) ||
         JSON.stringify(camposEspeciais) !==
            JSON.stringify(originalData.camposEspeciais)
      );
   }, [formData, tripulacao, camposEspeciais, originalData]);

   const toggleReadOnlyMode = () => {
      setIsReadOnlyMode((prev) => !prev);
   };

   const handleRemoveEtapa = (index: number) => {
      if (!isEditable || formData.etapas.length <= 1) return;
      const newEtapas = formData.etapas.filter((_, i) => i !== index);
      setFormData({
         ...formData,
         etapas: newEtapas,
         // Preserva esforço alocado manualmente (mesmo critério de add/update)
         esf_aer: Math.max(formData.esf_aer ?? 0, calcularEsfAer(newEtapas)),
      });
   };

   // Atualizar uma etapa inteira (usado pelo modal de edição)
   const updateEtapa = (index: number, etapa: EtapaOut) => {
      if (!isEditable) return;
      const newEtapas = [...formData.etapas];
      newEtapas[index] = etapa;

      // Validacao: atualizar a origem da proxima etapa se necessário
      if (index < newEtapas.length - 1 && etapa.dest) {
         newEtapas[index + 1] = {
            ...newEtapas[index + 1],
            origem: etapa.dest,
         };
      }

      const calculatedEsfAer = calcularEsfAer(newEtapas);
      setFormData({
         ...formData,
         etapas: newEtapas,
         esf_aer: Math.max(formData.esf_aer ?? 0, calculatedEsfAer),
      });
   };

   // Adicionar nova etapa (usado pelo modal de adição)
   const addEtapa = (etapa: EtapaOut) => {
      if (!isEditable) return;
      const newEtapas = [...formData.etapas, etapa];
      const calculatedEsfAer = calcularEsfAer(newEtapas);
      setFormData({
         ...formData,
         etapas: newEtapas,
         esf_aer: Math.max(formData.esf_aer ?? 0, calculatedEsfAer),
      });
   };

   const updateFormData = (updates: Partial<OrdemMissaoOut>) => {
      if (!isEditable) return;
      setFormData({ ...formData, ...updates });
   };

   const addTripulante = (funcao: FuncaoTripulante, tripulante: CrewMember) => {
      if (!isEditable) return;
      if (tripulacao[funcao].some((t) => t.id === tripulante.id)) return;

      const updatedList = [...tripulacao[funcao], tripulante].sort((a, b) =>
         compareByAntiguidade(a.user, b.user)
      );

      setTripulacao({
         ...tripulacao,
         [funcao]: updatedList,
      });
   };

   const removeTripulante = (
      funcao: FuncaoTripulante,
      tripulanteId: number
   ) => {
      if (!isEditable) return;
      setTripulacao({
         ...tripulacao,
         [funcao]: tripulacao[funcao].filter((t) => t.id !== tripulanteId),
      });
   };

   const resetForm = () => {
      const baseData = ordem
         ? { ...ordem, esf_aer: ordem.esf_aer ?? 0 }
         : createDefaultOrdem();
      setFormData(baseData as OrdemMissaoOut);
      setTripulacao(
         ordem?.tripulacao
            ? convertTripulacaoFromApi(ordem.tripulacao)
            : createDefaultTripulacao()
      );
      setCamposEspeciais(ordem?.campos_especiais || []);
      setError(null);
      setFormValidationErrors([]);
   };

   const updateCamposEspeciais = (campos: CampoEspecial[]) => {
      if (!isEditable) return;
      setCamposEspeciais(campos);
   };

   const updateEtiquetas = (etiquetas: Etiqueta[]) => {
      if (!isEditable) return;
      setFormData((prev) => ({ ...prev, etiquetas }));
   };

   const clearError = () => {
      setError(null);
   };

   const clearValidationErrors = () => {
      setFormValidationErrors([]);
   };

   // Validacao de campos individuais para feedback visual em tempo real
   const getValidationErrors = () => {
      return {
         tipo: !formData.tipo?.trim(),
         matriculaAeronave: !formData.matricula_anv,
         etapas: formData.etapas.length === 0,
         piloto: tripulacao.pil.length === 0,
         mecanico: tripulacao.mc.length === 0,
         loadmaster: tripulacao.lm.length === 0,
      };
   };

   const validationErrors = getValidationErrors();

   // Funcao para ordenar etapas por data/hora de decolagem
   const sortEtapas = (etapas: EtapaOut[]) => {
      return [...etapas].sort((a, b) => {
         const dateTimeA = a.dt_dep || "";
         const dateTimeB = b.dt_dep || "";
         return dateTimeA.localeCompare(dateTimeB);
      });
   };

   // Campos obrigatórios de cada etapa (compartilhado entre rascunho e aprovação)
   const collectEtapaRequiredErrors = (etapas: EtapaOut[]): string[] => {
      const errors: string[] = [];
      etapas.forEach((etapa, index) => {
         const etapaNum = index + 1;

         if (!etapa.dt_dep) {
            errors.push(
               `Etapa ${etapaNum}: Data/hora de decolagem é obrigatória`
            );
         }
         if (!etapa.origem?.trim()) {
            errors.push(`Etapa ${etapaNum}: Origem é obrigatória`);
         }
         if (!etapa.dt_arr) {
            errors.push(`Etapa ${etapaNum}: Data/hora de pouso é obrigatória`);
         }
         if (!etapa.dest?.trim()) {
            errors.push(`Etapa ${etapaNum}: Destino é obrigatório`);
         }
         if (!etapa.alternativa?.trim()) {
            errors.push(`Etapa ${etapaNum}: Alternativa é obrigatória`);
         }
         if (!etapa.tvoo_alt || etapa.tvoo_alt === 0) {
            errors.push(
               `Etapa ${etapaNum}: Tempo de voo alternativa é obrigatório`
            );
         }
         if (!etapa.qtd_comb || etapa.qtd_comb === 0) {
            errors.push(
               `Etapa ${etapaNum}: Quantidade de combustível é obrigatória`
            );
         }
         if (!etapa.esf_aer?.trim()) {
            errors.push(`Etapa ${etapaNum}: Esforço aéreo é obrigatório`);
         }
      });
      return errors;
   };

   // Sobreposicao de horarios entre todas as etapas (compartilhado)
   const collectOverlapErrors = (etapas: EtapaOut[]): string[] => {
      const errors: string[] = [];
      for (let i = 0; i < etapas.length; i++) {
         for (let j = i + 1; j < etapas.length; j++) {
            const etapa1 = etapas[i];
            const etapa2 = etapas[j];

            if (
               etapa1.dt_dep &&
               etapa1.dt_arr &&
               etapa2.dt_dep &&
               etapa2.dt_arr
            ) {
               const dec1 = new Date(etapa1.dt_dep);
               const pou1 = new Date(etapa1.dt_arr);
               const dec2 = new Date(etapa2.dt_dep);
               const pou2 = new Date(etapa2.dt_arr);

               if (dec1 < pou2 && pou1 > dec2) {
                  errors.push(
                     `Sobreposição de horários: A Etapa ${i + 1} sobrepõe a Etapa ${j + 1}`
                  );
               }
            }
         }
      }
      return errors;
   };

   // esf_aer da ordem >= soma do tempo de voo das etapas (compartilhado)
   const collectEsfAerError = (): string[] => {
      const somaTempoVooAtual = calcularEsfAer(formData.etapas);
      const esfAer = formData.esf_aer || 0;
      if (somaTempoVooAtual > 0 && esfAer < somaTempoVooAtual) {
         return [
            `Esforço Aéreo deve ser maior ou igual à soma do tempo de voo das etapas (${minutesToTime(somaTempoVooAtual)})`,
         ];
      }
      return [];
   };

   const validateForm = (): { isValid: boolean; errors: string[] } => {
      const errors: string[] = [];

      if (validationErrors.tipo) {
         errors.push("Descrição da missão é obrigatória");
      }
      if (validationErrors.matriculaAeronave) {
         errors.push("Aeronave é obrigatória");
      }
      if (validationErrors.etapas) {
         errors.push("Pelo menos uma etapa é obrigatória");
      }
      if (validationErrors.piloto) {
         errors.push("Pelo menos 1 Piloto é obrigatório");
      }
      if (validationErrors.mecanico) {
         errors.push("Pelo menos 1 Mecânico é obrigatório");
      }
      if (validationErrors.loadmaster) {
         errors.push("Pelo menos 1 Loadmaster é obrigatório");
      }

      // Validar periodos duplicados (mesma dt_dep)
      const decolagemPeriodos = new Map<string, number[]>();
      formData.etapas.forEach((etapa, index) => {
         if (etapa.dt_dep) {
            const periodo = etapa.dt_dep;
            if (!decolagemPeriodos.has(periodo)) {
               decolagemPeriodos.set(periodo, []);
            }
            decolagemPeriodos.get(periodo)!.push(index + 1);
         }
      });

      decolagemPeriodos.forEach((indices) => {
         if (indices.length > 1) {
            errors.push(
               `Periodos duplicados: As etapas ${indices.join(", ")} possuem a mesma data/hora de decolagem`
            );
         }
      });

      errors.push(...collectOverlapErrors(formData.etapas));
      errors.push(...collectEtapaRequiredErrors(formData.etapas));

      // Validacoes extras exigidas apenas na aprovacao
      formData.etapas.forEach((etapa, index) => {
         const etapaNum = index + 1;

         if (etapa.tvoo_alt && etapa.tvoo_alt > 0 && etapa.tvoo_alt < 5) {
            errors.push(
               `Etapa ${etapaNum}: Tempo de voo alternativa mínimo é 5 minutos`
            );
         }

         // Validar tempo de voo da etapa >= 5 minutos
         if (etapa.dt_dep && etapa.dt_arr) {
            const decolagem = new Date(etapa.dt_dep);
            const pouso = new Date(etapa.dt_arr);
            const diffMinutes = (pouso.getTime() - decolagem.getTime()) / 60000;

            if (diffMinutes > 0 && diffMinutes < 5) {
               errors.push(
                  `Etapa ${etapaNum}: Tempo de voo mínimo é 5 minutos`
               );
            }
         }

         if (index > 0 && etapa.origem !== formData.etapas[index - 1].dest) {
            errors.push(
               `Etapa ${etapaNum}: A origem deve ser igual ao destino da etapa anterior (${formData.etapas[index - 1].dest})`
            );
         }
      });

      errors.push(...collectEsfAerError());

      return {
         isValid: errors.length === 0,
         errors,
      };
   };

   // Validacao minima para salvar rascunho
   const validateDraft = (): { isValid: boolean; errors: string[] } => {
      const errors: string[] = [
         ...collectEtapaRequiredErrors(formData.etapas),
         ...collectOverlapErrors(formData.etapas),
         ...collectEsfAerError(),
      ];

      return {
         isValid: errors.length === 0,
         errors,
      };
   };

   // Helper to convert form data to API format
   const prepareApiData = (
      isApproved: boolean = false
   ): OrdemMissaoCreate | OrdemMissaoUpdate => {
      const etapasOrdenadas = sortEtapas(formData.etapas);

      // Convert tripulacao to TripulacaoAgrupada format expected by API
      const tripulacaoAgrupada: TripulacaoAgrupada = {
         pil: tripulacao.pil
            .map((t) => t.id)
            .filter((id): id is number => !!id),
         mc: tripulacao.mc.map((t) => t.id).filter((id): id is number => !!id),
         lm: tripulacao.lm.map((t) => t.id).filter((id): id is number => !!id),
         tf: tripulacao.tf.map((t) => t.id).filter((id): id is number => !!id),
         oe: tripulacao.oe.map((t) => t.id).filter((id): id is number => !!id),
         os: tripulacao.os.map((t) => t.id).filter((id): id is number => !!id),
      };

      return {
         numero: formData.numero,
         doc_ref: formData.doc_ref || "",
         matricula_anv: formData.matricula_anv,
         projeto: formData.projeto,
         tipo: formData.tipo || "",
         status: isApproved
            ? "aprovada"
            : isNew || isCloning
              ? "rascunho"
              : formData.status,
         esf_aer: formData.esf_aer || 0,
         etapas: etapasOrdenadas.map((etapa) => ({
            dt_dep: etapa.dt_dep,
            origem: etapa.origem,
            dt_arr: etapa.dt_arr,
            dest: etapa.dest,
            alternativa: etapa.alternativa,
            tvoo_alt: etapa.tvoo_alt,
            qtd_comb:
               typeof etapa.qtd_comb === "number"
                  ? etapa.qtd_comb
                  : parseInt(String(etapa.qtd_comb || "0"), 10),
            esf_aer: etapa.esf_aer,
         })),
         tripulacao: tripulacaoAgrupada,
         campos_especiais: camposEspeciais,
         etiquetas_ids: formData.etiquetas?.map((e) => e.id) || [],
      };
   };

   // Salvar como rascunho
   const handleSubmit = async (
      e: React.FormEvent
   ): Promise<{ success: boolean }> => {
      e.preventDefault();

      // Valida campos obrigatorios das etapas
      const draftValidation = validateDraft();
      if (!draftValidation.isValid) {
         setFormValidationErrors(draftValidation.errors);
         return { success: false };
      }

      setFormValidationErrors([]);
      setIsSaving(true);
      setError(null);

      try {
         const shouldGenerateNew = isNew || isCloning;
         const apiData = prepareApiData(false);

         if (shouldGenerateNew) {
            await createOrdemMutation.mutateAsync(apiData as OrdemMissaoCreate);
         } else {
            await updateOrdemMutation.mutateAsync({
               id: formData.id,
               data: apiData as OrdemMissaoUpdate,
            });
         }

         onSave();
         return { success: true };
      } catch (err) {
         console.error("Erro ao salvar ordem:", err);
         setError(
            err instanceof Error
               ? err.message
               : "Erro ao salvar ordem de missão"
         );
         return { success: false };
      } finally {
         setIsSaving(false);
      }
   };

   // Elaborar (aprovar) ordem
   const handleElaborar = async (): Promise<{ success: boolean }> => {
      const validation = validateForm();

      if (!validation.isValid) {
         setFormValidationErrors(validation.errors);
         return { success: false };
      }

      setFormValidationErrors([]);
      setIsApproving(true);
      setError(null);

      try {
         const shouldGenerateNew = isNew || isCloning;
         const apiData = prepareApiData(true);

         if (shouldGenerateNew) {
            await createOrdemMutation.mutateAsync(apiData as OrdemMissaoCreate);
         } else {
            await updateOrdemMutation.mutateAsync({
               id: formData.id,
               data: apiData as OrdemMissaoUpdate,
            });
         }

         onSave();
         return { success: true };
      } catch (err) {
         console.error("Erro ao elaborar ordem:", err);
         setError(
            err instanceof Error
               ? err.message
               : "Erro ao elaborar ordem de missão"
         );
         return { success: false };
      } finally {
         setIsApproving(false);
      }
   };

   // Cancelar ordem aprovada
   const handleCancelar = async (): Promise<{ success: boolean }> => {
      if (formData.status !== "aprovada") return { success: false };

      setIsCancelling(true);
      setError(null);

      try {
         await updateOrdemMutation.mutateAsync({
            id: formData.id,
            data: { status: "cancelada" } as OrdemMissaoUpdate,
         });

         onSave();
         return { success: true };
      } catch (err) {
         console.error("Erro ao cancelar ordem:", err);
         setError(
            err instanceof Error
               ? err.message
               : "Erro ao cancelar ordem de missão"
         );
         return { success: false };
      } finally {
         setIsCancelling(false);
      }
   };

   return {
      formData,
      tripulacao,
      camposEspeciais,
      isEditable,
      isReadOnlyMode,
      toggleReadOnlyMode,
      isSaving,
      isApproving,
      error,
      validationErrors,
      formValidationErrors,
      hasChanges,
      handleRemoveEtapa,
      updateEtapa,
      addEtapa,
      updateFormData,
      addTripulante,
      removeTripulante,
      updateCamposEspeciais,
      updateEtiquetas,
      resetForm,
      handleSubmit,
      handleElaborar,
      handleCancelar,
      isCancelling,
      clearError,
      clearValidationErrors,
   };
};
