import request, { parseApiResponse } from "../Api";
import type { ApiResponse, ApiPaginatedResponse, ApiResult } from "@/types/api";
import { PostoGrad } from "./postos";

const usersRoute = "users/";

export interface UserPublic {
   id: number;
   p_g: string;
   posto: PostoGrad;
   esp: string;
   id_fab: string | null;
   nome_guerra: string;
   saram?: string;
   nome_completo: string;
   unidade: string;
   active: boolean;
   ult_promo: string | null;
   ant_rel: number | null;
   telefone: string | null;
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
   active?: boolean;
   page?: number;
   per_page?: number;
}

export interface UserSchema {
   p_g: string;
   esp: string;
   nome_guerra: string;
   nome_completo: string;
   id_fab: string | null;
   saram: string;
   cpf: string;
   telefone: string | null;
   ult_promo: string | null;
   active: boolean;
   nasc: string | null;
   email_pess: string;
   email_fab: string;
   unidade: string;
   ant_rel: number | null;
}

export interface UserFull extends UserSchema {
   posto: PostoGrad;
}

export interface UserMe {
   id: number;
   posto: string;
   nome_guerra: string;
   role: string;
   permissions: { name: string; resource: string }[];
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
