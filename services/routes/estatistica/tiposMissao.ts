import request, { readApiData } from "../../Api";
import type { ApiResponse } from "@/types/api";

const tiposMissaoRoute = "estatistica/tipo-missao/";

export interface TipoMissaoPublic {
   id: number;
   cod: string;
   desc: string;
}

export async function getTiposMissao(
   signal?: AbortSignal
): Promise<TipoMissaoPublic[]> {
   const response = await request("GET", tiposMissaoRoute, null, null, signal);
   const json = await readApiData<ApiResponse<TipoMissaoPublic[]>>(response);
   return json.data || [];
}
