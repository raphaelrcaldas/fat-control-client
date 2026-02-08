import request, { parseApiResponse } from "../../Api";
import type { ApiResponse, ApiResult } from "@/types/api";
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
   const json = (await response.json()) as ApiResponse<UserWithRole[]>;

   return json.data!;
}

export async function addUserRole(
   roleId,
   userId
): Promise<ApiResult<null>> {
   const payload = { role_id: roleId, user_id: userId };

   return parseApiResponse<null>(
      await request("POST", rolesPath + "users/", payload)
   );
}

export async function updateUserRole(
   roleId,
   userId
): Promise<ApiResult<null>> {
   const payload = { role_id: roleId, user_id: userId };

   return parseApiResponse<null>(
      await request("PUT", rolesPath + "users/", payload)
   );
}

export async function deleteUserRole(
   roleId,
   userId
): Promise<ApiResult<null>> {
   const payload = { role_id: roleId, user_id: userId };

   return parseApiResponse<null>(
      await request("DELETE", rolesPath + "users/", payload)
   );
}

export async function getRoles(): Promise<RoleDetail[]> {
   const response = await request("GET", rolesPath);
   const json = (await response.json()) as ApiResponse<RoleDetail[]>;

   return json.data!;
}

export async function getRoleDetail(roleId: number): Promise<RoleDetail> {
   const response = await request("GET", `${rolesPath}/${roleId}`);
   const json = (await response.json()) as ApiResponse<RoleDetail>;

   return json.data!;
}
