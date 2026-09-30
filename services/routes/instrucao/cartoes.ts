import request, { ApiError, parseApiResponse, readApiData } from "../../Api";
import type { ApiResponse, ApiResult } from "@/types/api";
import { instrucaoRoute } from ".";

const cartoesRoute = instrucaoRoute + "cartoes/";

export interface CartoesPublic {
   id: number;
   user_id: number;
   ptai_validade: string | null;
   tai_s_validade: string | null;
   tai_s1_validade: string | null;
   cvi_validade: string | null;
   hab_espanhol: string | null;
   val_espanhol: string | null;
   hab_ingles: string | null;
   val_ingles: string | null;
}

export interface TripCartoesOut {
   trip_id: number;
   user_id: number;
   p_g: string;
   nome_guerra: string;
   nome_completo: string | null;
   saram: string | null;
   cartao: CartoesPublic | null;
}

export interface CartoesUpsert {
   ptai_validade?: string | null;
   tai_s_validade?: string | null;
   tai_s1_validade?: string | null;
   cvi_validade?: string | null;
   hab_espanhol?: string | null;
   val_espanhol?: string | null;
   hab_ingles?: string | null;
   val_ingles?: string | null;
}

export async function getCartoes(
   signal?: AbortSignal
): Promise<TripCartoesOut[]> {
   const response = await request("GET", cartoesRoute, null, null, signal);
   const result = await readApiData<ApiResponse<TripCartoesOut[]>>(
      response,
      (message) => message || "Erro ao carregar cartões"
   );

   return result.data ?? [];
}

export async function upsertCartao(
   trip_id: number,
   data: CartoesUpsert
): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("PUT", `${cartoesRoute}${trip_id}`, data)
   );
}

export async function deleteCartao(trip_id: number): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("DELETE", `${cartoesRoute}${trip_id}`)
   );
}

export interface CartaoOrfaoPublic {
   user_id: number;
   p_g: string;
   nome_guerra: string;
   nome_completo: string | null;
}

export interface CartoesOrfaosResumo {
   total_registros: number;
   itens: CartaoOrfaoPublic[];
}

export async function getCartoesOrfaos(
   signal?: AbortSignal
): Promise<CartoesOrfaosResumo> {
   const response = await request(
      "GET",
      `${cartoesRoute}orfaos`,
      null,
      null,
      signal
   );
   const result = await readApiData<ApiResponse<CartoesOrfaosResumo>>(
      response,
      (message) => message || "Erro ao carregar cartões órfãos"
   );
   if (!result.data) {
      throw new ApiError(
         result.message || "Erro ao carregar cartões órfãos",
         result.errors,
         response.status
      );
   }
   return result.data;
}

export async function deleteCartoesOrfaos(
   user_ids: number[]
): Promise<{ deleted: number }> {
   const result = await parseApiResponse<{ deleted: number }>(
      await request("DELETE", `${cartoesRoute}orfaos`, { user_ids })
   );
   if (!result.ok || !result.data) {
      throw new Error(result.message || "Erro ao limpar cartões órfãos");
   }
   return result.data;
}
