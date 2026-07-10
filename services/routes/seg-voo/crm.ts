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
   if (!result.ok) {
      throw new Error(result.message || "Erro ao carregar CRM");
   }
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

export interface CrmOrfaoPublic {
   user_id: number;
   p_g: string;
   nome_guerra: string;
   nome_completo: string | null;
}

export interface CrmOrfaosResumo {
   total_registros: number;
   itens: CrmOrfaoPublic[];
}

export async function getCrmOrfaos(
   signal?: AbortSignal
): Promise<CrmOrfaosResumo> {
   const result = await parseApiResponse<CrmOrfaosResumo>(
      await request("GET", `${crmRoute}orfaos`, null, null, signal)
   );
   if (!result.ok || !result.data) {
      throw new Error(result.message || "Erro ao carregar CRM órfãos");
   }
   return result.data;
}

export async function deleteCrmOrfaos(
   user_ids: number[]
): Promise<{ deleted: number }> {
   const result = await parseApiResponse<{ deleted: number }>(
      await request("DELETE", `${crmRoute}orfaos`, { user_ids })
   );
   if (!result.ok || !result.data) {
      throw new Error(result.message || "Erro ao limpar CRM órfãos");
   }
   return result.data;
}
