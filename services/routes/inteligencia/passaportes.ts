import request, { parseApiResponse } from "../../Api";
import type { ApiResult } from "@/types/api";
import { inteligenciaRoute } from ".";

const passaportesRoute = inteligenciaRoute + "passaportes/";

export interface PassaportePublic {
   id: number;
   user_id: number;
   passaporte: string | null;
   data_expedicao_passaporte: string | null;
   validade_passaporte: string | null;
   visa: string | null;
   data_expedicao_visa: string | null;
   validade_visa: string | null;
}

export interface TripPassaporteOut {
   trip_id: number;
   user_id: number;
   p_g: string;
   nome_guerra: string;
   nome_completo: string | null;
   saram: string | null;
   telefone: string | null;
   passaporte: PassaportePublic | null;
}

export interface PassaporteUpsert {
   passaporte?: string | null;
   data_expedicao_passaporte?: string | null;
   validade_passaporte?: string | null;
   visa?: string | null;
   data_expedicao_visa?: string | null;
   validade_visa?: string | null;
}

export interface GetPassaportesParams {
   p_g?: string;
   funcao?: string;
}

export async function getPassaportes(
   params?: GetPassaportesParams,
   signal?: AbortSignal
): Promise<TripPassaporteOut[]> {
   const queryParams: Record<string, string> = {};
   if (params?.p_g) queryParams.p_g = params.p_g;
   if (params?.funcao) queryParams.funcao = params.funcao;

   const response = await request(
      "GET",
      passaportesRoute,
      null,
      Object.keys(queryParams).length > 0 ? queryParams : null,
      signal
   );
   const result = await parseApiResponse<TripPassaporteOut[]>(response);
   return result.data ?? [];
}

export async function upsertPassaporte(
   trip_id: number,
   data: PassaporteUpsert
): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("PUT", `${passaportesRoute}${trip_id}`, data)
   );
}

export async function deletePassaporte(trip_id: number): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("DELETE", `${passaportesRoute}${trip_id}`)
   );
}
