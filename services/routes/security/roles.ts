import request from "../../Api";
import { secRoute } from ".";
import { UserPublic } from "../users";

const rolesPath = secRoute + "roles/";

export interface Role {
   id: number;
   name: string;
   description: string;
}

export interface PermissionDetail {
   id: number;
   resource: string;
   action: string;
   description: string;
}

export interface RoleDetail extends Role {
   permissions: PermissionDetail[];
}

export interface UserWithRole {
   role: Role;
   user: UserPublic;
}

export async function getUsersRoles(): Promise<UserWithRole[]> {
   const response = await request("GET", rolesPath + "users/");

   return (await response.json()) as UserWithRole[];
}

export async function addUserRole(roleId, userId) {
   const payload = { role_id: roleId, user_id: userId };

   const response = await request("POST", rolesPath + "users/", payload);

   return response;
}

export async function updateUserRole(roleId, userId) {
   const payload = { role_id: roleId, user_id: userId };

   const response = await request("PUT", rolesPath + "users/", payload);

   return response;
}

export async function deleteUserRole(roleId, userId) {
   const payload = { role_id: roleId, user_id: userId };

   const response = await request("DELETE", rolesPath + "users/", payload);

   return response;
}

export async function getRoles(): Promise<RoleDetail[]> {
   const response = await request("GET", rolesPath);

   return (await response.json()) as RoleDetail[];
}

export async function getRoleDetail(roleId: number): Promise<RoleDetail> {
   const response = await request("GET", `${rolesPath}/${roleId}`);

   return (await response.json()) as RoleDetail;
}
