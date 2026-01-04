/**
 * Status de ordens de missão (valores salvos no banco em minúsculo)
 */

export const STATUS_OPTIONS = [
   "rascunho",
   "aprovada",
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
   // finalizada: "Finalizada",
   // revisada: "Revisada",
};

/**
 * Configuração visual para cada status (cores Tailwind)
 */
export const STATUS_CONFIG: Record<
   StatusType,
   { bg: string; text: string; border: string; label: string }
> = {
   rascunho: {
      bg: "bg-slate-100",
      text: "text-slate-700",
      border: "border-slate-300",
      label: "Rascunho",
   },
   aprovada: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      border: "border-blue-300",
      label: "Aprovada",
   },
   // finalizada: {
   //    bg: "bg-emerald-100",
   //    text: "text-emerald-700",
   //    border: "border-emerald-300",
   //    label: "Finalizada",
   // },
   // revisada: {
   //    bg: "bg-violet-100",
   //    text: "text-violet-700",
   //    border: "border-violet-300",
   //    label: "Revisada",
   // },
};

/**
 * Retorna a configuração visual de um status
 */
export function getStatusConfig(status: StatusType) {
   return STATUS_CONFIG[status];
}
