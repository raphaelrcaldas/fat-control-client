import request from "../Api";
import { PostoGrad } from "./postos";

const usersRoute = "users/";

export interface UserPublic {
   id: number;
   p_g: string
   posto: PostoGrad;
   esp: string;
   id_fab: number | null
   nome_guerra: string;
   saram?: number;
   nome_completo: string;
   unidade: string;
   active: boolean;
   ult_promo: string | null;
   ant_rel: number | null;
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
   p_g: string
   esp: string
   nome_guerra: string
   nome_completo: string
   id_fab: number | null
   saram: number
   cpf: string
   ult_promo: string | null
   active: boolean;
   nasc: string | null
   email_pess: string
   email_fab: string
   unidade: string
   ant_rel: number | null
}

export interface UserFull extends UserSchema {
   posto: PostoGrad
}

export async function getMe() {
   return (await request('GET', usersRoute + "me")).json();
}

export async function getUsers(
   params?: GetUsersParams,
   signal?: AbortSignal
): Promise<PaginatedResponse<UserPublic>> {
   const queryParams = params ? {
      ...(params.search && { search: params.search }),
      ...(params.p_g && { p_g: params.p_g }),
      ...(params.active !== undefined && { active: params.active.toString() }),
      ...(params.page && { page: params.page.toString() }),
      ...(params.per_page && { per_page: params.per_page.toString() }),
   } : undefined;
   const response = await request("GET", usersRoute, null, queryParams, signal);
   return await response.json() as PaginatedResponse<UserPublic>;
}

export async function getUserById(userId: number): Promise<UserFull> {
   return (await request("GET", usersRoute + userId)).json();
}

export async function addUser(userBody: any) {
   return await request("POST", usersRoute, userBody);
}

export async function updateUser(userId: number, userBody: any) {
   return await request("PUT", usersRoute + userId, userBody);
}

export async function changePassword(pwdBody: { new_pwd: string }) {
   return await request(
      "POST",
      usersRoute + "change-pwd",
      pwdBody,
   );
}

export async function resetPassword(userId: number) {
   return await request("POST", usersRoute + "reset-pwd", null, { user_id: userId });
}
