import request, { parseApiResponse } from "../Api";
import type { ApiResponse, ApiPaginatedResponse, ApiResult } from "@/types/api";
import { PostoGrad } from "./postos";

const usersRoute = "users/";

export interface UserPublic {
   id: number;
   p_g: string;
   posto: PostoGrad;
   quadro: string | null;
   esp: string | null;
   id_fab: string | null;
   nome_guerra: string;
   saram?: string;
   nome_completo: string | null;
   unidade: string;
   active: boolean;
   ult_promo: string | null;
   ant_rel: number | null;
   telefone: string | null;
   promocoes: UserPromo[];
}

export interface PaginatedResponse<T> {
   items: T[];
   total: number;
   page: number;
   per_page: number;
   pages: number;
}

export interface GetUsersParams {
   search?: string;
   p_g?: string;
   quadro?: string;
   esp?: string;
   active?: boolean;
   page?: number;
   per_page?: number;
}

/**
 * Payload de cadastro (POST /users) — espelha `UserSchema` do backend: só
 * p_g, nome_guerra e saram são obrigatórios (colunas NOT NULL do model); o
 * resto é opcional e viaja como `null` quando em branco.
 *
 * `active` fica de fora: o militar nasce ativo e o status só muda via update.
 */
export interface UserCreate {
   p_g: string;
   nome_guerra: string;
   saram: string;
   quadro: string | null;
   esp: string | null;
   nome_completo: string | null;
   id_fab: string | null;
   cpf: string | null;
   telefone: string | null;
   ult_promo: string | null;
   nasc: string | null;
   data_praca: string | null;
   email_pess: string | null;
   email_fab: string | null;
   ant_rel: number | null;
}

/** Payload de atualização (PUT /users/{id}): parcial, mais o status. */
export type UserUpdate = Partial<UserCreate & { active: boolean }>;

export interface UserFull extends UserCreate {
   posto: PostoGrad;
   // Unidade é leitura-apenas: definida na criação (org ativa) e não
   // enviada no payload de criação/atualização. Espelha o backend.
   unidade: string;
   active: boolean;
   // Campos de cadastro ainda não preenchidos (derivado no backend a
   // partir das colunas nullable do model User).
   campos_pendentes: string[];
}

export interface OrgScope {
   organizacao_id: string | null;
   sigla: string | null;
   nome: string | null;
   role: string;
   tema: string;
}

export interface UserMe {
   id: number;
   posto: string;
   nome_guerra: string;
   role: string;
   permissions: { name: string; resource: string }[];
   active_org: string | null;
   orgs: OrgScope[];
}

export async function getMe() {
   const response = await request("GET", usersRoute + "me");
   const json = (await response.json()) as ApiResponse<UserMe>;
   return json.data;
}

export async function getUsers(
   params?: GetUsersParams,
   signal?: AbortSignal
): Promise<PaginatedResponse<UserPublic>> {
   const queryParams = params
      ? {
           ...(params.search && { search: params.search }),
           ...(params.p_g && { p_g: params.p_g }),
           ...(params.quadro && { quadro: params.quadro }),
           ...(params.esp && { esp: params.esp }),
           ...(params.active !== undefined && {
              active: params.active.toString(),
           }),
           ...(params.page && { page: params.page.toString() }),
           ...(params.per_page && { per_page: params.per_page.toString() }),
        }
      : undefined;
   const response = await request("GET", usersRoute, null, queryParams, signal);
   const json = (await response.json()) as ApiPaginatedResponse<UserPublic>;
   return {
      items: json.data || [],
      total: json.total,
      page: json.page,
      per_page: json.per_page,
      pages: json.pages,
   };
}

export async function getUserById(userId: number): Promise<UserFull> {
   const response = await request("GET", usersRoute + userId);
   const json = (await response.json()) as ApiResponse<UserFull>;
   return json.data as UserFull;
}

export async function addUser(userBody: any): Promise<ApiResult<UserFull>> {
   return parseApiResponse<UserFull>(
      await request("POST", usersRoute, userBody)
   );
}

export async function updateUser(
   userId: number,
   userBody: any
): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("PUT", usersRoute + userId, userBody)
   );
}

export async function changePassword(pwdBody: {
   new_pwd: string;
}): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("POST", usersRoute + "change-pwd", pwdBody)
   );
}

export async function resetPassword(userId: number): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("POST", usersRoute + "reset-pwd", null, {
         user_id: userId,
      })
   );
}

export async function deleteUser(userId: number): Promise<ApiResult<null>> {
   return parseApiResponse<null>(await request("DELETE", usersRoute + userId));
}

// ========================================
// Promoções (histórico de carreira)
// ========================================

export interface UserPromo {
   id: number;
   user_id: number;
   p_g: string;
   posto: PostoGrad;
   data_promo: string;
}

export interface UserPromoCreate {
   p_g: string;
   data_promo: string;
}

export async function getUserPromos(userId: number): Promise<UserPromo[]> {
   const response = await request("GET", usersRoute + userId + "/promocoes");
   const json = (await response.json()) as ApiResponse<UserPromo[]>;
   return json.data || [];
}

export async function addUserPromo(
   userId: number,
   body: UserPromoCreate
): Promise<ApiResult<UserPromo>> {
   return parseApiResponse<UserPromo>(
      await request("POST", usersRoute + userId + "/promocoes", body)
   );
}

export async function deleteUserPromo(
   userId: number,
   promoId: number
): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("DELETE", usersRoute + userId + "/promocoes/" + promoId)
   );
}
