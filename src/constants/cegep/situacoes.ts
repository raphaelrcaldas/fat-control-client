/**
 * Configuração de situações de missão/comissionamento
 */

export type SituacaoType = "c" | "d" | "g";

export interface SituacaoConfig {
   label: string;
   short: string;
   bg: string;
   text: string;
   border: string;
}

export const SITUACAO_CONFIG: Record<SituacaoType, SituacaoConfig> = {
   c: {
      label: "Comissionado",
      short: "C",
      bg: "bg-emerald-100",
      text: "text-emerald-700",
      border: "border-emerald-300",
   },
   d: {
      label: "Descomissionado",
      short: "D",
      bg: "bg-red-100",
      text: "text-red-700",
      border: "border-red-300",
   },
   g: {
      label: "Gestão",
      short: "G",
      bg: "bg-blue-100",
      text: "text-blue-700",
      border: "border-blue-300",
   },
};

/**
 * Retorna a configuração de uma situação
 */
export function getSituacaoConfig(situacao: SituacaoType): SituacaoConfig {
   return SITUACAO_CONFIG[situacao];
}
