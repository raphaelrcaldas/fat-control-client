import request from "../../Api";
import { cegepRoute } from ".";

// Re-export dados estáticos de constants/
export {
   // Grupos Cidade
   grupoCidadeRecords,
   GRUPO_CIDADE_LABELS,
   getGrupoCidadeById,
   getCidadesByGrupo,
   getGruposCidadeUnicos,
   cidadesByGrupoMap,
   type CidadeSimple,
   type GrupoCidadePublic,
   // Grupos P/G
   grupoPgRecords,
   GRUPO_PG_LABELS,
   getGrupoPgById,
   getGrupoPgByShort,
   getPgByGrupo,
   getGruposPgUnicos,
   pgByGrupoMap,
   type GrupoPgPublic,
} from "../../../src/constants/cegep/diarias";

import {
   grupoCidadeRecords,
   grupoPgRecords,
   type GrupoCidadePublic,
   type GrupoPgPublic,
} from "../../../src/constants/cegep/diarias";

const diariasRoute = cegepRoute + "diarias/";

// ============================================
// FUNÇÕES SÍNCRONAS (compatibilidade)
// ============================================

/**
 * Retorna os grupos de cidade de forma síncrona (dados estáticos)
 * @deprecated Use grupoCidadeRecords diretamente de constants/cegep/diarias
 */
export function getGruposCidadeSync(): GrupoCidadePublic[] {
   return grupoCidadeRecords;
}

/**
 * Retorna os grupos de P/G de forma síncrona (dados estáticos)
 * @deprecated Use grupoPgRecords diretamente de constants/cegep/diarias
 */
export function getGruposPgSync(): GrupoPgPublic[] {
   return grupoPgRecords;
}

// ============================================
// INTERFACES DE API
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
// API Functions
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

   if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Erro ao buscar valores de diárias");
   }

   return (await response.json()) as DiariaValorPublic[];
}

export async function getDiariaValorById(
   valorId: number
): Promise<DiariaValorPublic> {
   const response = await request("GET", `${diariasRoute}valores/${valorId}`);

   if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Valor de diária não encontrado");
   }

   return (await response.json()) as DiariaValorPublic;
}

export async function createDiariaValor(
   data: DiariaValorCreate
): Promise<DiariaValorPublic> {
   const response = await request("POST", `${diariasRoute}valores/`, data);

   if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Erro ao criar valor de diária");
   }

   return (await response.json()) as DiariaValorPublic;
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

   if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Erro ao atualizar valor de diária");
   }

   return (await response.json()) as DiariaValorPublic;
}

export async function deleteDiariaValor(valorId: number): Promise<void> {
   const response = await request(
      "DELETE",
      `${diariasRoute}valores/${valorId}`
   );

   if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Erro ao deletar valor de diária");
   }
}

/**
 * Retorna grupos de cidade (usa dados estáticos locais)
 * @deprecated Use grupoCidadeRecords diretamente de constants/cegep/diarias
 */
export async function getGruposCidade(): Promise<GrupoCidadePublic[]> {
   return Promise.resolve(grupoCidadeRecords);
}

/**
 * Retorna grupos de P/G (usa dados estáticos locais)
 * @deprecated Use grupoPgRecords diretamente de constants/cegep/diarias
 */
export async function getGruposPg(): Promise<GrupoPgPublic[]> {
   return Promise.resolve(grupoPgRecords);
}
