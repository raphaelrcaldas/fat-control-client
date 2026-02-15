import { z } from "zod";
import request, { parseApiResponse } from "../../Api";
import type { ApiResponse, ApiResult } from "@/types/api";
import { secRoute } from ".";

const resourcesPath = secRoute + "resources/";
const permissionsPath = secRoute + "permissions/";

// Zod Schemas (equivalentes aos Pydantic schemas do backend)

export const ResourceSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
});

export const PermissionDetailSchema = z.object({
  id: z.number(),
  resource: z.string(), // nome do recurso
  action: z.string(),
  description: z.string(),
});

// TypeScript types gerados pelo Zod
export type Resource = z.infer<typeof ResourceSchema>;
export type PermissionDetail = z.infer<typeof PermissionDetailSchema>;

// API Services

/**
 * Busca lista de recursos disponíveis
 * @returns Promise com array de recursos
 */
export async function getResources(): Promise<Resource[]> {
  const response = await request("GET", resourcesPath);
  const json = (await response.json()) as ApiResponse<Resource[]>;

  if (!response.ok) {
    throw new Error(json.message || `Failed to fetch resources: ${response.statusText}`);
  }

  // Valida resposta com Zod
  return z.array(ResourceSchema).parse(json.data);
}

/**
 * Busca lista de permissões, com filtro opcional por recurso
 * @param resourceName Nome do recurso para filtrar (opcional)
 * @returns Promise com array de permissões
 */
export async function getPermissions(
  resourceName?: string,
): Promise<PermissionDetail[]> {
  const params = resourceName ? { resource_name: resourceName } : null;
  const response = await request("GET", permissionsPath, null, params);
  const json = (await response.json()) as ApiResponse<PermissionDetail[]>;

  if (!response.ok) {
    throw new Error(
      json.message || `Failed to fetch permissions: ${response.statusText}`,
    );
  }

  return z.array(PermissionDetailSchema).parse(json.data);
}

// ========================================
// Resource CRUD
// ========================================

export interface ResourceCreate {
  name: string;
  description: string;
}

export interface ResourceUpdate {
  name?: string;
  description?: string;
}

export async function createResource(
  data: ResourceCreate,
): Promise<ApiResult<Resource>> {
  return parseApiResponse<Resource>(
    await request("POST", resourcesPath, data),
  );
}

export async function updateResource(
  id: number,
  data: ResourceUpdate,
): Promise<ApiResult<Resource>> {
  return parseApiResponse<Resource>(
    await request("PUT", `${resourcesPath}${id}`, data),
  );
}

export async function deleteResource(
  id: number,
): Promise<ApiResult<null>> {
  return parseApiResponse<null>(
    await request("DELETE", `${resourcesPath}${id}`),
  );
}

// ========================================
// Permission CRUD
// ========================================

export interface PermissionCreate {
  resource_id: number;
  name: string;
  description: string;
}

export interface PermissionUpdate {
  name?: string;
  description?: string;
}

export async function createPermission(
  data: PermissionCreate,
): Promise<ApiResult<PermissionDetail>> {
  return parseApiResponse<PermissionDetail>(
    await request("POST", permissionsPath, data),
  );
}

export async function updatePermission(
  id: number,
  data: PermissionUpdate,
): Promise<ApiResult<PermissionDetail>> {
  return parseApiResponse<PermissionDetail>(
    await request("PUT", `${permissionsPath}${id}`, data),
  );
}

export async function deletePermission(
  id: number,
): Promise<ApiResult<null>> {
  return parseApiResponse<null>(
    await request("DELETE", `${permissionsPath}${id}`),
  );
}
