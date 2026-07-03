// Conversões puras entre o estado do formulário de OM e o formato da API.
// Extraídas do useOrdemForm para manter o hook focado em estado/efeitos.

import type {
   OrdemMissaoOut,
   OrdemMissaoCreate,
   OrdemMissaoUpdate,
   EtapaOut,
   CampoEspecial,
   TripulacaoAgrupada,
   TripulacaoOrdemOut,
} from "services/routes/om/ordens";
import { type CrewMember } from "services/routes/trips";
import {
   FUNCOES_PRINCIPAIS,
   type FuncaoTripulante,
} from "@/constants/tripulantes";
import { createDefaultOrdem, calcularEsfAer } from "./ordemUtils";

// Tripulação agrupada por função — derivada de FuncaoTripulante para não
// repetir a lista de funções (fonte única em constants/tripulantes)
export type TripulacaoOrdem = Record<FuncaoTripulante, CrewMember[]>;

export const createDefaultTripulacao = (): TripulacaoOrdem =>
   Object.fromEntries(
      FUNCOES_PRINCIPAIS.map((funcao) => [funcao, []])
   ) as TripulacaoOrdem;

// Converte o formato de tripulação da API (array) para o agrupado por função
export const convertTripulacaoFromApi = (
   tripulacaoArray: TripulacaoOrdemOut[]
): TripulacaoOrdem => {
   const result = createDefaultTripulacao();

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

export interface OrdemFormInitialState {
   formData: OrdemMissaoOut;
   tripulacao: TripulacaoOrdem;
   camposEspeciais: CampoEspecial[];
   esfAerManual: boolean;
}

// Monta o estado inicial completo do formulário a partir da ordem (ou defaults)
export const buildInitialState = (
   ordem: OrdemMissaoOut | null,
   isCloning: boolean
): OrdemFormInitialState => {
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

   // Considera "override manual" quando o esf_aer salvo é maior que a soma do
   // tempo de voo das etapas (o usuário alocou esforço extra deliberadamente).
   // Caso contrário, o esf_aer é tratado como derivado e recalculado a cada
   // mudança nas etapas (inclusive para baixo).
   const esfAerManual =
      (formData.esf_aer ?? 0) > calcularEsfAer(formData.etapas ?? []);

   return {
      formData,
      tripulacao: ordem?.tripulacao
         ? convertTripulacaoFromApi(ordem.tripulacao)
         : createDefaultTripulacao(),
      camposEspeciais: ordem?.campos_especiais || [],
      esfAerManual,
   };
};

// Ordena etapas por data/hora de decolagem (comparação de string ISO)
export const sortEtapas = (etapas: EtapaOut[]): EtapaOut[] => {
   return [...etapas].sort((a, b) => {
      const dateTimeA = a.dt_dep || "";
      const dateTimeB = b.dt_dep || "";
      return dateTimeA.localeCompare(dateTimeB);
   });
};

interface ToOrdemPayloadOptions {
   isApproved: boolean;
   // true quando a submissão cria uma nova OM (nova ou clonada)
   generatesNew: boolean;
}

// Converte o estado do formulário para o payload esperado pela API
export const toOrdemPayload = (
   formData: OrdemMissaoOut,
   tripulacao: TripulacaoOrdem,
   camposEspeciais: CampoEspecial[],
   { isApproved, generatesNew }: ToOrdemPayloadOptions
): OrdemMissaoCreate | OrdemMissaoUpdate => {
   const etapasOrdenadas = sortEtapas(formData.etapas);

   const tripulacaoAgrupada = FUNCOES_PRINCIPAIS.reduce((acc, funcao) => {
      acc[funcao] = tripulacao[funcao]
         .map((t) => t.id)
         .filter((id): id is number => !!id);
      return acc;
   }, {} as TripulacaoAgrupada);

   return {
      numero: formData.numero,
      doc_ref: formData.doc_ref || "",
      matricula_anv: formData.matricula_anv,
      projeto: formData.projeto,
      tipo: formData.tipo || "",
      status: isApproved
         ? "aprovada"
         : generatesNew
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
