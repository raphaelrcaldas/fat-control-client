import request, { parseApiResponse } from "../Api";
import type { ApiResponse, ApiResult } from "@/types/api";
import { CrewMember } from "./trips";

const quadsRoute = "ops/quads/";

export interface QuadParams {
   funcao: string;
   tipo_quad: number;
   uae?: string;
   proj?: string;
   [key: string]: string | number | undefined;
}

export interface QuadTypeGroup {
   long: string;
   types: QuadType[];
}

export interface QuadType {
   id: number;
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
   const json = await res.json() as ApiResponse<CrewQuadRes[]>;
   return json.data || [];
}

export async function getQuadById(
   tripId: number,
   quadId: number
): Promise<Quad[]> {
   const res = await request("GET", `${quadsRoute}trip/${tripId}`, null, {
      type_id: quadId,
   });
   const json = await res.json() as ApiResponse<Quad[]>;
   return json.data || [];
}

export async function updateQuad(quad: Quad): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("PUT", `${quadsRoute}${quad.id}`, quad)
   );
}

export async function deleteQuad(quadId: number): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("DELETE", quadsRoute + quadId)
   );
}

export async function getQuadsType(uae: string): Promise<QuadTypeGroup[]> {
   const response = await request("GET", quadsRoute + "types", null, {
      uae: uae,
   });
   const json = await response.json() as ApiResponse<QuadTypeGroup[]>;
   return json.data || [];
}
