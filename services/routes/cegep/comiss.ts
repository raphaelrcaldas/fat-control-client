import request, { parseApiResponse } from "../../Api";
import type { ApiResponse, ApiResult } from "@/types/api";
import { cegepRoute } from ".";
import { Missao } from "./missoes";
import { UserPublic } from "../users";

const comissRoute = cegepRoute + "comiss/";

export interface Comiss {
   id?: number | null;
   user_id: number;
   user?: UserPublic;
   status: string;
   dep: boolean;

   data_ab: string;
   qtd_aj_ab: number;
   valor_aj_ab: number;

   data_fc: string;
   qtd_aj_fc: number;
   valor_aj_fc: number;

   dias_cumprir: number | null;

   doc_prop: string;
   doc_aut: string;
   doc_enc: string | null;
}

// Lista de comissionamentos (sem missões)
export interface ComissList extends Comiss {
   dias_comp: number;
   diarias_comp: number;
   vals_comp: number;
   modulo: boolean;
   completude: number;
   missoes_count: number;
}

// Detalhe de comissionamento (com missões)
export interface ComissWithMiss extends Comiss {
   missoes: Missao[];
   dias_comp: number;
   diarias_comp: number;
   vals_comp: number;
   modulo: boolean;
   completude: number;
}

export interface ComissFilters {
   status?: string;
   search?: string;
   pg?: string[];
   tipo?: string;
   modulo?: string;
}

export async function getCmtos(
   filters?: ComissFilters,
   signal?: AbortSignal
): Promise<ComissList[]> {
   const response = await request(
      "GET",
      comissRoute,
      null,
      {
         status: filters?.status ?? "aberto",
         search: filters?.search ?? "",
         pg: filters?.pg?.length ? filters.pg.join(",") : "",
         tipo: filters?.tipo ?? "",
         modulo: filters?.modulo ?? "",
      },
      signal
   );
   const json = (await response.json()) as ApiResponse<ComissList[]>;
   return json.data || [];
}

export async function getCmtoById(
   comissId: number,
   signal?: AbortSignal
): Promise<ComissWithMiss> {
   const response = await request("GET", `${comissRoute}${comissId}`, null, null, signal);
   const json = (await response.json()) as ApiResponse<ComissWithMiss>;
   return json.data as ComissWithMiss;
}

export async function createCmto(comiss: Comiss): Promise<ApiResult<null>> {
   return parseApiResponse<null>(await request("POST", comissRoute, comiss));
}

export async function updateCmto(comiss: Comiss): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("PUT", `${comissRoute}${comiss.id}`, comiss)
   );
}

export interface DeletePreviewMission {
   id: number;
   tipo_doc: string;
   n_doc: number;
   desc: string;
   afast: string;
   regres: string;
}

export interface DeletePreview {
   missoes_count: number;
   missoes: DeletePreviewMission[];
}

export async function deleteCmto(
   comissId: number,
   confirm?: boolean
): Promise<ApiResult<DeletePreview | null>> {
   const params = confirm ? { confirm: "true" } : null;
   return parseApiResponse<DeletePreview | null>(
      await request("DELETE", `${comissRoute}${comissId}`, null, params)
   );
}
