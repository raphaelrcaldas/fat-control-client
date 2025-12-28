/**
 * Status de ordens de missão
 */

export const STATUS_OPTIONS = [
   "Rascunho",
   "Elaborada",
   "Finalizada",
   "Revisada",
] as const;

export type StatusType = (typeof STATUS_OPTIONS)[number];

/**
 * Configuração visual para cada status (cores Tailwind)
 */
export const STATUS_CONFIG: Record<
   StatusType,
   { bg: string; text: string; border: string }
> = {
   Rascunho: {
      bg: "bg-slate-100",
      text: "text-slate-700",
      border: "border-slate-300",
   },
   Elaborada: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      border: "border-blue-300",
   },
   Finalizada: {
      bg: "bg-emerald-100",
      text: "text-emerald-700",
      border: "border-emerald-300",
   },
   Revisada: {
      bg: "bg-violet-100",
      text: "text-violet-700",
      border: "border-violet-300",
   },
};

/**
 * Retorna a configuração visual de um status
 */
export function getStatusConfig(status: StatusType) {
   return STATUS_CONFIG[status];
}
