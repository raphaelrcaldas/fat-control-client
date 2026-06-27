import request, { baseUrl, parseApiResponse } from "../../Api";
import type { ApiResponse, ApiResult } from "@/types/api";
import { inteligenciaRoute } from ".";

const passaportesRoute = inteligenciaRoute + "passaportes/";

// Rota absoluta para chamadas multipart (fetch + FormData)
const route = baseUrl + inteligenciaRoute + "passaportes/";

function getTokenFromCookies(): string | null {
   if (typeof document === "undefined") return null;
   const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
   return match ? match[2] : null;
}

export interface PassaportePublic {
   id: number;
   user_id: number;
   passaporte: string | null;
   data_expedicao_passaporte: string | null;
   validade_passaporte: string | null;
   visa: string | null;
   data_expedicao_visa: string | null;
   validade_visa: string | null;
   passaporte_url: string | null;
   visa_url: string | null;
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

export async function deletePassaporte(
   trip_id: number
): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("DELETE", `${passaportesRoute}${trip_id}`)
   );
}

export async function uploadPassaporteImagem(
   trip_id: number,
   tipo: "passaporte" | "visa",
   file: File
): Promise<PassaportePublic> {
   const formData = new FormData();
   formData.append("file", file);

   const token = getTokenFromCookies();
   const headers: HeadersInit = {};
   if (token) {
      headers["Authorization"] = `Bearer ${token}`;
   }

   const response = await fetch(`${route}${trip_id}/imagem/${tipo}`, {
      method: "POST",
      headers,
      body: formData,
   });

   if (!response.ok) {
      const json = await response.json();
      throw new Error(json.message || json.detail || "Erro ao enviar imagem");
   }

   const json = (await response.json()) as ApiResponse<PassaportePublic>;
   if (!json.data) throw new Error("Resposta inválida do servidor");
   return json.data;
}

export interface ImagemOrfa {
   user_id: number;
   p_g: string;
   nome_guerra: string;
   nome_completo: string | null;
   tem_passaporte: boolean;
   tem_visa: boolean;
}

export interface ImagensOrfasResumo {
   total_imagens: number;
   total_militares: number;
   itens: ImagemOrfa[];
}

export async function getImagensOrfas(
   signal?: AbortSignal
): Promise<ImagensOrfasResumo> {
   const response = await request(
      "GET",
      `${passaportesRoute}imagens/orfas`,
      null,
      null,
      signal
   );
   const result = await parseApiResponse<ImagensOrfasResumo>(response);
   if (!result.data) throw new Error("Resposta inválida do servidor");
   return result.data;
}

export async function deleteImagensOrfas(
   user_ids: number[]
): Promise<{ deleted: number }> {
   const result = await parseApiResponse<{ deleted: number }>(
      await request("DELETE", `${passaportesRoute}imagens/orfas`, { user_ids })
   );
   if (!result.data) throw new Error("Resposta inválida do servidor");
   return result.data;
}

export async function deletePassaporteImagem(
   trip_id: number,
   tipo: "passaporte" | "visa"
): Promise<PassaportePublic> {
   const token = getTokenFromCookies();
   const headers: HeadersInit = {
      "Content-Type": "application/json",
   };
   if (token) {
      headers["Authorization"] = `Bearer ${token}`;
   }

   const response = await fetch(`${route}${trip_id}/imagem/${tipo}`, {
      method: "DELETE",
      headers,
   });

   if (!response.ok) {
      const json = await response.json();
      throw new Error(json.message || json.detail || "Erro ao remover imagem");
   }

   const json = (await response.json()) as ApiResponse<PassaportePublic>;
   if (!json.data) throw new Error("Resposta inválida do servidor");
   return json.data;
}
