import request from "../Api";

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

// Busca tripulantes por função para seleção em ordens de missão
export interface TripSearchResult {
   id: number;
   trig: string;
   p_g: string;
   nome_guerra: string;
   oper: "ba" | "op" | "in" | "al";
   posto_ant: number;
   ult_promo: string | null;
   ant_rel: number | null;
   id_fab: number | null;
}

export interface SearchTripsParams {
   func: string;
   q?: string;
   proj?: string;
   uae?: string;
}

export interface GetTripsParams {
   [key: string]: string | number | boolean | string[] | undefined;
   uae?: string;
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

export async function getTrips(
   params: GetTripsParams,
   signal?: AbortSignal
): Promise<PaginatedTripsResponse> {
   // Converter parâmetros para Record<string, string | number>
   const queryParams: Record<string, string | number> = {};
   if (params.uae) queryParams.uae = params.uae;
   if (params.active !== undefined) queryParams.active = String(params.active);
   if (params.page) queryParams.page = params.page;
   if (params.per_page) queryParams.per_page = params.per_page;
   if (params.search) queryParams.search = params.search;
   // Filtros de array - converter para string separada por vírgula
   if (params.p_g && params.p_g.length > 0) queryParams.p_g = params.p_g.join(',');
   if (params.func && params.func.length > 0) queryParams.func = params.func.join(',');
   if (params.oper && params.oper.length > 0) queryParams.oper = params.oper.join(',');

   const response = await request("GET", tripRoute, null, queryParams, signal);

   return (await response.json()) as PaginatedTripsResponse;
}

export async function addTrip(trip) {
   return await request("POST", tripRoute, trip);
}

export async function updateTrip(tripId, trip) {
   return await request("PUT", tripRoute + tripId, trip);
}

export async function addCrewFunc(tripId: number, funcData: CreateCrewFunc) {
   return await request(
      "POST",
      `${tripRoute}func/?trip_id=${tripId}`,
      funcData
   );
}

export async function updateCrewFunc(funcId: number, funcData: CreateCrewFunc) {
   return await request("PUT", `${tripRoute}func/${funcId}`, funcData);
}

export async function deleteCrewFunc(funcId: number) {
   return await request("DELETE", `${tripRoute}func/${funcId}`);
}

export async function searchTrips(
   params: SearchTripsParams,
   signal?: AbortSignal
): Promise<TripSearchResult[]> {
   const queryParams: Record<string, string | number> = {
      func: params.func,
   };
   if (params.q) queryParams.q = params.q;
   if (params.proj) queryParams.proj = params.proj;
   if (params.uae) queryParams.uae = params.uae;

   const response = await request(
      "GET",
      `${tripRoute}search`,
      null,
      queryParams,
      signal
   );
   return (await response.json()) as TripSearchResult[];
}
