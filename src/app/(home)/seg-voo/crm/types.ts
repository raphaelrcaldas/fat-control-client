import type { DateStatus } from "@/utils/dateStatus";

export type SortField = "militar" | "validade";
export type SortDirection = "asc" | "desc";
export type StatusFilter = "all" | "expired" | "critical" | "warning" | "valid";

/**
 * Contagens por status para o StatCard. Diferente de passaportes, o CRM inclui
 * "empty" (militar sem CRM cadastrado) — é informação operacional relevante.
 */
export type StatusCounts = Record<DateStatus, number>;

export interface CrmStats {
   total: number;
   counts: StatusCounts;
}

/** Estado do formulário de edição (strings controladas; "" = vazio). */
export interface CrmFormData {
   data_realizacao: string;
   data_validade: string;
}
