import request from "../../Api";
import type { ApiResponse } from "@/types/api";

const soldosRoute = "admin/soldos/";

export interface PostoGradSimple {
   short: string;
   mid: string;
   long: string;
   circulo: string;
   ant: number;
}

export interface SoldoPublic {
   id: number;
   pg: string;
   data_inicio: string;
   data_fim: string | null;
   valor: number;
   posto_grad: PostoGradSimple | null;
}

export interface SoldoCreate {
   pg: string;
   data_inicio: string;
   data_fim?: string | null;
   valor: number;
}

export interface SoldoUpdate {
   pg?: string;
   data_inicio?: string;
   data_fim?: string | null;
   valor?: number;
}

export interface SoldoStats {
   total: number;
   min_valor: number | null;
   max_valor: number | null;
}

// GET - Retorna estatisticas dos soldos
export async function getSoldoStats(circulo?: string): Promise<SoldoStats> {
   const params: Record<string, string> = {};

   if (circulo && circulo.trim() !== "") {
      params.circulo = circulo;
   }

   const response = await request(
      "GET",
      `${soldosRoute}stats`,
      null,
      Object.keys(params).length > 0 ? params : null
   );

   const json = (await response
      .json()
      .catch(() => ({}))) as ApiResponse<SoldoStats>;

   if (!response.ok) {
      throw new Error(json.message || "Erro ao buscar estatisticas");
   }

   return json.data as SoldoStats;
}

// GET - Lista todos os soldos
export async function getSoldos(
   circulo?: string,
   activeOnly?: boolean
): Promise<SoldoPublic[]> {
   const params: Record<string, string> = {};

   if (circulo && circulo.trim() !== "") {
      params.circulo = circulo;
   }

   if (activeOnly) {
      params.active_only = "true";
   }

   const response = await request(
      "GET",
      soldosRoute,
      null,
      Object.keys(params).length > 0 ? params : null
   );

   const json = (await response.json().catch(() => ({}))) as ApiResponse<
      SoldoPublic[]
   >;

   if (!response.ok) {
      throw new Error(json.message || "Erro ao buscar soldos");
   }

   return json.data || [];
}

// GET - Busca soldo por ID
export async function getSoldoById(soldo_id: number): Promise<SoldoPublic> {
   const response = await request("GET", `${soldosRoute}${soldo_id}`);

   const json = (await response
      .json()
      .catch(() => ({}))) as ApiResponse<SoldoPublic>;

   if (!response.ok) {
      throw new Error(json.message || "Soldo nao encontrado");
   }

   return json.data as SoldoPublic;
}

// POST - Cria novo soldo
export async function createSoldo(data: SoldoCreate): Promise<SoldoPublic> {
   const response = await request("POST", soldosRoute, data);

   const json: ApiResponse<SoldoPublic> = await response.json();
   if (!response.ok) {
      throw new Error(json.message || "Erro ao criar soldo");
   }

   return json.data as SoldoPublic;
}

// PUT - Atualiza soldo existente
export async function updateSoldo(
   soldo_id: number,
   data: SoldoUpdate
): Promise<SoldoPublic> {
   const response = await request("PUT", `${soldosRoute}${soldo_id}`, data);

   const json: ApiResponse<SoldoPublic> = await response.json();
   if (!response.ok) {
      throw new Error(json.message || "Erro ao atualizar soldo");
   }

   return json.data as SoldoPublic;
}

// DELETE - Deleta soldo
export async function deleteSoldo(soldo_id: number): Promise<void> {
   const response = await request("DELETE", `${soldosRoute}${soldo_id}`);

   const json: ApiResponse<null> = await response.json();
   if (!response.ok) {
      throw new Error(json.message || "Erro ao deletar soldo");
   }
}
