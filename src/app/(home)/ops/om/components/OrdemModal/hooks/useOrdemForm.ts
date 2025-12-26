import { useState, useEffect } from "react";
import {
   OrdemMissao,
   TripulacaoOrdem,
   TripulanteSearchResult,
   FuncaoTripulante,
   CampoEspecial,
} from "../../../types";
import {
   createDefaultOrdem,
   generateNumero,
   createEtapaWithOrigem,
} from "../utils/ordemUtils";

interface UseOrdemFormProps {
   ordem: OrdemMissao | null;
   isNew: boolean;
   isCloning?: boolean;
   onSave: (ordem: OrdemMissao) => void;
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
            status: "Rascunho",
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
            status: "Rascunho",
         });
      } else {
         setFormData(ordem);
      }
      setTripulacao(ordem.tripulacao || createDefaultTripulacao());
      setCamposEspeciais(ordem.camposEspeciais || []);
   }, [ordem, isCloning]);

   const isEditable = formData.status === "Rascunho";

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

      // Validação: se mudou o destino, atualizar a origem da próxima etapa
      if (field === "destino" && index < newEtapas.length - 1) {
         newEtapas[index + 1] = { ...newEtapas[index + 1], origem: value };
      }

      setFormData({ ...formData, etapas: newEtapas });
   };

   const updateFormData = (updates: Partial<OrdemMissao>) => {
      if (!isEditable) return;
      setFormData({ ...formData, ...updates });
   };

   // Função de comparação para ordenação por antiguidade
   const sortByAntiguidade = (
      a: TripulanteSearchResult,
      b: TripulanteSearchResult
   ) => {
      // Primeiro, ordenar por antiguidade do posto (menor é mais antigo/superior)
      if (a.posto_ant !== b.posto_ant) {
         return a.posto_ant - b.posto_ant;
      }
      // Segundo, ordenar por última promoção (mais antiga primeiro)
      const promoA = a.ult_promo || "";
      const promoB = b.ult_promo || "";
      return promoA.localeCompare(promoB);
   };

   // Adicionar tripulante a uma função
   const addTripulante = (
      funcao: FuncaoTripulante,
      tripulante: TripulanteSearchResult
   ) => {
      if (!isEditable) return;
      // Evitar duplicatas na mesma função
      if (tripulacao[funcao].some((t) => t.id === tripulante.id)) return;

      // Adiciona e ordena por antiguidade
      const updatedList = [...tripulacao[funcao], tripulante].sort(
         sortByAntiguidade
      );

      setTripulacao({
         ...tripulacao,
         [funcao]: updatedList,
      });
   };

   // Remover tripulante de uma função
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
   };

   const updateCamposEspeciais = (campos: CampoEspecial[]) => {
      if (!isEditable) return;
      setCamposEspeciais(campos);
   };

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const shouldGenerateNew = isNew || isCloning;
      const numero = shouldGenerateNew ? generateNumero() : formData.numero;
      const id = shouldGenerateNew ? Date.now() : ordem?.id || Date.now();
      onSave({
         ...formData,
         numero,
         status: "Rascunho",
         id,
         tripulacao,
         camposEspeciais,
      });
   };

   const validateForm = (): { isValid: boolean; errors: string[] } => {
      const errors: string[] = [];

      // Validar campos da missão
      if (!formData.documentoReferencia.trim()) {
         errors.push("Documento de Referência é obrigatório");
      }
      if (!formData.matriculaAeronave || formData.matriculaAeronave === 0) {
         errors.push("Matrícula da Aeronave é obrigatória");
      }
      if (!formData.tipo.trim()) {
         errors.push("Tipo da missão é obrigatório");
      }

      // Validar etapas
      if (formData.etapas.length === 0) {
         errors.push("Pelo menos uma etapa é obrigatória");
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
         if (!etapa.tempoVooEtapa.trim()) {
            errors.push(`Etapa ${etapaNum}: Tempo de voo é obrigatório`);
         }
         if (!etapa.quantidadeCombustivel.trim()) {
            errors.push(
               `Etapa ${etapaNum}: Quantidade de combustível é obrigatória`
            );
         }
         if (!etapa.esforcoAereo.trim()) {
            errors.push(`Etapa ${etapaNum}: Esforço aéreo é obrigatório`);
         }

         // Validar que a origem deve ser o destino da etapa anterior
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

   const handleElaborar = () => {
      const validation = validateForm();

      if (!validation.isValid) {
         alert(
            "Não é possível elaborar a ordem. Corrija os seguintes erros:\n\n" +
               validation.errors.join("\n")
         );
         return;
      }

      const shouldGenerateNew = isNew || isCloning;
      const numero = shouldGenerateNew ? generateNumero() : formData.numero;
      const id = shouldGenerateNew ? Date.now() : ordem?.id || Date.now();
      onSave({
         ...formData,
         numero,
         status: "Elaborada",
         id,
         tripulacao,
         camposEspeciais,
      });
   };

   return {
      formData,
      tripulacao,
      camposEspeciais,
      isEditable,
      handleInsertEtapa,
      handleRemoveEtapa,
      handleEtapaChange,
      updateFormData,
      addTripulante,
      removeTripulante,
      updateCamposEspeciais,
      resetForm,
      handleSubmit,
      handleElaborar,
   };
};
