import request, { parseApiResponse } from "../Api";
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
   const json = (await response.json()) as ApiPaginatedResponse<CrewMember>;

   return {
      items: json.data || [],
      total: json.total,
      page: json.page,
      per_page: json.per_page,
      pages: json.pages,
   };
}

export async function getTripUserIds(): Promise<number[]> {
   const response = await request("GET", tripRoute + "user-ids");
   const json = (await response.json()) as { data: number[] };
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
   const json = (await response.json()) as ApiResponse<TripDetail>;
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
