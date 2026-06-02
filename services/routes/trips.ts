import request, { parseApiResponse } from "../Api";
import type { ApiPaginatedResponse, ApiResult } from "@/types/api";

const tripRoute = "ops/trips/";

import { UserPublic } from "./users";
import { CrewFunc, CreateCrewFunc } from "./funcs";

export interface CrewMember {
   id?: number;
   trig: string;
   user: UserPublic;
   uae: string;
   active: boolean;
   funcs?: CrewFunc[];
   func?: CrewFunc;
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

export interface CreateTripData {
   user_id: number;
   active: boolean;
   trig: string;
}

export interface UpdateTripData {
   trig?: string;
   active?: boolean;
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

export async function addCrewFunc(
   tripId: number,
   funcData: CreateCrewFunc
): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("POST", `${tripRoute}func/?trip_id=${tripId}`, funcData)
   );
}

export async function updateCrewFunc(
   funcId: number,
   funcData: CreateCrewFunc
): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("PUT", `${tripRoute}func/${funcId}`, funcData)
   );
}

export async function deleteCrewFunc(funcId: number): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("DELETE", `${tripRoute}func/${funcId}`)
   );
}
