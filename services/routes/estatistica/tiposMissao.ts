import request, { parseApiResponse, readApiData } from "../../Api";
import type { ApiResponse, ApiResult } from "@/types/api";

const tiposMissaoRoute = "estatistica/tipo-missao/";

export interface TipoMissaoPublic {
   id: number;
   cod: string;
   desc: string;
}

export interface TipoMissaoCreate {
   cod: string;
   desc: string;
}

/** PUT parcial: só os campos enviados mudam. */
export interface TipoMissaoUpdate {
   cod?: string;
   desc?: string;
}

export async function getTiposMissao(
   signal?: AbortSignal
): Promise<TipoMissaoPublic[]> {
   const response = await request("GET", tiposMissaoRoute, null, null, signal);
   const json = await readApiData<ApiResponse<TipoMissaoPublic[]>>(response);
   return json.data || [];
}

// ============================================================================
// Escrita (admin de sistema) — tabela global, sem `uae`
// ============================================================================

export async function createTipoMissao(
   data: TipoMissaoCreate
): Promise<ApiResult<TipoMissaoPublic>> {
   return parseApiResponse<TipoMissaoPublic>(
      await request("POST", tiposMissaoRoute, data)
   );
}

export async function updateTipoMissao(
   id: number,
   data: TipoMissaoUpdate
): Promise<ApiResult<TipoMissaoPublic>> {
   return parseApiResponse<TipoMissaoPublic>(
      await request("PUT", `${tiposMissaoRoute}${id}`, data)
   );
}

export async function deleteTipoMissao(id: number): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("DELETE", `${tiposMissaoRoute}${id}`)
   );
}
