import request, { parseApiResponse } from "../../Api";
import type { ApiResponse, ApiResult } from "@/types/api";
import { UserPublic } from "../users";
import { aeromedicaRoute } from ".";

const cartoesSaudeRoute = aeromedicaRoute + "cartoes-saude/";

export interface CartaoSaudePublic {
   id: number;
   user_id: number;
   prontuario: string | null;
   cemal: string | null;
   ag_cemal: string | null;
   tovn: string | null;
   imae: string | null;
}

export interface UserCartaoSaude {
   user: UserPublic;
   cartao: CartaoSaudePublic | null;
   tripulante: boolean;
   cemal_tem_ata: boolean | null;
   total_atas: number;
}

export interface CartaoSaudeCreate {
   user_id: number;
   prontuario: string | null;
   cemal: string | null;
   ag_cemal: string | null;
   tovn: string | null;
   imae: string | null;
}

export interface CartaoSaudeUpdate {
   prontuario?: string | null;
   cemal?: string | null;
   ag_cemal?: string | null;
   tovn?: string | null;
   imae?: string | null;
}

export interface GetCartoesSaudeParams {
   search?: string;
   p_g?: string;
   funcao?: string;
   tripulante?: boolean;
}

// GET - Lista todos os cartões de saúde
export async function getCartoesSaude(
   params?: GetCartoesSaudeParams,
   signal?: AbortSignal
): Promise<UserCartaoSaude[]> {
   const queryParams: Record<string, string> = {};

   if (params?.search && params.search.trim() !== "") {
      queryParams.search = params.search;
   }

   if (params?.p_g && params.p_g.trim() !== "") {
      queryParams.p_g = params.p_g;
   }

   if (params?.funcao && params.funcao.trim() !== "") {
      queryParams.funcao = params.funcao;
   }

   if (params?.tripulante !== undefined) {
      queryParams.tripulante = String(params.tripulante);
   }

   const response = await request(
      "GET",
      cartoesSaudeRoute,
      null,
      Object.keys(queryParams).length > 0 ? queryParams : null,
      signal
   );

   const json = (await response.json()) as ApiResponse<UserCartaoSaude[]>;
   return json.data || [];
}

// POST - Cria um novo cartão de saúde
export async function createCartaoSaude(
   data: CartaoSaudeCreate
): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("POST", cartoesSaudeRoute, data)
   );
}

// PUT - Atualiza um cartão de saúde existente
export async function updateCartaoSaude(
   cartao_id: number,
   data: CartaoSaudeUpdate
): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("PUT", `${cartoesSaudeRoute}${cartao_id}`, data)
   );
}

// DELETE - Deleta um cartão de saúde
export async function deleteCartaoSaude(
   cartao_id: number
): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("DELETE", `${cartoesSaudeRoute}${cartao_id}`)
   );
}
