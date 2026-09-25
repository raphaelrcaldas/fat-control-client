import { z } from "zod";
import request, {
   baseUrl,
   parseApiResponse,
   ApiError,
   getTokenFromCookies,
} from "../../Api";

const rota = "estatistica/relatorios-voo/";

// Espelha `RelatorioVooOut` (api/fcontrol_api/schemas/estatistica/relatorio_voo.py).
export const relatorioVooSchema = z.object({
   id: z.number(),
   anv: z.string(),
   data: z.string(),
   seq: z.number(),
   file_path: z.string(),
   file_name: z.string(),
   file_size: z.number(),
   num_paginas: z.number().nullable(),
   obs: z.string().nullable(),
   uploaded_by: z.number(),
   uploaded_by_p_g: z.string(),
   uploaded_by_nome_guerra: z.string(),
   created_at: z.string(),
});
export type RelatorioVoo = z.infer<typeof relatorioVooSchema>;

export const relatoriosVooPeriodoSchema = z.object({
   itens: z.array(relatorioVooSchema),
   contagem_por_anv: z.record(z.string(), z.number()),
});
export type RelatoriosVooPeriodo = z.infer<typeof relatoriosVooPeriodoSchema>;

export interface ListarParams {
   data_ini: string; // AAAA-MM-DD
   data_fim: string; // AAAA-MM-DD
   anv?: string;
}

export async function listarRelatoriosDoPeriodo(
   params: ListarParams,
   signal?: AbortSignal
): Promise<RelatoriosVooPeriodo> {
   const parsed = await parseApiResponse<unknown>(
      await request("GET", rota, null, { ...params }, signal)
   );
   if (!parsed.ok) {
      throw new ApiError(
         parsed.message || "Erro ao carregar relatórios",
         parsed.errors
      );
   }
   // Contrato malformado é falha de carga, não lista vazia.
   return relatoriosVooPeriodoSchema.parse(parsed.data);
}

export async function urlDoArquivo(
   id: number,
   disposicao: "inline" | "attachment" = "inline"
): Promise<string> {
   const parsed = await parseApiResponse<{ url: string }>(
      await request("GET", `${rota}${id}/arquivo`, null, { disposicao })
   );
   if (!parsed.ok || !parsed.data) {
      throw new ApiError(
         parsed.message || "Erro ao abrir o relatório",
         parsed.errors
      );
   }
   return parsed.data.url;
}

export async function atualizarObservacao(
   id: number,
   obs: string | null
): Promise<RelatorioVoo> {
   const parsed = await parseApiResponse<unknown>(
      await request("PATCH", `${rota}${id}`, { obs })
   );
   if (!parsed.ok) {
      throw new ApiError(
         parsed.message || "Erro ao salvar a observação",
         parsed.errors
      );
   }
   return relatorioVooSchema.parse(parsed.data);
}

export async function excluirRelatorio(id: number): Promise<void> {
   const parsed = await parseApiResponse<null>(
      await request("DELETE", `${rota}${id}`)
   );
   if (!parsed.ok) {
      throw new ApiError(
         parsed.message || "Erro ao excluir o relatório",
         parsed.errors
      );
   }
}

export interface EnvioRelatorio {
   file: File;
   anv: string;
   data: string; // AAAA-MM-DD
   obs?: string;
}

/**
 * Multipart usa `fetch` cru (o `request()` só monta JSON), com URL absoluta e
 * token do cookie — mesmo padrão de `services/routes/aeromedica/atas.ts`.
 * Lança `ApiError` com `status` e `errors` para o modal distinguir 409.
 */
export async function enviarRelatorio(
   envio: EnvioRelatorio
): Promise<RelatorioVoo> {
   const form = new FormData();
   form.append("file", envio.file);
   form.append("anv", envio.anv);
   form.append("data", envio.data);
   if (envio.obs) form.append("obs", envio.obs);

   const token = getTokenFromCookies();
   const headers: HeadersInit = token
      ? { Authorization: `Bearer ${token}` }
      : {};

   const response = await fetch(`${baseUrl}${rota}`, {
      method: "POST",
      headers,
      body: form,
   });
   const json = await response.json().catch(() => null);
   if (!response.ok) {
      throw new ApiError(
         json?.message || `Erro ${response.status} ao enviar`,
         json?.errors ?? null,
         response.status
      );
   }
   return relatorioVooSchema.parse(json?.data);
}
