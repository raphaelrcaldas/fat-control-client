/**
 * Tipos para respostas padronizadas da API (ApiResponse wrapper)
 */

export type ResponseStatus = "success" | "error" | "warning";

export interface ApiResponse<T = unknown> {
   status: ResponseStatus;
   data: T | null;
   message: string | null;
   errors: Record<string, unknown> | null;
   timestamp: string;
}

export interface ApiPaginatedResponse<T = unknown> extends ApiResponse<T[]> {
   total: number;
   page: number;
   per_page: number;
   pages: number;
   total_items: number | null;
}

export interface ApiResult<T = unknown> {
   ok: boolean;
   data: T | null;
   message: string | null;
   errors: Record<string, unknown> | null;
}
