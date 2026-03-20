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

export interface AtaUpdateData {
   letra_finalidade: string | null;
   data_realizacao: string | null;
   validade_inspsau: string | null;
}

export interface StorageStats {
   total_size: number;
   total_objects: number;
}

export interface BucketStats {
   name: string;
   total_size: number;
   total_objects: number;
}

export interface AllBucketsStats {
   total_size: number;
   total_objects: number;
   buckets: BucketStats[];
}

export class NomeDivergenteError extends Error {
   nomeAta: string;
   nomeSistema: string;
   constructor(nomeAta: string, nomeSistema: string) {
      super("Nome divergente");
      this.nomeAta = nomeAta;
      this.nomeSistema = nomeSistema;
   }
}

// === API Functions ===

export async function uploadAta(
   userId: number,
   file: File,
   ignorarNome = false
): Promise<AtaUploadResponse> {
   const formData = new FormData();
   formData.append("file", file);

   const token = getTokenFromCookies();
   const headers: HeadersInit = {};
   if (token) {
      headers["Authorization"] = `Bearer ${token}`;
   }

   const params = new URLSearchParams({ user_id: String(userId) });
   if (ignorarNome) params.set("ignorar_nome", "true");

   const response = await fetch(`${atasRoute}?${params}`, {
      method: "POST",
      headers,
      body: formData,
   });

   if (!response.ok) {
      const json = await response.json();
      if (json.message === "nome_divergente" && json.errors) {
         throw new NomeDivergenteError(
            json.errors.nome_ata,
            json.errors.nome_sistema
         );
      }
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

export async function getStorageStats(
   signal?: AbortSignal
): Promise<StorageStats> {
   const token = getTokenFromCookies();
   const headers: HeadersInit = {
      "Content-Type": "application/json",
   };
   if (token) {
      headers["Authorization"] = `Bearer ${token}`;
   }

   const response = await fetch(`${atasRoute}storage/stats`, {
      method: "GET",
      headers,
      signal,
   });

   const json = (await response.json()) as ApiResponse<StorageStats>;
   if (!json.data) throw new Error("Resposta inválida do servidor");
   return json.data;
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

export async function deleteAtasOrfas(): Promise<void> {
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
   });

   if (!response.ok) {
      const json = await response.json();
      throw new Error(json.message || json.detail || "Erro ao limpar atas órfãs");
   }
}

export async function getAllBucketsStats(
   signal?: AbortSignal
): Promise<AllBucketsStats> {
   const token = getTokenFromCookies();
   const headers: HeadersInit = {
      "Content-Type": "application/json",
   };
   if (token) {
      headers["Authorization"] = `Bearer ${token}`;
   }

   const response = await fetch(`${atasRoute}storage/all`, {
      method: "GET",
      headers,
      signal,
   });

   const json = (await response.json()) as ApiResponse<AllBucketsStats>;
   if (!json.data) throw new Error("Resposta inválida do servidor");
   return json.data;
}
