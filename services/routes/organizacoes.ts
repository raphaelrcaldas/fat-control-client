import { z } from "zod";
import request, { parseApiResponse } from "../Api";
import type { ApiResponse, ApiResult } from "@/types/api";

const orgRoute = "organizacoes/";

// Zod Schemas (equivalentes aos Pydantic schemas do backend)

export const OrganizacaoSchema = z.object({
   // `sigla` e a PK (codigo da unidade, ex: "11gt"). sigla_2/sigla_3 sao
   // auxiliares e opcionais.
   sigla: z.string(),
   nome: z.string(),
   sigla_2: z.string().nullable(),
   sigla_3: z.string().nullable(),
   alias: z.string().nullable(),
   created_at: z.string(),
});

// TypeScript types gerados pelo Zod
export type Organizacao = z.infer<typeof OrganizacaoSchema>;

export interface OrganizacaoCreate {
   sigla: string;
   nome: string;
   sigla_2?: string | null;
   sigla_3?: string | null;
   alias?: string | null;
}

export interface OrganizacaoUpdate {
   sigla?: string;
   sigla_2?: string | null;
   sigla_3?: string | null;
   nome?: string;
   alias?: string | null;
}

// API Services

/**
 * Busca lista de organizacoes cadastradas
 * @returns Promise com array de organizacoes
 */
export async function getOrganizacoes(): Promise<Organizacao[]> {
   const response = await request("GET", orgRoute);
   const json = (await response.json()) as ApiResponse<Organizacao[]>;

   if (!response.ok) {
      throw new Error(
         json.message || `Failed to fetch organizacoes: ${response.statusText}`
      );
   }

   return z.array(OrganizacaoSchema).parse(json.data);
}

export async function createOrganizacao(
   data: OrganizacaoCreate
): Promise<ApiResult<Organizacao>> {
   return parseApiResponse<Organizacao>(await request("POST", orgRoute, data));
}

export async function updateOrganizacao(
   sigla: string,
   data: OrganizacaoUpdate
): Promise<ApiResult<Organizacao>> {
   return parseApiResponse<Organizacao>(
      await request("PUT", `${orgRoute}${sigla}`, data)
   );
}

export async function deleteOrganizacao(
   sigla: string
): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("DELETE", `${orgRoute}${sigla}`)
   );
}
