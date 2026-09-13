import request from "../Api";
import type { ApiPaginatedResponse, ApiResponse } from "@/types/api";
import type { PaginatedResponse } from "./users";

const logsRoute = "logs/";

export interface LogUser {
   id: number;
   p_g: string;
   nome_guerra: string;
   unidade: string;
}

export interface UserActionLog {
   id: number;
   user: LogUser;
   resource: string;
   resource_id: number | null;
   action: string;
   before: string | null;
   after: string | null;
   timestamp: string;
}

interface LogFilters {
   user_id?: number;
   resource?: string;
   resource_id?: number;
   action?: string;
   search?: string; // nome de guerra ou nome completo do autor
   start?: string; // formato ISO: '2025-07-23'
   end?: string;
   page?: number;
   per_page?: number;
}

export async function getUserActionLogs(
   filters: LogFilters = {}
): Promise<UserActionLog[]> {
   // Remove undefined values and ensure all values are string or number
   const params: Record<string, string | number> = {};
   Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
         params[key] = value;
      }
   });

   const res = await request("GET", `${logsRoute}user-actions`, null, params);
   const json = (await res.json()) as ApiResponse<UserActionLog[]>;

   if (!res.ok) {
      throw new Error(json.message || "Erro ao buscar logs de usuário");
   }

   return json.data || [];
}

/**
 * Versão paginada da listagem — expõe o envelope (total/page/pages) que o
 * backend já devolve. `getUserActionLogs` continua devolvendo só a lista
 * para os consumidores que não paginam (histórico do indisp, home).
 */
export async function getUserActionLogsPage(
   filters: LogFilters = {},
   signal?: AbortSignal
): Promise<PaginatedResponse<UserActionLog>> {
   const params: Record<string, string | number> = {};
   Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
         params[key] = value;
      }
   });

   const res = await request(
      "GET",
      `${logsRoute}user-actions`,
      null,
      params,
      signal
   );
   const json = (await res.json()) as ApiPaginatedResponse<UserActionLog>;

   if (!res.ok) {
      throw new Error(json.message || "Erro ao buscar logs de usuário");
   }

   return {
      items: json.data || [],
      total: json.total,
      page: json.page,
      per_page: json.per_page,
      pages: json.pages,
   };
}

/**
 * Carrega o histórico completo de um recurso, respeitando a paginação do
 * backend. A listagem administrativa continua paginada; esta função é para
 * timelines individuais, que não podem omitir eventos antigos em silêncio.
 */
export async function getAllUserActionLogs(
   filters: LogFilters = {},
   signal?: AbortSignal
): Promise<UserActionLog[]> {
   const firstPage = await getUserActionLogsPage(
      { ...filters, page: 1, per_page: 100 },
      signal
   );
   // `Map` por `id`: um log inserido entre a busca da página 1 e da página 2
   // desloca um item de uma página para a outra e ele viria duplicado — key
   // repetida no React e evento contado duas vezes na trilha.
   const byId = new Map(firstPage.items.map((item) => [item.id, item]));

   for (let page = 2; page <= firstPage.pages; page += 1) {
      const nextPage = await getUserActionLogsPage(
         { ...filters, page, per_page: 100 },
         signal
      );
      nextPage.items.forEach((item) => byId.set(item.id, item));
   }

   return [...byId.values()];
}

export async function deleteUserActionLog(id: number): Promise<void> {
   const res = await request("DELETE", `${logsRoute}user-actions/${id}`);
   const json = (await res.json()) as ApiResponse<null>;
   if (!res.ok) {
      throw new Error(json.message || "Erro ao excluir log");
   }
}
