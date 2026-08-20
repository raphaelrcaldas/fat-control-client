import request, { parseApiResponse } from "../../Api";
import type { ApiResult } from "@/types/api";
import { instrucaoRoute } from ".";
import type { Subprograma } from "./subprogramas";

const paopsRoute = instrucaoRoute + "paops/";

/**
 * Espelha `StatusPaop` do backend. É informativo — 'encerrado' não trava a
 * edição, porque corrigir plano fechado é rotina.
 */
export const STATUS_PAOP = ["rascunho", "vigente", "encerrado"] as const;

export type StatusPaop = (typeof STATUS_PAOP)[number];

export interface PaopResumo {
   id: number;
   ano: number;
   data_ini: string;
   data_fim: string;
   status: StatusPaop;
   total_subprogramas: number;
   total_matriculas: number;
}

export interface TripulanteMatriculado {
   /** id do vínculo, não do tripulante. */
   id: number;
   trip_id: number;
   trig: string;
   p_g: string;
   nome_guerra: string;
   nome_completo: string | null;
   data_inclusao: string;
}

export interface PaopSubprogramaItem {
   id: number;
   subprograma: Subprograma;
   tripulantes: TripulanteMatriculado[];
}

export interface Paop {
   id: number;
   ano: number;
   data_ini: string;
   data_fim: string;
   status: StatusPaop;
   subprogramas: PaopSubprogramaItem[];
}

export interface PaopCreate {
   ano: number;
   data_ini?: string | null;
   data_fim?: string | null;
   status?: StatusPaop;
}

export interface PaopUpdate {
   data_ini: string;
   data_fim: string;
   status: StatusPaop;
}

export async function getPaops(signal?: AbortSignal): Promise<PaopResumo[]> {
   const response = await request("GET", paopsRoute, null, null, signal);
   const result = await parseApiResponse<PaopResumo[]>(response);
   if (!result.ok) {
      throw new Error(result.message || "Erro ao carregar os PAOPs");
   }
   return result.data ?? [];
}

export async function getPaop(id: number, signal?: AbortSignal): Promise<Paop> {
   const response = await request(
      "GET",
      `${paopsRoute}${id}`,
      null,
      null,
      signal
   );
   const result = await parseApiResponse<Paop>(response);
   if (!result.ok || !result.data) {
      throw new Error(result.message || "Erro ao carregar o PAOP");
   }
   return result.data;
}

export async function createPaop(
   data: PaopCreate
): Promise<ApiResult<PaopResumo>> {
   return parseApiResponse<PaopResumo>(await request("POST", paopsRoute, data));
}

export async function updatePaop(
   id: number,
   data: PaopUpdate
): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("PUT", `${paopsRoute}${id}`, data)
   );
}

export async function deletePaop(id: number): Promise<ApiResult<null>> {
   return parseApiResponse<null>(await request("DELETE", `${paopsRoute}${id}`));
}

export async function setPaopSubprogramas(
   id: number,
   subprograma_ids: number[]
): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("PUT", `${paopsRoute}${id}/subprogramas`, {
         subprograma_ids,
      })
   );
}

export async function setItemTripulantes(
   paopId: number,
   itemId: number,
   trip_ids: number[]
): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request(
         "PUT",
         `${paopsRoute}${paopId}/subprogramas/${itemId}/tripulantes`,
         { trip_ids }
      )
   );
}
