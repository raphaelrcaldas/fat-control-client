import request, { parseApiResponse } from "../../Api";
import type { ApiResponse, ApiResult } from "@/types/api";
import { UserPublic } from "../users";
import { cegepRoute } from ".";

const dadosBancariosRoute = cegepRoute + "dados-bancarios/";

export interface DadosBancariosBase {
   banco: string;
   codigo_banco: string;
   agencia: string;
   conta: string;
   remuneracao: number | null;
   mes_ano: string | null; // ISO date (YYYY-MM-DD)
   aux_transp: number | null;
}

export interface DadosBancariosCreate extends DadosBancariosBase {
   user_id: number;
}

export interface DadosBancariosUpdate {
   banco?: string;
   codigo_banco?: string;
   agencia?: string;
   conta?: string;
   remuneracao?: number | null;
   mes_ano?: string | null;
   aux_transp?: number | null;
}

export interface DadosBancariosPublic extends DadosBancariosBase {
   id: number;
   user_id: number;
   created_at: string;
   updated_at: string | null;
}

export interface DadosBancariosWithUser extends DadosBancariosPublic {
   user: UserPublic;
}

// Parâmetros para busca de dados bancários
export interface GetDadosBancariosParams {
   user_id?: number;
   search?: string;
}

// GET - Lista todos os dados bancários ou filtra por usuário/busca
export async function getDadosBancarios(
   params?: GetDadosBancariosParams,
   signal?: AbortSignal
): Promise<DadosBancariosWithUser[]> {
   const queryParams: Record<string, string | number> = {};

   if (params?.user_id !== undefined) {
      queryParams.user_id = params.user_id;
   }

   if (params?.search && params.search.trim() !== "") {
      queryParams.search = params.search;
   }

   const response = await request(
      "GET",
      dadosBancariosRoute,
      null,
      Object.keys(queryParams).length > 0 ? queryParams : null,
      signal
   );

   const json = (await response.json()) as ApiResponse<DadosBancariosWithUser[]>;
   return json.data || [];
}

// GET - Busca dados bancários por ID
export async function getDadosBancariosById(
   dados_id: number
): Promise<DadosBancariosWithUser> {
   const response = await request("GET", `${dadosBancariosRoute}${dados_id}`);
   const json = (await response.json()) as ApiResponse<DadosBancariosWithUser>;
   return json.data as DadosBancariosWithUser;
}

// GET - Busca dados bancários por ID do usuário
export async function getDadosBancariosByUser(
   user_id: number
): Promise<DadosBancariosPublic> {
   const response = await request(
      "GET",
      `${dadosBancariosRoute}user/${user_id}`
   );
   const json = (await response.json()) as ApiResponse<DadosBancariosPublic>;
   return json.data as DadosBancariosPublic;
}

// POST - Cria novos dados bancários
export async function createDadosBancarios(
   dados: DadosBancariosCreate
): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("POST", dadosBancariosRoute, dados)
   );
}

// PUT - Atualiza dados bancários existentes
export async function updateDadosBancarios(
   dados_id: number,
   dados: DadosBancariosUpdate
): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("PUT", `${dadosBancariosRoute}${dados_id}`, dados)
   );
}

// DELETE - Deleta dados bancários
export async function deleteDadosBancarios(
   dados_id: number
): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("DELETE", `${dadosBancariosRoute}${dados_id}`)
   );
}

// POST - Sincroniza remuneração com o Portal da Transparência
export interface SyncRemuneracaoResponse {
   cpf: string;
   mes_ano: string; // YYYY-MM-DD
   remuneracao_bruta: number | null;
   remuneracao_liquida: number | null;
}

export async function syncRemuneracaoPortal(
   user_id: number,
   mes_ano: string
): Promise<SyncRemuneracaoResponse> {
   const response = await request(
      "POST",
      `${dadosBancariosRoute}sync-remuneracao`,
      { user_id, mes_ano }
   );
   const json = (await response.json()) as ApiResponse<SyncRemuneracaoResponse>;
   if (!response.ok || !json.data) {
      throw new Error(
         json.message || "Erro ao consultar Portal da Transparência"
      );
   }
   return json.data;
}
