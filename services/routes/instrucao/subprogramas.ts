import request, { parseApiResponse } from "../../Api";
import type { ApiResult } from "@/types/api";
import { instrucaoRoute } from ".";

const subprogramasRoute = instrucaoRoute + "subprogramas/";

/**
 * Espelha `TipoSubprograma` do backend
 * (`api/fcontrol_api/schemas/instrucao/subprogramas.py`). É doutrina, não
 * cadastro por unidade — por isso lista fechada, e o rótulo exibido é o
 * próprio valor, sem mapa de tradução.
 */
export const TIPOS_SUBPROGRAMA = [
   "Formação",
   "Manutenção",
   "Especialização",
] as const;

export type TipoSubprograma = (typeof TIPOS_SUBPROGRAMA)[number];

/** 4 letras, hífen, 2 dígitos — ex.: SPFO-01. */
export const CODIGO_SUBPROGRAMA_RE = /^[A-Z]{4}-\d{2}$/;

export interface Subprograma {
   id: number;
   codigo: string;
   descricao: string;
   tipo: TipoSubprograma;
   func: string;
   observacoes: string | null;
}

export type SubprogramaUpsert = Omit<Subprograma, "id">;

export async function getSubprogramas(
   signal?: AbortSignal
): Promise<Subprograma[]> {
   const response = await request("GET", subprogramasRoute, null, null, signal);
   const result = await parseApiResponse<Subprograma[]>(response);
   if (!result.ok) {
      throw new Error(result.message || "Erro ao carregar subprogramas");
   }
   return result.data ?? [];
}

export async function createSubprograma(
   data: SubprogramaUpsert
): Promise<ApiResult<Subprograma>> {
   return parseApiResponse<Subprograma>(
      await request("POST", subprogramasRoute, data)
   );
}

export async function updateSubprograma(
   id: number,
   data: SubprogramaUpsert
): Promise<ApiResult<Subprograma>> {
   return parseApiResponse<Subprograma>(
      await request("PUT", `${subprogramasRoute}${id}`, data)
   );
}

export async function deleteSubprograma(id: number): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("DELETE", `${subprogramasRoute}${id}`)
   );
}
