import request from "../../Api";
import type { ApiPaginatedResponse } from "@/types/api";
import { Missao, UserMission } from "./missoes";
import { cegepRoute } from ".";

const financeiroRoute = cegepRoute + "financeiro/pgts";

export interface PaginatedResponse<T> {
   items: T[];
   total: number;
   page: number;
   limit: number;
   total_pages: number;
}

export interface PagamentoRecord {
   user_mis: UserMission;
   missao: Missao;
}

export interface PagamentosFilters {
   [key: string]: string | number | string[] | undefined;
   page?: number;
   limit?: number;
   tipo_doc?: string[];
   n_doc?: string;
   tipo?: string[];
   sit?: string[];
   user?: string;
   ini?: string;
   fim?: string;
}

export async function getPgts(
   search?: PagamentosFilters,
   signal?: AbortSignal
): Promise<PaginatedResponse<PagamentoRecord>> {
   const response = await request("GET", financeiroRoute, null, search, signal);
   const json =
      (await response.json()) as ApiPaginatedResponse<PagamentoRecord>;
   if (!response.ok) {
      throw new Error(
         json.message || `Erro ao buscar pagamentos (${response.status})`
      );
   }
   return {
      items: json.data || [],
      total: json.total,
      page: json.page,
      limit: json.per_page,
      total_pages: json.pages,
   };
}
