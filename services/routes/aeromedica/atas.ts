import { baseUrl } from "../../Api";
import type { ApiResponse } from "@/types/api";
import { aeromedicaRoute } from ".";

const atasRoute = baseUrl + aeromedicaRoute + "atas/";

function getTokenFromCookies(): string | null {
   if (typeof document === "undefined") return null;
   const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
   return match ? match[2] : null;
}

// === Types ===

export interface DadosExtraidos {
   nome_completo: string | null;
   letra_finalidade: string | null;
   data_realizacao: string | null;
   validade_inspsau: string | null;
}

export interface AtaInspecaoPublic {
   id: number;
   user_id: number;
   file_path: string;
   file_name: string;
   file_size: number;
   letra_finalidade: string | null;
   data_realizacao: string | null;
   validade_inspsau: string | null;
   created_at: string;
}

export interface AtaInspecaoWithUrl extends AtaInspecaoPublic {
   url: string;
}

export interface AtaUploadResponse {
   ata: AtaInspecaoPublic;
   dados_extraidos: DadosExtraidos;
   cemal_atualizado: boolean;
   extracao_vazia: boolean;
}

export interface AtaExtrairResponse {
   dados_extraidos: DadosExtraidos;
   extracao_vazia: boolean;
}

export interface AtaUpdateData {
   letra_finalidade: string | null;
   data_realizacao: string | null;
   validade_inspsau: string | null;
}

export interface NomeConflito {
   nomeAta: string;
   nomeSistema: string;
}

export interface ExtrairAtaResult {
   data: AtaExtrairResponse;
   nomeConflito: NomeConflito | null;
}

// === API Functions ===

export async function extrairAta(
   userId: number,
   file: File
): Promise<ExtrairAtaResult> {
   const formData = new FormData();
   formData.append("file", file);

   const token = getTokenFromCookies();
   const headers: HeadersInit = {};
   if (token) {
      headers["Authorization"] = `Bearer ${token}`;
   }

   const params = new URLSearchParams({ user_id: String(userId) });

   const response = await fetch(`${atasRoute}extrair?${params}`, {
      method: "POST",
      headers,
      body: formData,
   });

   if (!response.ok) {
      const json = await response.json();
      throw new Error(
         json.message || json.detail || "Erro ao extrair dados da ata"
      );
   }

   const json = (await response.json()) as ApiResponse<AtaExtrairResponse>;
   if (!json.data) throw new Error("Resposta inválida do servidor");

   const errors = json.errors as {
      nome_ata: string;
      nome_sistema: string;
   } | null;
   const nomeConflito: NomeConflito | null =
      json.message === "nome_divergente" && errors
         ? { nomeAta: errors.nome_ata, nomeSistema: errors.nome_sistema }
         : null;

   return { data: json.data, nomeConflito };
}

export interface DadosConfirmados {
   letra_finalidade: string;
   data_realizacao: string;
   validade_inspsau: string;
}

export async function uploadAta(
   userId: number,
   file: File,
   dados: DadosConfirmados
): Promise<AtaUploadResponse> {
   const formData = new FormData();
   formData.append("file", file);

   const token = getTokenFromCookies();
   const headers: HeadersInit = {};
   if (token) {
      headers["Authorization"] = `Bearer ${token}`;
   }

   const params = new URLSearchParams({ user_id: String(userId) });
   params.set("dados_confirmados", "true");
   if (dados.letra_finalidade) params.set("conf_letra", dados.letra_finalidade);
   if (dados.data_realizacao)
      params.set("conf_realizacao", dados.data_realizacao);
   if (dados.validade_inspsau)
      params.set("conf_validade", dados.validade_inspsau);

   const response = await fetch(`${atasRoute}?${params}`, {
      method: "POST",
      headers,
      body: formData,
   });

   if (!response.ok) {
      const json = await response.json();
      throw new Error(json.message || json.detail || "Erro ao enviar ata");
   }

   const json = (await response.json()) as ApiResponse<AtaUploadResponse>;
   if (!json.data) throw new Error("Resposta inválida do servidor");
   return json.data;
}

export async function getAtasByUser(
   userId: number,
   signal?: AbortSignal
): Promise<AtaInspecaoWithUrl[]> {
   const token = getTokenFromCookies();
   const headers: HeadersInit = {
      "Content-Type": "application/json",
   };
   if (token) {
      headers["Authorization"] = `Bearer ${token}`;
   }

   const response = await fetch(`${atasRoute}user/${userId}`, {
      method: "GET",
      headers,
      signal,
   });

   const json = (await response.json()) as ApiResponse<AtaInspecaoWithUrl[]>;
   return json.data || [];
}

export async function updateAta(
   ataId: number,
   data: AtaUpdateData
): Promise<AtaInspecaoPublic> {
   const token = getTokenFromCookies();
   const headers: HeadersInit = {
      "Content-Type": "application/json",
   };
   if (token) {
      headers["Authorization"] = `Bearer ${token}`;
   }

   const response = await fetch(`${atasRoute}${ataId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(data),
   });

   if (!response.ok) {
      const json = await response.json();
      throw new Error(json.message || json.detail || "Erro ao atualizar ata");
   }

   const json = (await response.json()) as ApiResponse<AtaInspecaoPublic>;
   if (!json.data) throw new Error("Resposta inválida do servidor");
   return json.data;
}

export async function deleteAta(ataId: number): Promise<void> {
   const token = getTokenFromCookies();
   const headers: HeadersInit = {
      "Content-Type": "application/json",
   };
   if (token) {
      headers["Authorization"] = `Bearer ${token}`;
   }

   const response = await fetch(`${atasRoute}${ataId}`, {
      method: "DELETE",
      headers,
   });

   if (!response.ok) {
      const json = await response.json();
      throw new Error(json.message || json.detail || "Erro ao deletar ata");
   }
}

// Atas órfãs (usuários inativos)

export interface AtaOrfaPublic {
   id: number;
   user_id: number;
   nome_guerra: string;
   nome_completo: string;
   file_name: string;
   file_size: number;
   created_at: string;
}

export interface AtasOrfasResumo {
   total_atas: number;
   total_size: number;
   atas: AtaOrfaPublic[];
}

export interface AtasOrfasDeleteResponse {
   deleted: number;
}

export async function getAtasOrfas(
   signal?: AbortSignal
): Promise<AtasOrfasResumo> {
   const token = getTokenFromCookies();
   const headers: HeadersInit = {
      "Content-Type": "application/json",
   };
   if (token) {
      headers["Authorization"] = `Bearer ${token}`;
   }

   const response = await fetch(`${atasRoute}orfas`, {
      method: "GET",
      headers,
      signal,
   });

   const json = (await response.json()) as ApiResponse<AtasOrfasResumo>;
   if (!json.data) throw new Error("Resposta inválida do servidor");
   return json.data;
}

export async function deleteAtasOrfas(
   ids: number[]
): Promise<AtasOrfasDeleteResponse> {
   const token = getTokenFromCookies();
   const headers: HeadersInit = {
      "Content-Type": "application/json",
   };
   if (token) {
      headers["Authorization"] = `Bearer ${token}`;
   }

   const response = await fetch(`${atasRoute}orfas`, {
      method: "DELETE",
      headers,
      body: JSON.stringify({ ids }),
   });

   if (!response.ok) {
      const json = await response.json();
      throw new Error(
         json.message || json.detail || "Erro ao limpar atas órfãs"
      );
   }

   const json = (await response.json()) as ApiResponse<AtasOrfasDeleteResponse>;
   if (!json.data) throw new Error("Resposta inválida do servidor");
   return json.data;
}
