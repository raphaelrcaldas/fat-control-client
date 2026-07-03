// Fonte única das regras de validação de etapas e esforço aéreo da OM.
// Funções puras consumidas por useOrdemForm (agregado com prefixo
// "Etapa N:"), EtapaModal (por campo, com touched) e OrdemBasicInfo.

import type { EtapaOut } from "services/routes/om/ordens";
import { calcularTempoVooMinutos } from "utils/dateHandler";
import { calcularEsfAer } from "./ordemUtils";

export const TVOO_MINIMO_MINUTOS = 5;

// Flags de validação de campos individuais do formulário de OM, calculadas
// pelo useOrdemForm e consumidas por OrdemBasicInfo/OrdemTripulacao para o
// feedback visual em tempo real (fonte única do shape — não redeclarar)
export interface OrdemValidationFlags {
   tipo: boolean;
   matriculaAeronave: boolean;
   etapas: boolean;
   piloto: boolean;
   mecanico: boolean;
   loadmaster: boolean;
}

// --- Campos obrigatórios de uma etapa ---

export type EtapaRequiredField =
   | "dt_dep"
   | "origem"
   | "dt_arr"
   | "dest"
   | "alternativa"
   | "tvoo_alt"
   | "qtd_comb"
   | "esf_aer";

interface EtapaFieldDef {
   field: EtapaRequiredField;
   // Rótulo curto (rodapé de pendências do EtapaModal)
   label: string;
   // Frase completa (lista de erros agregada do useOrdemForm)
   message: string;
   isMissing: (etapa: Partial<EtapaOut>) => boolean;
}

const ETAPA_REQUIRED_FIELDS: EtapaFieldDef[] = [
   {
      field: "dt_dep",
      label: "Data/hora de decolagem",
      message: "Data/hora de decolagem é obrigatória",
      isMissing: (e) => !e.dt_dep,
   },
   {
      field: "origem",
      label: "Origem",
      message: "Origem é obrigatória",
      isMissing: (e) => !e.origem?.trim(),
   },
   {
      field: "dt_arr",
      label: "Data/hora de pouso",
      message: "Data/hora de pouso é obrigatória",
      isMissing: (e) => !e.dt_arr,
   },
   {
      field: "dest",
      label: "Destino",
      message: "Destino é obrigatório",
      isMissing: (e) => !e.dest?.trim(),
   },
   {
      field: "alternativa",
      label: "Alternativa",
      message: "Alternativa é obrigatória",
      isMissing: (e) => !e.alternativa?.trim(),
   },
   {
      field: "tvoo_alt",
      label: "Tempo de voo alternativa",
      message: "Tempo de voo alternativa é obrigatório",
      isMissing: (e) => !e.tvoo_alt,
   },
   {
      field: "qtd_comb",
      label: "Quantidade de combustível",
      message: "Quantidade de combustível é obrigatória",
      isMissing: (e) => !e.qtd_comb,
   },
   {
      field: "esf_aer",
      label: "Esforço aéreo",
      message: "Esforço aéreo é obrigatório",
      isMissing: (e) => !e.esf_aer?.trim(),
   },
];

// Um campo obrigatório específico está vazio? (erros por campo no modal)
export function isEtapaFieldMissing(
   etapa: Partial<EtapaOut>,
   field: EtapaRequiredField
): boolean {
   const def = ETAPA_REQUIRED_FIELDS.find((d) => d.field === field);
   return def ? def.isMissing(etapa) : false;
}

// Rótulos curtos dos campos pendentes (rodapé do EtapaModal)
export function getEtapaCamposFaltantes(etapa: Partial<EtapaOut>): string[] {
   return ETAPA_REQUIRED_FIELDS.filter((d) => d.isMissing(etapa)).map(
      (d) => d.label
   );
}

// Frases de erro dos campos obrigatórios (sem prefixo "Etapa N:")
export function getEtapaRequiredErrors(etapa: Partial<EtapaOut>): string[] {
   return ETAPA_REQUIRED_FIELDS.filter((d) => d.isMissing(etapa)).map(
      (d) => d.message
   );
}

// --- Regras de valor de uma única etapa ---

// Decolagem deve anteceder o pouso
export function getErroDataHora(etapa: Partial<EtapaOut>): string | null {
   if (!etapa.dt_dep || !etapa.dt_arr) return null;
   if (new Date(etapa.dt_dep) >= new Date(etapa.dt_arr)) {
      return "A data/hora de decolagem deve ser anterior a data/hora de pouso.";
   }
   return null;
}

// Tempo de voo da etapa (dt_arr - dt_dep) >= mínimo
export function getErroTempoVooMinimo(etapa: Partial<EtapaOut>): string | null {
   if (!etapa.dt_dep || !etapa.dt_arr) return null;
   const minutes = calcularTempoVooMinutos(etapa.dt_dep, etapa.dt_arr);
   if (minutes > 0 && minutes < TVOO_MINIMO_MINUTOS) {
      return `Tempo de voo mínimo é ${TVOO_MINIMO_MINUTOS} minutos (calculado: ${minutes} min).`;
   }
   return null;
}

// Tempo de voo para alternativa >= mínimo (quando informado)
export function getErroTvooAltMinimo(
   tvooAlt: number | null | undefined
): string | null {
   if (!tvooAlt) return null;
   if (tvooAlt > 0 && tvooAlt < TVOO_MINIMO_MINUTOS) {
      return `Tempo de voo alternativa mínimo é ${TVOO_MINIMO_MINUTOS} minutos.`;
   }
   return null;
}

// --- Regras entre etapas ---

// Sobreposição de horários entre pares de etapas
export function getOverlapErrors(etapas: Partial<EtapaOut>[]): string[] {
   const errors: string[] = [];
   for (let i = 0; i < etapas.length; i++) {
      for (let j = i + 1; j < etapas.length; j++) {
         const etapa1 = etapas[i];
         const etapa2 = etapas[j];

         if (etapa1.dt_dep && etapa1.dt_arr && etapa2.dt_dep && etapa2.dt_arr) {
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
}

// Etapas com a mesma data/hora de decolagem
export function getDuplicateDtDepErrors(etapas: Partial<EtapaOut>[]): string[] {
   const errors: string[] = [];
   const decolagemPeriodos = new Map<string, number[]>();

   etapas.forEach((etapa, index) => {
      if (!etapa.dt_dep) return;
      const indices = decolagemPeriodos.get(etapa.dt_dep) ?? [];
      indices.push(index + 1);
      decolagemPeriodos.set(etapa.dt_dep, indices);
   });

   decolagemPeriodos.forEach((indices) => {
      if (indices.length > 1) {
         errors.push(
            `Períodos duplicados: As etapas ${indices.join(", ")} possuem a mesma data/hora de decolagem`
         );
      }
   });

   return errors;
}

// Origem de cada etapa deve ser o destino da etapa anterior
export function getContinuidadeErrors(etapas: Partial<EtapaOut>[]): string[] {
   const errors: string[] = [];
   etapas.forEach((etapa, index) => {
      if (index === 0) return;
      const anterior = etapas[index - 1];
      if (etapa.origem !== anterior.dest) {
         errors.push(
            `Etapa ${index + 1}: A origem deve ser igual ao destino da etapa anterior (${anterior.dest})`
         );
      }
   });
   return errors;
}

// --- Esforço aéreo da ordem ---

/**
 * esf_aer da OM deve ser >= soma do tempo de voo das etapas.
 * Retorna a soma (mínimo exigido, em minutos) quando violado; null quando ok.
 * Cada consumidor formata a própria mensagem a partir do mínimo.
 */
export function getEsfAerMinimoViolado(
   esfAer: number,
   etapas: EtapaOut[]
): number | null {
   const soma = calcularEsfAer(etapas);
   if (soma > 0 && esfAer < soma) return soma;
   return null;
}
