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

export async function getTrips(params): Promise<CrewMember[]> {
   const response = await request("GET", tripRoute, null, params);

   return (await response.json()) as CrewMember[];
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
