import request, { parseApiResponse } from "../../Api";
import type { ApiResult } from "@/types/api";
import { instrucaoRoute } from ".";

const idiomasRoute = instrucaoRoute + "idiomas/";

export interface IdiomasPublic {
   id: number;
   user_id: number;
   ptai_validade: string | null;
   tai_s_validade: string | null;
   tai_s1_validade: string | null;
   hab_espanhol: string | null;
   val_espanhol: string | null;
   hab_ingles: string | null;
   val_ingles: string | null;
}

export interface TripIdiomasOut {
   trip_id: number;
   user_id: number;
   p_g: string;
   nome_guerra: string;
   nome_completo: string | null;
   saram: string | null;
   idiomas: IdiomasPublic | null;
}

export interface IdiomasUpsert {
   ptai_validade?: string | null;
   tai_s_validade?: string | null;
   tai_s1_validade?: string | null;
   hab_espanhol?: string | null;
   val_espanhol?: string | null;
   hab_ingles?: string | null;
   val_ingles?: string | null;
}

export async function getIdiomas(signal?: AbortSignal): Promise<TripIdiomasOut[]> {
   const response = await request("GET", idiomasRoute, null, null, signal);
   const result = await parseApiResponse<TripIdiomasOut[]>(response);
   return result.data ?? [];
}

export async function upsertIdiomas(
   trip_id: number,
   data: IdiomasUpsert
): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("PUT", `${idiomasRoute}${trip_id}`, data)
   );
}

export async function deleteIdiomas(trip_id: number): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("DELETE", `${idiomasRoute}${trip_id}`)
   );
}
