/**
 * Tipos de indisponibilidade de tripulantes
 */

export type IndispType =
   | "svc"
   | "sde"
   | "rep"
   | "fer"
   | "lic"
   | "mis"
   | "odm"
   | "pes";

export interface IndispOption {
   value: IndispType;
   label: string;
   color: {
      button: string;
      bg: string;
   };
}

export const INDISP_OPTIONS: IndispOption[] = [
   {
      value: "svc",
      label: "Serviço",
      color: {
         button: "bg-amber-400 enabled:hover:bg-amber-700",
         bg: "bg-amber-200",
      },
   },
   {
      value: "sde",
      label: "Saúde",
      color: {
         button: "bg-red-500 enabled:hover:bg-red-800",
         bg: "bg-red-100",
      },
   },
   {
      value: "rep",
      label: "Representação",
      color: {
         button: "bg-red-500 enabled:hover:bg-red-800",
         bg: "bg-red-100",
      },
   },
   {
      value: "fer",
      label: "Férias",
      color: {
         button: "bg-red-500 enabled:hover:bg-red-800",
         bg: "bg-red-100",
      },
   },
   {
      value: "lic",
      label: "Licença",
      color: {
         button: "bg-red-500 enabled:hover:bg-red-800",
         bg: "bg-red-100",
      },
   },
   {
      value: "mis",
      label: "Missão",
      color: {
         button: "bg-orange-500 enabled:hover:bg-orange-800",
         bg: "bg-orange-100",
      },
   },
   {
      value: "odm",
      label: "Ordem de Missão",
      color: {
         button: "bg-rose-700 enabled:hover:bg-rose-900",
         bg: "bg-rose-200",
      },
   },
   {
      value: "pes",
      label: "Particular",
      color: {
         button: "bg-blue-700 enabled:hover:bg-blue-800",
         bg: "bg-blue-200",
      },
   },
];

/**
 * Labels com emoji para exibição
 */
export const INDISP_LABELS_EMOJI: Record<IndispType, string> = {
   svc: "🔧 Serviço",
   sde: "🏥 Saúde",
   rep: "🤝 Representação",
   fer: "🌴 Férias",
   lic: "📄 Licença",
   mis: "✈️ Missão",
   odm: "🪖 Ordem de Missão",
   pes: "🏡 Particular",
};

/**
 * Busca uma opção de indisponibilidade pelo valor
 */
export function getIndispOption(mtv: string): IndispOption | undefined {
   return INDISP_OPTIONS.find((item) => item.value === mtv);
}

/**
 * Retorna o label com emoji de uma indisponibilidade
 */
export function getIndispLabel(mtv: IndispType, withEmoji = true): string {
   if (withEmoji) {
      return INDISP_LABELS_EMOJI[mtv];
   }
   const option = getIndispOption(mtv);
   return option?.label || mtv;
}
