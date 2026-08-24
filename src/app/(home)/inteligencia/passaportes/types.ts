import type { DateStatus } from "@/utils/dateStatus";
import type { LocalPassaporte } from "services/routes/inteligencia/passaportes";

export type SortField = "militar" | "validade_passaporte" | "validade_visa";
export type SortDirection = "asc" | "desc";
export type StatusFilter = "all" | "expired" | "critical" | "warning" | "valid";
/** Filtro de custódia; "all" desliga o recorte. */
export type LocalFilter = "all" | LocalPassaporte;

/** Status que entram nas contagens da SummaryBar (exclui "empty"). */
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
   /** Lista fechada — nunca "" (a coluna é NOT NULL no backend). */
   local_passaporte: LocalPassaporte;
}
