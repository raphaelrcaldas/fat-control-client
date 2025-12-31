import { useState, useEffect } from "react";
import {
   OrdemMissao,
   TripulacaoOrdem,
   TripulanteSearchResult,
   FuncaoTripulante,
   CampoEspecial,
   Etiqueta,
} from "../../../types";
import {
   createDefaultOrdem,
   generateNumero,
   createEtapaWithOrigem,
} from "../utils/ordemUtils";
import { createOrdem, updateOrdem } from "services/routes/om";
import { ordemToApiCreate, ordemToApiUpdate } from "../../../transformers";

interface UseOrdemFormProps {
   ordem: OrdemMissao | null;
   isNew: boolean;
   isCloning?: boolean;
   onSave: () => void;
}

const createDefaultTripulacao = (): TripulacaoOrdem => ({
   pil: [],
   mc: [],
   lm: [],
   tf: [],
   oe: [],
   os: [],
});

export const useOrdemForm = ({
   ordem,
   isNew,
   isCloning = false,
   onSave,
}: UseOrdemFormProps) => {
   const createInitialFormData = (): OrdemMissao => {
      if (!ordem) return createDefaultOrdem();
      if (isCloning) {
         return {
            ...ordem,
            id: 0,
            numero: "",
            status: "rascunho",
         };
      }
      return ordem;
   };

   const [formData, setFormData] = useState<OrdemMissao>(
      createInitialFormData()
   );
   const [tripulacao, setTripulacao] = useState<TripulacaoOrdem>(
      ordem?.tripulacao || createDefaultTripulacao()
   );
   const [camposEspeciais, setCamposEspeciais] = useState<CampoEspecial[]>(
      ordem?.camposEspeciais || []
   );

   // Estados de loading e erro
   const [isSaving, setIsSaving] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [formValidationErrors, setFormValidationErrors] = useState<string[]>(
      []
   );

   // Sincronizar o formData quando a ordem ou isCloning mudar
   useEffect(() => {
      if (!ordem) {
         setFormData(createDefaultOrdem());
         setTripulacao(createDefaultTripulacao());
         setCamposEspeciais([]);
         return;
      }

      if (isCloning) {
         setFormData({
            ...ordem,
            id: 0,
            numero: "",
            status: "rascunho",
         });
      } else {
         setFormData(ordem);
      }
      setTripulacao(ordem.tripulacao || createDefaultTripulacao());
      setCamposEspeciais(ordem.camposEspeciais || []);
   }, [ordem, isCloning]);

   const isEditable = formData.status === "rascunho";

   const handleInsertEtapa = (afterIndex: number) => {
      if (!isEditable) return;
      const newEtapas = [...formData.etapas];
      const currentEtapa = newEtapas[afterIndex];
      const newEtapa = createEtapaWithOrigem(
         currentEtapa.destino,
         currentEtapa.esforcoAereo
      );
      newEtapas.splice(afterIndex + 1, 0, newEtapa);
      setFormData({
         ...formData,
         etapas: newEtapas,
      });
   };

   const handleRemoveEtapa = (index: number) => {
      if (!isEditable || formData.etapas.length <= 1) return;
      setFormData({
         ...formData,
         etapas: formData.etapas.filter((_, i) => i !== index),
      });
   };

   const handleEtapaChange = (index: number, field: string, value: string) => {
      if (!isEditable) return;
      const newEtapas = [...formData.etapas];
      newEtapas[index] = { ...newEtapas[index], [field]: value };

      // Validacao: se mudou o destino, atualizar a origem da proxima etapa
      if (field === "destino" && index < newEtapas.length - 1) {
         newEtapas[index + 1] = { ...newEtapas[index + 1], origem: value };
      }

      setFormData({ ...formData, etapas: newEtapas });
   };

   const updateFormData = (updates: Partial<OrdemMissao>) => {
      if (!isEditable) return;
      setFormData({ ...formData, ...updates });
   };

   // Funcao de comparacao para ordenacao por antiguidade
   const sortByAntiguidade = (
      a: TripulanteSearchResult,
      b: TripulanteSearchResult
   ) => {
      if (a.posto_ant !== b.posto_ant) {
         return a.posto_ant - b.posto_ant;
      }
      const promoA = a.ult_promo || "";
      const promoB = b.ult_promo || "";
      return promoA.localeCompare(promoB);
   };

   const addTripulante = (
      funcao: FuncaoTripulante,
      tripulante: TripulanteSearchResult
   ) => {
      if (!isEditable) return;
      if (tripulacao[funcao].some((t) => t.id === tripulante.id)) return;

      const updatedList = [...tripulacao[funcao], tripulante].sort(
         sortByAntiguidade
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
      setFormData(ordem || createDefaultOrdem());
      setTripulacao(ordem?.tripulacao || createDefaultTripulacao());
      setCamposEspeciais(ordem?.camposEspeciais || []);
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

   // Validacao de campos individuais para feedback visual em tempo real
   const getValidationErrors = () => {
      return {
         tipo: !formData.tipo.trim(),
         matriculaAeronave:
            !formData.matriculaAeronave || formData.matriculaAeronave === 0,
         etapas: formData.etapas.length === 0,
         piloto: tripulacao.pil.length === 0,
         mecanico: tripulacao.mc.length === 0,
         loadmaster: tripulacao.lm.length === 0,
      };
   };

   const validationErrors = getValidationErrors();

   const hasRequiredFields =
      !validationErrors.tipo &&
      !validationErrors.matriculaAeronave &&
      !validationErrors.etapas &&
      !validationErrors.piloto &&
      !validationErrors.mecanico &&
      !validationErrors.loadmaster;

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

      formData.etapas.forEach((etapa, index) => {
         const etapaNum = index + 1;

         if (!etapa.origem.trim()) {
            errors.push(`Etapa ${etapaNum}: Origem é obrigatória`);
         }
         if (!etapa.destino.trim()) {
            errors.push(`Etapa ${etapaNum}: Destino é obrigatório`);
         }
         if (!etapa.dataDecolagem.trim()) {
            errors.push(`Etapa ${etapaNum}: Data de decolagem é obrigatória`);
         }
         if (!etapa.horaDecolagem.trim()) {
            errors.push(`Etapa ${etapaNum}: Hora de decolagem é obrigatória`);
         }
         if (!etapa.dataPouso.trim()) {
            errors.push(`Etapa ${etapaNum}: Data de pouso é obrigatória`);
         }
         if (!etapa.horaPouso.trim()) {
            errors.push(`Etapa ${etapaNum}: Hora de pouso é obrigatória`);
         }
         if (!etapa.quantidadeCombustivel.trim()) {
            errors.push(
               `Etapa ${etapaNum}: Quantidade de combustivel é obrigatória`
            );
         }
         if (!etapa.esforcoAereo.trim()) {
            errors.push(`Etapa ${etapaNum}: Esforco aéreo é obrigatório`);
         }
         if (!etapa.alternativa.trim()) {
            errors.push(`Etapa ${etapaNum}: Alternativa é obrigatória`);
         }
         if (!etapa.tempoVooAlternativa.trim()) {
            errors.push(
               `Etapa ${etapaNum}: Tempo de voo alternativa é obrigatório`
            );
         } else {
            // Validar tempo de voo alternativa >= 5 minutos
            const [hours, minutes] = etapa.tempoVooAlternativa
               .split(":")
               .map(Number);
            const totalMinutes = (hours || 0) * 60 + (minutes || 0);
            if (totalMinutes < 5) {
               errors.push(
                  `Etapa ${etapaNum}: Tempo de voo alternativa mínimo e 5 minutos`
               );
            }
         }

         // Validar tempo de voo da etapa >= 5 minutos
         if (
            etapa.dataDecolagem &&
            etapa.horaDecolagem &&
            etapa.dataPouso &&
            etapa.horaPouso
         ) {
            const decolagem = new Date(
               `${etapa.dataDecolagem}T${etapa.horaDecolagem}`
            );
            const pouso = new Date(`${etapa.dataPouso}T${etapa.horaPouso}`);
            const diffMinutes = (pouso.getTime() - decolagem.getTime()) / 60000;

            if (diffMinutes > 0 && diffMinutes < 5) {
               errors.push(
                  `Etapa ${etapaNum}: Tempo de voo da etapa minimo e 5 minutos`
               );
            }
         }

         if (index > 0 && etapa.origem !== formData.etapas[index - 1].destino) {
            errors.push(
               `Etapa ${etapaNum}: A origem deve ser igual ao destino da etapa anterior (${
                  formData.etapas[index - 1].destino
               })`
            );
         }
      });

      return {
         isValid: errors.length === 0,
         errors,
      };
   };

   // Validacao minima para salvar rascunho (campos obrigatorios da API)
   const validateDraft = (): { isValid: boolean; errors: string[] } => {
      const errors: string[] = [];

      formData.etapas.forEach((etapa, index) => {
         const etapaNum = index + 1;

         // Campos obrigatorios para a API
         if (!etapa.dataDecolagem?.trim()) {
            errors.push(`Etapa ${etapaNum}: Data de decolagem é obrigatória`);
         }
         if (!etapa.horaDecolagem?.trim()) {
            errors.push(`Etapa ${etapaNum}: Hora de decolagem é obrigatória`);
         }
         if (!etapa.origem?.trim()) {
            errors.push(`Etapa ${etapaNum}: Origem é obrigatória`);
         }
         if (!etapa.dataPouso?.trim()) {
            errors.push(`Etapa ${etapaNum}: Data de pouso é obrigatória`);
         }
         if (!etapa.horaPouso?.trim()) {
            errors.push(`Etapa ${etapaNum}: Hora de pouso é obrigatória`);
         }
         if (!etapa.destino?.trim()) {
            errors.push(`Etapa ${etapaNum}: Destino é obrigatório`);
         }
         if (!etapa.alternativa?.trim()) {
            errors.push(`Etapa ${etapaNum}: Alternativa é obrigatória`);
         }
         if (!etapa.tempoVooAlternativa?.trim()) {
            errors.push(
               `Etapa ${etapaNum}: Tempo de voo alternativa é obrigatório`
            );
         }
         if (!etapa.quantidadeCombustivel?.trim()) {
            errors.push(
               `Etapa ${etapaNum}: Quantidade de combustível é obrigatória`
            );
         }
         if (!etapa.esforcoAereo?.trim()) {
            errors.push(`Etapa ${etapaNum}: Esforço aéreo é obrigatório`);
         }
      });

      return {
         isValid: errors.length === 0,
         errors,
      };
   };

   // Salvar como rascunho
   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      // Valida campos obrigatorios das etapas
      const draftValidation = validateDraft();
      if (!draftValidation.isValid) {
         setFormValidationErrors(draftValidation.errors);
         return;
      }

      setFormValidationErrors([]);
      setIsSaving(true);
      setError(null);

      try {
         const shouldGenerateNew = isNew || isCloning;
         const numero = shouldGenerateNew ? generateNumero() : formData.numero;

         const ordemCompleta: OrdemMissao = {
            ...formData,
            numero,
            status: "rascunho",
            tripulacao,
            camposEspeciais,
         };

         if (shouldGenerateNew) {
            // Criar nova ordem
            const apiData = ordemToApiCreate(ordemCompleta);
            await createOrdem(apiData);
         } else {
            // Atualizar ordem existente
            const apiData = ordemToApiUpdate(ordemCompleta);
            await updateOrdem(formData.id, apiData);
         }

         onSave();
      } catch (err) {
         console.error("Erro ao salvar ordem:", err);
         setError(
            err instanceof Error
               ? err.message
               : "Erro ao salvar ordem de missão"
         );
      } finally {
         setIsSaving(false);
      }
   };

   // Elaborar (aprovar) ordem
   const handleElaborar = async () => {
      const validation = validateForm();

      if (!validation.isValid) {
         setFormValidationErrors(validation.errors);
         return;
      }

      setFormValidationErrors([]);
      setIsSaving(true);
      setError(null);

      try {
         const shouldGenerateNew = isNew || isCloning;
         const numero = shouldGenerateNew ? generateNumero() : formData.numero;

         const ordemCompleta: OrdemMissao = {
            ...formData,
            numero,
            status: "aprovada",
            tripulacao,
            camposEspeciais,
         };

         if (shouldGenerateNew) {
            const apiData = ordemToApiCreate(ordemCompleta);
            await createOrdem(apiData);
         } else {
            const apiData = ordemToApiUpdate(ordemCompleta);
            await updateOrdem(formData.id, apiData);
         }

         onSave();
      } catch (err) {
         console.error("Erro ao elaborar ordem:", err);
         setError(
            err instanceof Error
               ? err.message
               : "Erro ao elaborar ordem de missão"
         );
      } finally {
         setIsSaving(false);
      }
   };

   return {
      formData,
      tripulacao,
      camposEspeciais,
      isEditable,
      isSaving,
      error,
      validationErrors,
      formValidationErrors,
      hasRequiredFields,
      handleInsertEtapa,
      handleRemoveEtapa,
      handleEtapaChange,
      updateFormData,
      addTripulante,
      removeTripulante,
      updateCamposEspeciais,
      updateEtiquetas,
      resetForm,
      handleSubmit,
      handleElaborar,
   };
};
