import request from "../../Api";
import type { ApiResponse } from "@/types/api";

const escalaRoute = "ops/escala/";

export type EscalaSort = "horas_voo" | "quads_asc";

export type EscalaIndispMtv =
   | "svc"
   | "sde"
   | "rep"
   | "fer"
   | "lic"
   | "mis"
   | "odm"
   | "pes"
   | "ins";

export interface EscalaIndispInfo {
   mtv: EscalaIndispMtv;
   date_start: string;
   date_end: string;
}

export interface EscalaTripEntry {
   id: number;
   user_id: number;
   nome_guerra: string;
   p_g: string;
   trig: string | null;
   func: string;
   oper: string | null;
   quads_count: number;
   tvoo_year: number;
   data_ult_voo: string | null;
   cemal_date: string | null;
   indisps: EscalaIndispInfo[];
}

export interface EscalaFuncSection {
   func: string;
   trips: EscalaTripEntry[];
}

export interface EscalaResponse {
   date_start: string;
   date_end: string;
   sort: EscalaSort;
   tipo_quad_id: number;
   sections: EscalaFuncSection[];
}

export interface GetEscalaParams {
   [key: string]: string | number | string[] | undefined;
   date_start: string;
   date_end: string;
   tipo_quad_id: number;
   funcs: string[];
   sort: EscalaSort;
   proj?: string;
}

export async function getEscalaDisponiveis(
   params: GetEscalaParams,
   signal?: AbortSignal
): Promise<EscalaResponse> {
   const response = await request(
      "GET",
      escalaRoute + "disponiveis",
      null,
      params,
      signal
   );
   const json = (await response.json()) as ApiResponse<EscalaResponse>;
   if (!response.ok) {
      throw new Error(json.message || "Erro ao gerar escala");
   }
   if (!json.data) {
      throw new Error("Resposta vazia do servidor");
   }
   return json.data;
}
