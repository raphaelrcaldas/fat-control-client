import request, { parseApiResponse, readApiData } from "../Api";
import type { ApiPaginatedResponse, ApiResponse, ApiResult } from "@/types/api";

const tripRoute = "ops/trips/";

import { UserPublic } from "./users";
import { TripFuncFields } from "./funcs";

export interface CrewMember extends TripFuncFields {
   id?: number;
   trig: string;
   user: UserPublic;
   active: boolean;
}

/**
 * Detalhe completo de um tripulante (GET /ops/trips/{id}), usado na página
 * dedicada `ops/trip/[id]`. Diferente de `CrewMember` (listagem), aqui `id`
 * é obrigatório — não "consertar" `CrewMember` com isso, ele é usado em
 * contextos onde o registro ainda não tem id (linha nova da grade).
 */
export interface TripDetail extends TripFuncFields {
   id: number;
   trig: string;
   active: boolean;
   user: UserPublic;
}

export interface SearchTripsParams {
   func: string;
   q?: string;
   proj?: string;
}

export interface GetTripsParams {
   [key: string]: string | number | boolean | string[] | undefined;
   active?: boolean;
   include_inactive?: boolean;
   page?: number;
   per_page?: number;
   search?: string;
   p_g?: string[];
   func?: string[];
   oper?: string[];
}

export interface PaginatedTripsResponse {
   items: CrewMember[];
   total: number;
   page: number;
   per_page: number;
   pages: number;
}

// Campos consumidos na seleção do relatório; a listagem reutiliza CrewMember.
export type TripSearchItem = Pick<CrewMember, "trig" | "active" | "user"> & {
   id: number;
};
export interface CreateTripData extends TripFuncFields {
   user_id: number;
   active: boolean;
   trig: string;
}

export interface UpdateTripData extends TripFuncFields {
   trig: string;
   active: boolean;
}

export async function getTrips(
   params: GetTripsParams,
   signal?: AbortSignal
): Promise<PaginatedTripsResponse> {
   // Converter parâmetros para Record<string, string | number>
   const queryParams: Record<string, string | number> = {};
   if (params.active !== undefined) queryParams.active = String(params.active);
   if (params.include_inactive) queryParams.include_inactive = "true";
   if (params.page) queryParams.page = params.page;
   if (params.per_page) queryParams.per_page = params.per_page;
   if (params.search) queryParams.search = params.search;
   // Filtros de array - converter para string separada por vírgula
   if (params.p_g && params.p_g.length > 0)
      queryParams.p_g = params.p_g.join(",");
   if (params.func && params.func.length > 0)
      queryParams.func = params.func.join(",");
   if (params.oper && params.oper.length > 0)
      queryParams.oper = params.oper.join(",");

   const response = await request("GET", tripRoute, null, queryParams, signal);
   const json = await readApiData<ApiPaginatedResponse<CrewMember>>(response);

   return {
      items: json.data || [],
      total: json.total,
      page: json.page,
      per_page: json.per_page,
      pages: json.pages,
   };
}

/**
 * Todos os tripulantes que atendem aos filtros, respeitando o teto de
 * `per_page = 100` do backend (acima disso ele responde 422). Para seleções
 * que não podem esconder ninguém, como a matrícula do PAOP.
 */
export async function getAllTrips(
   params: Omit<GetTripsParams, "page" | "per_page">,
   signal?: AbortSignal
): Promise<CrewMember[]> {
   const PER_PAGE = 100;
   const firstPage = await getTrips(
      { ...params, page: 1, per_page: PER_PAGE },
      signal
   );
   // `Map` por `id`: um cadastro entre a página 1 e a 2 desloca um item de
   // uma página para a outra e ele viria duplicado.
   const byId = new Map(firstPage.items.map((item) => [item.id, item]));

   for (let page = 2; page <= firstPage.pages; page += 1) {
      const nextPage = await getTrips(
         { ...params, page, per_page: PER_PAGE },
         signal
      );
      nextPage.items.forEach((item) => byId.set(item.id, item));
   }

   return [...byId.values()];
}

export async function getTripUserIds(): Promise<number[]> {
   const response = await request("GET", tripRoute + "user-ids");
   const json = await readApiData<{ data: number[] }>(response);
   return json.data;
}

export async function addTrip(trip: CreateTripData): Promise<ApiResult<null>> {
   return parseApiResponse<null>(await request("POST", tripRoute, trip));
}

export async function updateTrip(
   tripId: number,
   trip: UpdateTripData
): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("PUT", tripRoute + tripId, trip)
   );
}

/**
 * Detalhe completo de um tripulante (página dedicada `ops/trip/[id]`).
 */
export async function getTrip(
   id: number,
   signal?: AbortSignal
): Promise<TripDetail> {
   const response = await request("GET", tripRoute + id, null, null, signal);
   const json = await readApiData<ApiResponse<TripDetail>>(response);
   return json.data as TripDetail;
}

/**
 * Atualização parcial campo-a-campo (página dedicada). Diferente de
 * `updateTrip` (PUT, payload completo, usado no modal/grade), aqui o body é
 * parcial — ver `useUpdateUser` sobre o padrão de erro estruturado.
 */
export async function patchTrip(
   id: number,
   data: Partial<UpdateTripData>
): Promise<ApiResult<null>> {
   return parseApiResponse<null>(await request("PATCH", tripRoute + id, data));
}
