import type { DateStatus } from "@/utils/dateStatus";

export type SortField = "militar" | "validade_passaporte" | "validade_visa";
export type SortDirection = "asc" | "desc";
export type StatusFilter = "all" | "expired" | "critical" | "warning" | "valid";

/** Status que entram nas contagens dos StatCards (exclui "empty"). */
export type CountableStatus = Exclude<DateStatus, "empty">;

export type StatusCounts = Record<CountableStatus, number>;

export interface PassaporteStats {
   total: number;
   counts: StatusCounts;
}

/** Estado do formulário de edição (strings controladas; "" = vazio). */
export interface PassaporteFormData {
   passaporte: string;
   data_expedicao_passaporte: string;
   validade_passaporte: string;
   visa: string;
   data_expedicao_visa: string;
   validade_visa: string;
}
