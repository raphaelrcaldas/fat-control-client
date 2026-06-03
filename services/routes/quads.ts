import request, { parseApiResponse } from "../Api";
import type { ApiResponse, ApiResult } from "@/types/api";
import { CrewMember } from "./trips";
import { UserPublic } from "./users";

const quadsRoute = "ops/quads/";

export interface QuadParams {
   funcao: string;
   tipo_quad: number;
   proj?: string;
   [key: string]: string | number | undefined;
}

export interface QuadTypeGroup {
   id: number;
   short: string;
   long: string;
   types: QuadType[];
}

export interface QuadType {
   id: number;
   short: string;
   long: string;
   funcs_list: string[];
}

export interface Quad {
   id?: number;
   value: string | null;
   type_id: number;
   trip_id: number;
   description: string | null;
}

export interface CrewQuadRes {
   trip: CrewMember;
   quads: Quad[];
   quads_len: number;
}

export async function addQuad(quads: Quad[]): Promise<ApiResult<null>> {
   return parseApiResponse<null>(await request("POST", quadsRoute, quads));
}

export async function getQuads(params: QuadParams): Promise<CrewQuadRes[]> {
   const res = await request("GET", quadsRoute, null, params);
   const json = (await res.json()) as ApiResponse<CrewQuadRes[]>;
   return json.data || [];
}

export async function getQuadById(
   tripId: number,
   quadId: number
): Promise<Quad[]> {
   const res = await request("GET", `${quadsRoute}trip/${tripId}`, null, {
      type_id: quadId,
   });
   const json = (await res.json()) as ApiResponse<Quad[]>;
   return json.data || [];
}

export async function updateQuad(quad: Quad): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("PUT", `${quadsRoute}${quad.id}`, quad)
   );
}

export async function deleteQuad(ids: number[]): Promise<ApiResult<null>> {
   return parseApiResponse<null>(await request("DELETE", quadsRoute, { ids }));
}

// ===========================================================================
// Quadrinhos órfãos (de tripulantes desativados da org ativa)
// ===========================================================================

// Espelha TripQuadInfo do backend: id é sempre presente na resposta de
// órfãos (diferente de CrewMember.id, que é opcional).
export interface QuadOrfaoTrip {
   id: number;
   trig: string;
   user: UserPublic;
   func: null;
}

export interface QuadsOrfaoEntry {
   trip: QuadOrfaoTrip;
   quads_count: number;
}

export interface QuadsOrfaosDeleteResponse {
   deleted: number;
   trips: number;
}

export async function getQuadsOrfaos(
   signal?: AbortSignal
): Promise<QuadsOrfaoEntry[]> {
   const res = await request("GET", `${quadsRoute}orfaos`, null, null, signal);
   const json = (await res.json()) as ApiResponse<QuadsOrfaoEntry[]>;
   return json.data || [];
}

export async function deleteQuadsOrfaos(
   trip_ids: number[]
): Promise<ApiResult<QuadsOrfaosDeleteResponse>> {
   return parseApiResponse<QuadsOrfaosDeleteResponse>(
      await request("DELETE", `${quadsRoute}orfaos`, { trip_ids })
   );
}

export async function getQuadsType(): Promise<QuadTypeGroup[]> {
   const response = await request("GET", quadsRoute + "types");
   const json = (await response.json()) as ApiResponse<QuadTypeGroup[]>;
   return json.data || [];
}

// ===========================================================================
// Gerenciamento da estrutura de quadrinhos (Grupo -> Tipo -> Função)
// ===========================================================================

export interface QuadGroupPayload {
   short: string;
   long: string;
}

export interface QuadTypePayload {
   short: string;
   long: string;
}

export interface QuadGroupOut {
   id: number;
   short: string;
   long: string;
   uae: string;
}

export interface QuadTypeOut {
   id: number;
   group_id: number;
   short: string;
   long: string;
   funcs_list: string[];
}

export async function createQuadsGroup(
   data: QuadGroupPayload
): Promise<ApiResult<QuadGroupOut>> {
   return parseApiResponse<QuadGroupOut>(
      await request("POST", `${quadsRoute}groups`, data)
   );
}

export async function updateQuadsGroup(
   groupId: number,
   data: Partial<QuadGroupPayload>
): Promise<ApiResult<QuadGroupOut>> {
   return parseApiResponse<QuadGroupOut>(
      await request("PUT", `${quadsRoute}groups/${groupId}`, data)
   );
}

export async function deleteQuadsGroup(
   groupId: number
): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("DELETE", `${quadsRoute}groups/${groupId}`)
   );
}

export async function createQuadsType(
   groupId: number,
   data: QuadTypePayload
): Promise<ApiResult<QuadTypeOut>> {
   return parseApiResponse<QuadTypeOut>(
      await request("POST", `${quadsRoute}groups/${groupId}/types`, data)
   );
}

export async function updateQuadsType(
   typeId: number,
   data: Partial<QuadTypePayload>
): Promise<ApiResult<QuadTypeOut>> {
   return parseApiResponse<QuadTypeOut>(
      await request("PUT", `${quadsRoute}types/${typeId}`, data)
   );
}

export async function deleteQuadsType(
   typeId: number
): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("DELETE", `${quadsRoute}types/${typeId}`)
   );
}

export async function setQuadsTypeFuncs(
   typeId: number,
   funcs: string[]
): Promise<ApiResult<QuadTypeOut>> {
   return parseApiResponse<QuadTypeOut>(
      await request("PUT", `${quadsRoute}types/${typeId}/funcs`, { funcs })
   );
}
