/**
 * Tipos de indisponibilidade de tripulantes
 */

export type IndispType =
   "svc" | "sde" | "rep" | "fer" | "lic" | "mis" | "odm" | "pes" | "ins";

export interface IndispOption {
   value: IndispType;
   label: string;
   color: {
      button: string;
      bg: string;
      /** Cor da sigla estampada na célula — garante contraste AA (≥4.5:1) sobre `button`. */
      sigla: string;
   };
}

export const INDISP_OPTIONS: IndispOption[] = [
   {
      value: "svc",
      label: "Serviço",
      color: {
         button: "bg-amber-400 enabled:hover:bg-amber-700",
         bg: "bg-amber-200",
         // Matiz claro: branco nunca passa AA sobre amber — sigla escura.
         sigla: "text-amber-950",
      },
   },
   {
      value: "sde",
      label: "Saúde",
      color: {
         button: "bg-red-600 enabled:hover:bg-red-800",
         bg: "bg-red-100",
         sigla: "text-white",
      },
   },
   {
      value: "rep",
      label: "Representação",
      color: {
         button: "bg-fuchsia-600 enabled:hover:bg-fuchsia-800",
         bg: "bg-fuchsia-100",
         sigla: "text-white",
      },
   },
   {
      value: "fer",
      label: "Férias",
      color: {
         button: "bg-teal-700 enabled:hover:bg-teal-900",
         bg: "bg-teal-100",
         sigla: "text-white",
      },
   },
   {
      value: "lic",
      label: "Licença",
      color: {
         button: "bg-indigo-600 enabled:hover:bg-indigo-800",
         bg: "bg-indigo-100",
         sigla: "text-white",
      },
   },
   {
      value: "mis",
      label: "Missão",
      color: {
         button: "bg-orange-500 enabled:hover:bg-orange-800",
         bg: "bg-orange-100",
         // Matiz claro: branco nunca passa AA sobre orange — sigla escura.
         sigla: "text-orange-950",
      },
   },
   {
      value: "odm",
      label: "Ordem de Missão",
      color: {
         button: "bg-rose-700 enabled:hover:bg-rose-900",
         bg: "bg-rose-200",
         sigla: "text-white",
      },
   },
   {
      value: "pes",
      label: "Particular",
      color: {
         button: "bg-blue-700 enabled:hover:bg-blue-800",
         bg: "bg-blue-200",
         sigla: "text-white",
      },
   },
   {
      value: "ins",
      label: "CEMAL",
      color: {
         button: "bg-pink-600 enabled:hover:bg-pink-800",
         bg: "bg-pink-100",
         sigla: "text-white",
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
   ins: "🩺 CEMAL",
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
