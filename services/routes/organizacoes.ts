import { z } from "zod";
import request, {
   baseUrl,
   getTokenFromCookies,
   parseApiResponse,
} from "../Api";
import type { ApiResponse, ApiResult } from "@/types/api";

const orgRoute = "organizacoes/";

// Rota absoluta para chamadas multipart (fetch + FormData) — o helper
// `request` força Content-Type JSON, incompatível com upload de arquivo.
const orgRouteAbs = baseUrl + orgRoute;

// Zod Schemas (equivalentes aos Pydantic schemas do backend)

export const OrganizacaoSchema = z.object({
   // `sigla` e a PK (codigo da unidade, ex: "11gt"). sigla_2/sigla_3 sao
   // auxiliares e opcionais.
   sigla: z.string(),
   nome: z.string(),
   sigla_2: z.string().nullable(),
   sigla_3: z.string().nullable(),
   alias: z.string().nullable(),
   brasao_path: z.string().nullable(),
   // URL pública do brasão (derivada de brasao_path pelo backend).
   brasao_url: z.string().nullable(),
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

/**
 * Faz upload do brasão da organização (JPG/PNG, normalizado p/ JPEG no
 * backend). Multipart via fetch direto (o helper `request` só faz JSON).
 */
export async function uploadBrasao(
   sigla: string,
   file: File
): Promise<Organizacao> {
   const formData = new FormData();
   formData.append("file", file);

   const token = getTokenFromCookies();
   const headers: HeadersInit = {};
   if (token) headers["Authorization"] = `Bearer ${token}`;

   const response = await fetch(`${orgRouteAbs}${sigla}/brasao`, {
      method: "POST",
      headers,
      body: formData,
   });

   // Body pode não ser JSON (ex.: proxy respondendo 413/502 com HTML).
   const json = (await response
      .json()
      .catch(() => null)) as ApiResponse<Organizacao> | null;
   if (!response.ok || !json?.data) {
      throw new Error(json?.message || "Erro ao enviar o brasão");
   }
   return OrganizacaoSchema.parse(json.data);
}

/** Remove o brasão da organização (banco + objeto no storage). */
export async function deleteBrasao(
   sigla: string
): Promise<ApiResult<Organizacao>> {
   return parseApiResponse<Organizacao>(
      await request("DELETE", `${orgRoute}${sigla}/brasao`)
   );
}
