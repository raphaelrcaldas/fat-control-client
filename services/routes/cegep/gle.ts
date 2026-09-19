import request, { parseApiResponse } from "../../Api";
import type { ApiResponse, ApiResult } from "@/types/api";
import { cegepRoute } from ".";

const gleRoute = cegepRoute + "gle";

/**
 * Grupo de localidade especial. O backend guarda inteiro (1 = A, 2 = B);
 * a letra é decisão de apresentação — ver docs/dominio/gle.md.
 */
export const GRUPO_A = 1;
export const GRUPO_B = 2;

export type GrupoLocEsp = typeof GRUPO_A | typeof GRUPO_B;

export function grupoLetra(grupo: number): string {
   return grupo === GRUPO_A ? "A" : "B";
}

/** Offset UTC como o usuário lê: -4 vira "UTC−4" (menos tipográfico). */
export function fusoLabel(fuso: number): string {
   return fuso === 0 ? "UTC" : `UTC−${Math.abs(fuso)}`;
}

export interface CidadeResumo {
   codigo: number;
   nome: string;
   uf: string;
}

export interface LocEspBase {
   cidade_id: number;
   grupo: number;
   fuso: number;
}

export interface LocEspCreate extends LocEspBase {
   icaos: string[];
}

export type LocEspUpdate = LocEspCreate;

export interface LocEsp extends LocEspBase {
   id: number;
   cidade: CidadeResumo;
   icaos: string[];
}

export interface GetLocEspParams {
   grupo?: number;
   uf?: string;
   search?: string;
}

export async function getLocalidades(
   params?: GetLocEspParams,
   signal?: AbortSignal
): Promise<LocEsp[]> {
   const query: Record<string, string | number> = {};
   if (params?.grupo !== undefined) query.grupo = params.grupo;
   if (params?.uf) query.uf = params.uf;
   if (params?.search?.trim()) query.search = params.search.trim();

   const response = await request(
      "GET",
      gleRoute,
      null,
      Object.keys(query).length > 0 ? query : null,
      signal
   );
   const json = (await response.json()) as ApiResponse<LocEsp[]>;
   return json.data || [];
}

export async function createLocalidade(
   data: LocEspCreate
): Promise<ApiResult<LocEsp>> {
   const response = await request("POST", gleRoute, data);
   return parseApiResponse<LocEsp>(response);
}

export async function updateLocalidade(
   id: number,
   data: LocEspUpdate
): Promise<ApiResult<LocEsp>> {
   const response = await request("PUT", `${gleRoute}/${id}`, data);
   return parseApiResponse<LocEsp>(response);
}

export async function deleteLocalidade(id: number): Promise<ApiResult<null>> {
   const response = await request("DELETE", `${gleRoute}/${id}`);
   return parseApiResponse<null>(response);
}
