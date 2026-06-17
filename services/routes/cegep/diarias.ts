import request from "../../Api";
import type { ApiResponse } from "@/types/api";
import { cegepRoute } from ".";

// ============================================
// TIPOS - Grupos (fonte: banco via API)
// ============================================

export interface CidadeSimple {
   codigo: number;
   nome: string;
   uf: string;
}

export interface GrupoCidadePublic {
   id: number;
   grupo: number;
   cidade_id: number;
   cidade: CidadeSimple | null;
}

export interface GrupoPgPublic {
   id: number;
   grupo: number;
   pg_short: string;
   pg_mid: string | null;
   pg_long: string | null;
   circulo: string | null;
}

const diariasRoute = cegepRoute + "diarias/";

// ============================================
// INTERFACES DE API - Valores
// ============================================

export interface DiariaValorPublic {
   id: number;
   grupo_pg: number;
   grupo_cid: number;
   valor: number;
   data_inicio: string;
   data_fim: string | null;
   status: "vigente" | "proximo" | "anterior" | null;
}

export interface DiariaValorUpdate {
   valor?: number;
   data_inicio?: string;
   data_fim?: string | null;
}

export interface DiariaValorCreate {
   grupo_pg: number;
   grupo_cid: number;
   valor: number;
   data_inicio: string;
   data_fim?: string | null;
}

// ============================================
// API Functions - Valores
// ============================================

export async function getDiariaValores(
   grupoCid?: number,
   grupoPg?: number,
   activeOnly?: boolean
): Promise<DiariaValorPublic[]> {
   const params: Record<string, string> = {};

   if (grupoCid !== undefined) {
      params.grupo_cid = String(grupoCid);
   }

   if (grupoPg !== undefined) {
      params.grupo_pg = String(grupoPg);
   }

   if (activeOnly) {
      params.active_only = "true";
   }

   const response = await request(
      "GET",
      `${diariasRoute}valores/`,
      null,
      Object.keys(params).length > 0 ? params : null
   );

   const json = (await response.json().catch(() => ({}))) as ApiResponse<
      DiariaValorPublic[]
   >;

   if (!response.ok) {
      throw new Error(json.message || "Erro ao buscar valores de diárias");
   }

   return json.data || [];
}

export async function getDiariaValorById(
   valorId: number
): Promise<DiariaValorPublic> {
   const response = await request("GET", `${diariasRoute}valores/${valorId}`);

   const json = (await response
      .json()
      .catch(() => ({}))) as ApiResponse<DiariaValorPublic>;

   if (!response.ok) {
      throw new Error(json.message || "Valor de diária não encontrado");
   }

   return json.data as DiariaValorPublic;
}

export async function createDiariaValor(
   data: DiariaValorCreate
): Promise<DiariaValorPublic> {
   const response = await request("POST", `${diariasRoute}valores/`, data);

   const json: ApiResponse<DiariaValorPublic> = await response.json();
   if (!response.ok) {
      throw new Error(json.message || "Erro ao criar valor de diária");
   }

   return json.data as DiariaValorPublic;
}

export async function updateDiariaValor(
   valorId: number,
   data: DiariaValorUpdate
): Promise<DiariaValorPublic> {
   const response = await request(
      "PUT",
      `${diariasRoute}valores/${valorId}`,
      data
   );

   const json: ApiResponse<DiariaValorPublic> = await response.json();
   if (!response.ok) {
      throw new Error(json.message || "Erro ao atualizar valor de diária");
   }

   return json.data as DiariaValorPublic;
}

export async function deleteDiariaValor(valorId: number): Promise<void> {
   const response = await request(
      "DELETE",
      `${diariasRoute}valores/${valorId}`
   );

   const json: ApiResponse<null> = await response.json();
   if (!response.ok) {
      throw new Error(json.message || "Erro ao deletar valor de diária");
   }
}

// ============================================
// API Functions - Grupos (banco como fonte única)
// ============================================

export async function getGruposCidade(): Promise<GrupoCidadePublic[]> {
   const response = await request("GET", `${diariasRoute}grupos-cidade/`);

   const json = (await response.json().catch(() => ({}))) as ApiResponse<
      GrupoCidadePublic[]
   >;

   if (!response.ok) {
      throw new Error(json.message || "Erro ao buscar grupos de cidade");
   }

   return json.data || [];
}

export async function getGruposPg(): Promise<GrupoPgPublic[]> {
   const response = await request("GET", `${diariasRoute}grupos-pg/`);

   const json = (await response.json().catch(() => ({}))) as ApiResponse<
      GrupoPgPublic[]
   >;

   if (!response.ok) {
      throw new Error(json.message || "Erro ao buscar grupos de P/G");
   }

   return json.data || [];
}
