import { z } from "zod";
import request, { parseApiResponse } from "../Api";
import { OrganizacaoSchema } from "./organizacoes";
import type { ApiResponse, ApiResult } from "@/types/api";

const tenantRoute = "tenants/";

// Zod Schemas (equivalentes aos Pydantic schemas do backend)

export const TenantSchema = z.object({
   organizacao_id: z.string(),
   active: z.boolean(),
   tema: z.string(),
   saudacao: z.string(),
   created_at: z.string(),
   organizacao: OrganizacaoSchema,
});

export type Tenant = z.infer<typeof TenantSchema>;

export interface TenantCreate {
   organizacao_id: string;
}

// Atualização parcial: envia apenas os campos alterados. `saudacao: ""` limpa
// o lema (a coluna é NOT NULL; o backend ignora null = "não alterar").
export interface TenantUpdate {
   active?: boolean;
   tema?: string;
   saudacao?: string;
}

// API Services

/**
 * Busca os tenants (organizações clientes da plataforma)
 */
export async function getTenants(): Promise<Tenant[]> {
   const response = await request("GET", tenantRoute);
   const json = (await response.json()) as ApiResponse<Tenant[]>;

   if (!response.ok) {
      throw new Error(
         json.message || `Failed to fetch tenants: ${response.statusText}`
      );
   }

   return z.array(TenantSchema).parse(json.data);
}

export async function createTenant(
   data: TenantCreate
): Promise<ApiResult<Tenant>> {
   return parseApiResponse<Tenant>(await request("POST", tenantRoute, data));
}

export async function updateTenant(
   organizacaoId: string,
   data: TenantUpdate
): Promise<ApiResult<Tenant>> {
   return parseApiResponse<Tenant>(
      await request("PATCH", `${tenantRoute}${organizacaoId}`, data)
   );
}

export async function deleteTenant(
   organizacaoId: string
): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("DELETE", `${tenantRoute}${organizacaoId}`)
   );
}
