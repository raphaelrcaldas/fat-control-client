import { useState, useEffect, useMemo, useRef } from "react";
import type {
   OrdemMissaoOut,
   OrdemMissaoCreate,
   OrdemMissaoUpdate,
   EtapaOut,
   CampoEspecial,
   Etiqueta,
} from "services/routes/om/ordens";
import { type CrewMember } from "services/routes/trips";
import { type FuncaoTripulante } from "@/constants/tripulantes";
import { calcularEsfAer } from "../utils/ordemUtils";
import {
   buildInitialState,
   toOrdemPayload,
   type OrdemFormInitialState,
   type TripulacaoOrdem,
} from "../utils/ordemFormUtils";
import {
   getContinuidadeErrors,
   getDuplicateDtDepErrors,
   getEsfAerMinimoViolado,
   getEtapaRequiredErrors,
   getErroTempoVooMinimo,
   getErroTvooAltMinimo,
   getOverlapErrors,
   type OrdemValidationFlags,
} from "../utils/ordemValidation";
import { useCreateOrdem, useUpdateOrdem } from "@/hooks/queries";
import { minutesToTime } from "utils/dateHandler";
import { compareByAntiguidade } from "utils/sortByAntiguidade";

interface UseOrdemFormProps {
   ordem: OrdemMissaoOut | null;
   isNew: boolean;
   isCloning?: boolean;
   onSave: () => void;
}

export const useOrdemForm = ({
   ordem,
   isNew,
   isCloning = false,
   onSave,
}: UseOrdemFormProps) => {
   // TanStack Query mutations - invalidacao automatica
   const createOrdemMutation = useCreateOrdem();
   const updateOrdemMutation = useUpdateOrdem();

   // Estado inicial calculado UMA vez por mount (o padrão anterior repetia
   // buildInitialState em cada inicializador de useState — 5 execuções)
   const initialRef = useRef<OrdemFormInitialState | null>(null);
   initialRef.current ??= buildInitialState(ordem, isCloning);
   const initial = initialRef.current;

   const [formData, setFormData] = useState<OrdemMissaoOut>(initial.formData);
   const [tripulacao, setTripulacao] = useState<TripulacaoOrdem>(
      initial.tripulacao
   );
   const [camposEspeciais, setCamposEspeciais] = useState<CampoEspecial[]>(
      initial.camposEspeciais
   );
   // Flag de override: true quando o usuário editou o esf_aer manualmente.
   // Enquanto false, o esf_aer espelha exatamente a soma das etapas.
   const [esfAerManual, setEsfAerManual] = useState<boolean>(
      initial.esfAerManual
   );

   // Estado para valores originais (detecção de mudanças)
   const [originalData, setOriginalData] = useState(initial);

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
      const next = buildInitialState(ordem, isCloning);
      initialRef.current = next;

      setFormData(next.formData);
      setTripulacao(next.tripulacao);
      setCamposEspeciais(next.camposEspeciais);
      setEsfAerManual(next.esfAerManual);

      // Atualizar dados originais para detecção de mudanças
      setOriginalData(next);

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

   // Resolve o esf_aer da OM ao gerenciar etapas:
   // - sem override manual: espelha exatamente a soma das etapas (recalcula
   //   inclusive para baixo ao remover/encurtar etapas);
   // - com override manual: preserva o valor alocado, apenas elevando-o ao
   //   mínimo (soma das etapas) para nunca violar a regra esf_aer >= soma.
   const resolveEsfAer = (newEtapas: EtapaOut[]): number => {
      const soma = calcularEsfAer(newEtapas);
      return esfAerManual ? Math.max(formData.esf_aer ?? 0, soma) : soma;
   };

   const handleRemoveEtapa = (index: number) => {
      if (!isEditable || formData.etapas.length <= 1) return;
      const newEtapas = formData.etapas.filter((_, i) => i !== index);
      setFormData({
         ...formData,
         etapas: newEtapas,
         esf_aer: resolveEsfAer(newEtapas),
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

      setFormData({
         ...formData,
         etapas: newEtapas,
         esf_aer: resolveEsfAer(newEtapas),
      });
   };

   // Adicionar nova etapa (usado pelo modal de adição)
   const addEtapa = (etapa: EtapaOut) => {
      if (!isEditable) return;
      const newEtapas = [...formData.etapas, etapa];
      setFormData({
         ...formData,
         etapas: newEtapas,
         esf_aer: resolveEsfAer(newEtapas),
      });
   };

   const updateFormData = (updates: Partial<OrdemMissaoOut>) => {
      if (!isEditable) return;
      // Edição manual do esf_aer marca o override, congelando o recálculo
      // automático a partir das etapas.
      if ("esf_aer" in updates) {
         setEsfAerManual(true);
      }
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
      const next = buildInitialState(ordem, isCloning);
      setFormData(next.formData);
      setTripulacao(next.tripulacao);
      setCamposEspeciais(next.camposEspeciais);
      setEsfAerManual(next.esfAerManual);
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
   const getValidationErrors = (): OrdemValidationFlags => {
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

   // Regras compartilhadas em ../utils/ordemValidation (fonte única
   // também usada por EtapaModal e OrdemBasicInfo)

   // Campos obrigatórios de cada etapa, prefixados com "Etapa N:"
   const collectEtapaRequiredErrors = (etapas: EtapaOut[]): string[] =>
      etapas.flatMap((etapa, index) =>
         getEtapaRequiredErrors(etapa).map(
            (msg) => `Etapa ${index + 1}: ${msg}`
         )
      );

   // esf_aer da ordem >= soma do tempo de voo das etapas
   const collectEsfAerError = (): string[] => {
      const minimo = getEsfAerMinimoViolado(
         formData.esf_aer || 0,
         formData.etapas
      );
      if (minimo === null) return [];
      return [
         `Esforço Aéreo deve ser maior ou igual à soma do tempo de voo das etapas (${minutesToTime(minimo)})`,
      ];
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

      errors.push(...getDuplicateDtDepErrors(formData.etapas));
      errors.push(...getOverlapErrors(formData.etapas));
      errors.push(...collectEtapaRequiredErrors(formData.etapas));

      // Validacoes extras exigidas apenas na aprovacao
      formData.etapas.forEach((etapa, index) => {
         const etapaNum = index + 1;

         const erroTvooAlt = getErroTvooAltMinimo(etapa.tvoo_alt);
         if (erroTvooAlt) {
            errors.push(`Etapa ${etapaNum}: ${erroTvooAlt}`);
         }

         const erroTempoVoo = getErroTempoVooMinimo(etapa);
         if (erroTempoVoo) {
            errors.push(`Etapa ${etapaNum}: ${erroTempoVoo}`);
         }
      });

      errors.push(...getContinuidadeErrors(formData.etapas));
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
         ...getOverlapErrors(formData.etapas),
         ...collectEsfAerError(),
      ];

      return {
         isValid: errors.length === 0,
         errors,
      };
   };

   // Converte o estado atual para o payload da API (regras em ordemFormUtils)
   const prepareApiData = (
      isApproved: boolean = false
   ): OrdemMissaoCreate | OrdemMissaoUpdate =>
      toOrdemPayload(formData, tripulacao, camposEspeciais, {
         isApproved,
         generatesNew: isNew || isCloning,
      });

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

   // Valida a ordem para aprovação exibindo os erros encontrados;
   // usado antes de pedir a confirmação do usuário
   const validateForApproval = (): boolean => {
      const validation = validateForm();
      setFormValidationErrors(validation.errors);
      return validation.isValid;
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
            // O backend sempre cria como rascunho (regra de negócio),
            // então aprovar exige a transição em um segundo passo
            const created = await createOrdemMutation.mutateAsync(
               apiData as OrdemMissaoCreate
            );
            await updateOrdemMutation.mutateAsync({
               id: created.id,
               data: { status: "aprovada" } as OrdemMissaoUpdate,
            });
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
      validateForApproval,
      handleElaborar,
      handleCancelar,
      isCancelling,
      clearError,
      clearValidationErrors,
   };
};
