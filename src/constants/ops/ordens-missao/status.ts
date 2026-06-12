/**
 * Status de ordens de missão (valores salvos no banco em minúsculo)
 */

export const STATUS_OPTIONS = [
   "rascunho",
   "aprovada",
   "cancelada",
   // "finalizada",
   // "revisada",
] as const;

export type StatusType = (typeof STATUS_OPTIONS)[number];

/**
 * Labels para exibição (primeira letra maiúscula)
 */
export const STATUS_LABELS: Record<StatusType, string> = {
   rascunho: "Rascunho",
   aprovada: "Aprovada",
   cancelada: "Cancelada",
   // finalizada: "Finalizada",
   // revisada: "Revisada",
};

/**
 * Configuração visual para cada status (cores Tailwind)
 *
 * - bg/text/border: tons claros para badges e pills
 * - accent: cor sólida saturada para a faixa lateral de status no card
 */
export const STATUS_CONFIG: Record<
   StatusType,
   { bg: string; text: string; border: string; accent: string; label: string }
> = {
   rascunho: {
      bg: "bg-slate-100",
      text: "text-slate-700",
      border: "border-slate-300",
      accent: "bg-slate-400",
      label: "Rascunho",
   },
   aprovada: {
      bg: "bg-green-100",
      text: "text-green-700",
      border: "border-green-300",
      accent: "bg-green-500",
      label: "Aprovada",
   },
   cancelada: {
      bg: "bg-red-100",
      text: "text-red-700",
      border: "border-red-300",
      accent: "bg-red-500",
      label: "Cancelada",
   },
   // finalizada: {
   //    bg: "bg-emerald-100",
   //    text: "text-emerald-700",
   //    border: "border-emerald-300",
   //    accent: "bg-emerald-500",
   //    label: "Finalizada",
   // },
   // revisada: {
   //    bg: "bg-violet-100",
   //    text: "text-violet-700",
   //    border: "border-violet-300",
   //    accent: "bg-violet-500",
   //    label: "Revisada",
   // },
};

/**
 * Retorna a configuração visual de um status
 */
export function getStatusConfig(status: StatusType) {
   return STATUS_CONFIG[status];
}

/**
 * Máquina de estados: transições de ciclo de vida permitidas a partir
 * de cada status. Fonte única de verdade para a UI derivar as ações
 * disponíveis (ex: botões "Aprovar OM" / "Cancelar OM").
 */
export type StatusAction = "aprovar" | "cancelar";

export const STATUS_TRANSITIONS: Record<StatusType, StatusAction[]> = {
   rascunho: ["aprovar"],
   aprovada: ["cancelar"],
   cancelada: [],
   // finalizada: [],
   // revisada: [],
};

/**
 * Retorna as transições disponíveis para um status (lista vazia se o
 * status for desconhecido)
 */
export function getStatusTransitions(status: string): StatusAction[] {
   return STATUS_TRANSITIONS[status as StatusType] ?? [];
}
