import type { DateStatus } from "@/utils/dateStatus";
import type { StatusPassaporte } from "services/routes/inteligencia/passaportes";

export type SortField = "militar" | "validade_passaporte" | "validade_visa";
export type SortDirection = "asc" | "desc";

/**
 * Recorte pelo farol de VALIDADE (o pior status da linha). Nomeado pela
 * validade, e não "status", porque a tela tem dois eixos de status desde que
 * a coluna `status_passaporte` entrou — este aqui é o do vencimento.
 */
export type ValidadeFilter =
   "all" | "expired" | "critical" | "warning" | "valid";

/** Recorte pela situação física do documento; "all" desliga o recorte. */
export type StatusPassaporteFilter = "all" | StatusPassaporte;

/** Status de validade que entram nas contagens da SummaryBar (exclui "empty"). */
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
   status_passaporte: StatusPassaporte;
}
