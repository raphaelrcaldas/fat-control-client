import request from "../../Api";
import { cegepRoute } from ".";

const diariasRoute = cegepRoute + "diarias/";

// Interfaces

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

// API Functions

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

export async function getGruposCidade(): Promise<GrupoCidadePublic[]> {
   const response = await request("GET", `${diariasRoute}grupos-cidade/`);

   if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Erro ao buscar grupos de cidade");
   }

   return (await response.json()) as GrupoCidadePublic[];
}

export async function getGruposPg(): Promise<GrupoPgPublic[]> {
   const response = await request("GET", `${diariasRoute}grupos-pg/`);

   if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Erro ao buscar grupos de P/G");
   }

   return (await response.json()) as GrupoPgPublic[];
}
