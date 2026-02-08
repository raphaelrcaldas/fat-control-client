import { z } from "zod";
import request from "../../Api";
import type { ApiResponse } from "@/types/api";
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
  resourceName?: string
): Promise<PermissionDetail[]> {
  const params = resourceName ? { resource_name: resourceName } : null;
  const response = await request("GET", permissionsPath, null, params);
  const json = (await response.json()) as ApiResponse<PermissionDetail[]>;

  if (!response.ok) {
    throw new Error(json.message || `Failed to fetch permissions: ${response.statusText}`);
  }

  // Valida resposta com Zod
  return z.array(PermissionDetailSchema).parse(json.data);
}
