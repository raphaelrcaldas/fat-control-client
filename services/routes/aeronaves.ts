import request, { parseApiResponse, readApiData } from "../Api";
import type { ApiPaginatedResponse, ApiResponse, ApiResult } from "@/types/api";

const aeronaveRoute = "ops/aeronaves/";

export interface ProjetoAnvOut {
   id_projeto: string;
   modelo: string;
}

export interface AeronavePublic {
   matricula: string;
   active: boolean;
   sit: string;
   obs: string | null;
   is_sim: boolean;
   projeto: string;
   proj: ProjetoAnvOut;
   updated_at: string | null;
}

export interface AeronaveCreate {
   matricula: string;
   active: boolean;
   sit: string;
   obs: string | null;
   is_sim?: boolean;
   projeto: string;
}

export interface AeronaveUpdate {
   active?: boolean;
   sit?: string;
   obs?: string | null;
   is_sim?: boolean;
}

export interface PaginatedResponse<T> {
   items: T[];
   total: number;
   page: number;
   per_page: number;
   pages: number;
}

export interface GetAeronavesParams {
   sit?: string;
   active?: boolean;
   is_sim?: boolean;
   page?: number;
   per_page?: number;
}

export async function getAeronaves(
   params?: GetAeronavesParams,
   signal?: AbortSignal
): Promise<PaginatedResponse<AeronavePublic>> {
   const queryParams = params
      ? {
           ...(params.sit && { sit: params.sit }),
           ...(params.active !== undefined && {
              active: params.active.toString(),
           }),
           ...(params.is_sim !== undefined && {
              is_sim: params.is_sim.toString(),
           }),
           ...(params.page !== undefined && { page: params.page.toString() }),
           ...(params.per_page !== undefined && {
              per_page: params.per_page.toString(),
           }),
        }
      : undefined;
   const response = await request(
      "GET",
      aeronaveRoute,
      null,
      queryParams,
      signal
   );
   const json =
      await readApiData<ApiPaginatedResponse<AeronavePublic>>(response);
   return {
      items: json.data || [],
      total: json.total,
      page: json.page,
      per_page: json.per_page,
      pages: json.pages,
   };
}

/**
 * Busca a frota inteira, esgotando a paginação.
 *
 * O backend valida `per_page` com `Query(ge=1, le=100)`: pedir mais de 100
 * responde 422, então não há como trazer a frota numa chamada só quando a org
 * passa de 100 aeronaves. Aqui paginamos de 100 em 100 até `page >= pages` (o
 * `pages` que a própria resposta já traz), com um teto de iterações como trava
 * de sanidade: uma resposta malformada (`pages` não decrescendo) não pode
 * travar o browser em loop infinito.
 */
export async function getAllAeronaves(
   params?: Omit<GetAeronavesParams, "page" | "per_page">,
   signal?: AbortSignal
): Promise<AeronavePublic[]> {
   const PER_PAGE = 100;
   const MAX_ITERATIONS = 50; // 50 * 100 = 5000 aeronaves; folga generosa sobre qualquer frota real

   const items: AeronavePublic[] = [];

   for (let page = 1; page <= MAX_ITERATIONS; page++) {
      const response = await getAeronaves(
         { ...params, page, per_page: PER_PAGE },
         signal
      );
      items.push(...response.items);
      if (page >= response.pages) break;
   }

   return items;
}

export async function createAeronave(
   data: AeronaveCreate
): Promise<ApiResult<AeronavePublic>> {
   return parseApiResponse<AeronavePublic>(
      await request("POST", aeronaveRoute, data)
   );
}

export async function updateAeronave(
   matricula: string,
   data: AeronaveUpdate
): Promise<ApiResult<AeronavePublic>> {
   return parseApiResponse<AeronavePublic>(
      await request("PUT", aeronaveRoute + matricula, data)
   );
}

export async function getOrgProjetos(
   signal?: AbortSignal
): Promise<ProjetoAnvOut[]> {
   const response = await request(
      "GET",
      aeronaveRoute + "projetos",
      null,
      undefined,
      signal
   );
   const json = await readApiData<ApiResponse<ProjetoAnvOut[]>>(response);
   return (json.data as ProjetoAnvOut[]) || [];
}
