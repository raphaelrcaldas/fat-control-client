import request, { parseApiResponse } from "../../Api";
import type { ApiResponse, ApiResult } from "@/types/api";
import { segVooRoute } from ".";

const crmRoute = segVooRoute + "crm/";

export interface CrmPublic {
   id: number;
   user_id: number;
   data_realizacao: string | null;
   data_validade: string | null;
}

export interface TripCrmOut {
   trip_id: number;
   user_id: number;
   p_g: string;
   nome_guerra: string;
   nome_completo: string | null;
   saram: string | null;
   telefone: string | null;
   crm: CrmPublic | null;
}

export interface CrmUpsert {
   data_realizacao?: string | null;
   data_validade?: string | null;
}

export interface GetCrmParams {
   p_g?: string;
   funcao?: string;
}

export async function getCrm(
   params?: GetCrmParams,
   signal?: AbortSignal
): Promise<TripCrmOut[]> {
   const queryParams: Record<string, string> = {};
   if (params?.p_g) queryParams.p_g = params.p_g;
   if (params?.funcao) queryParams.funcao = params.funcao;

   const response = await request(
      "GET",
      crmRoute,
      null,
      Object.keys(queryParams).length > 0 ? queryParams : null,
      signal
   );
   const result = await parseApiResponse<TripCrmOut[]>(response);
   return result.data ?? [];
}

export async function upsertCrm(
   trip_id: number,
   data: CrmUpsert
): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("PUT", `${crmRoute}${trip_id}`, data)
   );
}

export async function deleteCrm(trip_id: number): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("DELETE", `${crmRoute}${trip_id}`)
   );
}
