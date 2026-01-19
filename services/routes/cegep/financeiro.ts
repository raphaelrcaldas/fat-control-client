import request from "../../Api";
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
   page?: number;
   limit?: number;
   tipo_doc?: string[];
   n_doc?: number;
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
   return (await request("GET", financeiroRoute, null, search, signal)).json();
}
