import type { OperStatus, OperTipo } from "services/routes/ops/operacoes";

export const TIPO_LABEL: Record<OperTipo, string> = {
   operacao: "Operação",
   manobra: "Manobra",
   exercicio: "Exercício",
};

/** Classe do "chip" de tipo (pill com ring). */
export const TIPO_CHIP: Record<OperTipo, string> = {
   operacao: "bg-red-50 text-red-700 ring-red-200",
   manobra: "bg-slate-50 text-slate-700 ring-slate-300",
   exercicio: "bg-amber-50 text-amber-700 ring-amber-200",
};

export const STATUS_LABEL: Record<OperStatus, string> = {
   planejada: "Planejada",
   andamento: "Em andamento",
   encerrada: "Encerrada",
   cancelada: "Cancelada",
};

/** Cor do "ponto" de status. */
export const STATUS_DOT: Record<OperStatus, string> = {
   planejada: "bg-amber-400",
   andamento: "bg-emerald-500",
   encerrada: "bg-slate-400",
   cancelada: "bg-rose-400",
};

/** Espinha vertical de status (borda esquerda do card). */
export const STATUS_SPINE: Record<OperStatus, string> = {
   planejada: "bg-amber-400",
   andamento: "bg-emerald-500",
   encerrada: "bg-slate-300",
   cancelada: "bg-rose-400",
};

/** Halo sutil aplicado no hover, na cor do status. */
export const STATUS_GLOW: Record<OperStatus, string> = {
   planejada: "group-hover:shadow-amber-200/60",
   andamento: "group-hover:shadow-emerald-200/60",
   encerrada: "group-hover:shadow-slate-200/60",
   cancelada: "group-hover:shadow-rose-200/60",
};

export const STATUS_TEXT: Record<OperStatus, string> = {
   planejada: "text-amber-600",
   andamento: "text-emerald-600",
   encerrada: "text-slate-500",
   cancelada: "text-rose-600",
};

interface TabAccent {
   border: string;
   text: string;
   pill: string;
}

/**
 * Acento das abas do trilho de status — espelha a cor da espinha do card,
 * para que a cor escolhida no filtro seja a cor vista na lista.
 * `null` (aba "Todas") usa o vermelho do app.
 */
export const STATUS_TAB: Record<OperStatus | "todas", TabAccent> = {
   todas: {
      border: "border-red-600",
      text: "text-red-700",
      pill: "bg-red-100 text-red-700",
   },
   andamento: {
      border: "border-emerald-500",
      text: "text-emerald-700",
      pill: "bg-emerald-100 text-emerald-700",
   },
   encerrada: {
      border: "border-slate-400",
      text: "text-slate-600",
      pill: "bg-slate-200 text-slate-600",
   },
   planejada: {
      border: "border-amber-500",
      text: "text-amber-600",
      pill: "bg-amber-100 text-amber-700",
   },
   cancelada: {
      border: "border-rose-500",
      text: "text-rose-600",
      pill: "bg-rose-100 text-rose-700",
   },
};
