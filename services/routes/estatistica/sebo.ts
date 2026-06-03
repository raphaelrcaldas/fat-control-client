import request from "../../Api";
import type { ApiResponse } from "@/types/api";

const seboRoute = "estatistica/sebo/";

export interface SeboVoo {
   h_ano: number;
   dsv: number | null;
   data_ult_voo: string | null; // "YYYY-MM-DD"
}

export interface SeboCartoes {
   cemal: string | null;
   tovn: string | null;
   imae: string | null;
   crm: string | null;
   val_pass: string | null;
   val_visa: string | null;
   cvi: string | null;
   ptai: string | null;
}

export interface SeboTripItem {
   trip_id: number;
   p_g: string;
   nome_guerra: string;
   trig: string;
   func: string;
   oper: string;
   voo: SeboVoo;
   cartoes: SeboCartoes;
}

export interface GetSeboParams {
   func: string;
   oper?: string[];
   func_bordo?: string[];
   ano?: number;
}

export async function getSebo(
   params: GetSeboParams,
   signal?: AbortSignal
): Promise<SeboTripItem[]> {
   const queryParams: Record<string, string> = {
      func: params.func,
   };
   if (params.oper && params.oper.length > 0) {
      queryParams.oper = JSON.stringify(params.oper);
   }
   if (params.func_bordo && params.func_bordo.length > 0) {
      queryParams.func_bordo = JSON.stringify(params.func_bordo);
   }
   if (params.ano) {
      queryParams.ano = String(params.ano);
   }
   const response = await request("GET", seboRoute, null, queryParams, signal);
   if (!response.ok) {
      throw new Error(`Erro ao buscar sebo: ${response.status}`);
   }
   const json = (await response.json()) as ApiResponse<SeboTripItem[]>;
   return json.data ?? [];
}
