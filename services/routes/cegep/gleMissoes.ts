import request from "../../Api";
import type { ApiResponse, ApiResult } from "@/types/api";
import { cegepRoute } from ".";
import type { TrechoCalculado } from "./gleCalculo";

const missoesRoute = cegepRoute + "gle/missoes";

export interface TrechoMissaoIn {
   loc_esp_id: number;
   /** ISO sem fuso: "YYYY-MM-DDTHH:MM". */
   chegada: string;
   afastamento: string;
}

export interface MissaoGleInput {
   descricao: string;
   obs?: string | null;
   trechos: TrechoMissaoIn[];
   militares_ids: number[];
}

export interface MilitarMissao {
   user_id: number;
   /** Snapshot do posto na data da apuração, não o atual. */
   p_g: string;
   nome_guerra: string;
   nome_completo: string | null;
   saram: string;
   soldo: string;
   valor: string;
}

export interface MissaoGle {
   id: number;
   descricao: string;
   obs: string | null;
   created_at: string;
   multiplicador: string;
   percentual: string;
   trechos: TrechoCalculado[];
   militares: MilitarMissao[];
}

export interface MissaoGleResumo {
   id: number;
   descricao: string;
   created_at: string;
   total_trechos: number;
   total_militares: number;
   percentual: string;
   /** Nunca nulos: a missão só existe com pelo menos um trecho. */
   primeira_data: string;
   ultima_data: string;
   localidades: string[];
}

export async function getMissoes(
   signal?: AbortSignal
): Promise<MissaoGleResumo[]> {
   const response = await request("GET", missoesRoute, null, null, signal);
   const json = (await response.json()) as ApiResponse<MissaoGleResumo[]>;
   return json.data ?? [];
}

export async function getMissao(
   id: number,
   signal?: AbortSignal
): Promise<MissaoGle> {
   const response = await request(
      "GET",
      `${missoesRoute}/${id}`,
      null,
      null,
      signal
   );
   const json = (await response.json()) as ApiResponse<MissaoGle>;
   if (!json.data) {
      throw new Error(json.message || "Missão não encontrada.");
   }
   return json.data;
}

export async function createMissao(
   body: MissaoGleInput
): Promise<ApiResult<MissaoGle>> {
   const response = await request("POST", missoesRoute, body);
   const json = (await response.json()) as ApiResponse<MissaoGle>;
   return {
      ok: response.ok,
      message: json.message,
      data: json.data ?? null,
      errors: json.errors ?? null,
   };
}

export async function updateMissao(
   id: number,
   body: MissaoGleInput
): Promise<ApiResult<MissaoGle>> {
   const response = await request("PUT", `${missoesRoute}/${id}`, body);
   const json = (await response.json()) as ApiResponse<MissaoGle>;
   return {
      ok: response.ok,
      message: json.message,
      data: json.data ?? null,
      errors: json.errors ?? null,
   };
}

export async function deleteMissao(id: number): Promise<ApiResult<null>> {
   const response = await request("DELETE", `${missoesRoute}/${id}`);
   const json = (await response.json()) as ApiResponse<null>;
   return {
      ok: response.ok,
      message: json.message,
      data: null,
      errors: json.errors ?? null,
   };
}
