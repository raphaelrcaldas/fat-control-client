import request from "../Api";
import { PostoGrad } from "./postos";

const usersRoute = "users/";

export interface UserPublic {
   id: number;
   posto: PostoGrad;
   esp: string;
   nome_guerra: string;
   nome_completo: string;
   unidade: string;
   ult_promo: Date | null;
   ant_rel: number | null;
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
   nasc: string | null
   email_pess: string
   email_fab: string
   unidade: string
}

export interface UserFull extends UserSchema {
   posto: PostoGrad
}

export async function getUsers(): Promise<UserPublic[]> {
   const response = await request("GET", usersRoute);
   return await response.json() as UserPublic[];
}

export async function getUserById(userId: number): Promise<UserFull> {
   return (await request("GET", usersRoute + userId)).json();
}

export async function addUser(userBody: UserSchema) {
   return await request("POST", usersRoute, userBody);
}

export async function updateUser(userId: number, userBody: UserSchema) {
   return await request("PUT", usersRoute + userId, userBody);
}

export async function changePassword(pwdBody: string, token:string) {
   return await request(
      "POST",
      usersRoute + "change-pwd/",
      pwdBody,
      null,
      token
   );
}
