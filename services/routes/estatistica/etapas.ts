import request, { parseApiResponse } from "../../Api";
import type { ApiPaginatedResponse, ApiResponse, ApiResult } from "@/types/api";

const etapasRoute = "estatistica/etapas/";

export interface EtapaItem {
   id: number;
   data: string;
   origem: string;
   destino: string;
   dep: string;
   arr: string;
   tvoo: number;
   anv: string;
   tow: number | null;
   pax: number | null;
   carga: number | null;
   comb: number | null;
   lub: number | null;
   nivel: string | null;
   sagem: boolean;
   parte1: boolean;
   obs: string | null;
   oi_etapas: OIEtapaItem[];
   tripulantes: TripEtapaItem[];
}

export interface MissaoComEtapas {
   id: number;
   titulo: string | null;
   obs: string | null;
   etapas: EtapaItem[];
}

export interface MissaoPublic {
   id: number;
   titulo: string | null;
   obs: string | null;
}

export interface MissaoCreate {
   titulo?: string | null;
   obs?: string | null;
}

export interface MissaoUpdate {
   titulo?: string | null;
   obs?: string | null;
}

export interface GetEtapasParams {
   data_ini?: string;
   data_fim?: string;
   origem?: string;
   destino?: string;
   anv?: string[];
   esf_aer?: string;
   tipo_missao_cod?: string[];
   trip_search?: string;
   page?: number;
   per_page?: number;
}

export interface PaginatedEtapasResponse {
   items: MissaoComEtapas[];
   total: number;
   page: number;
   per_page: number;
   pages: number;
   total_items: number;
}

export interface EtapaFlatItem extends EtapaItem {
   missao_id: number;
   missao_titulo: string | null;
}

export interface PaginatedEtapasFlatResponse {
   items: EtapaFlatItem[];
   total: number;
   page: number;
   per_page: number;
   pages: number;
}

export interface TripEtapaItem {
   trip_id: number;
   trig: string;
   nome_guerra: string;
   p_g: string;
   func: string;
   func_bordo: string;
}

export interface OIEtapaItem {
   esf_aer_id: number;
   tipo_missao_id: number;
   esf_aer: string;
   tipo_missao_cod: string;
   reg: "d" | "n" | "v";
   tvoo: number;
}

export interface EtapaDetail extends EtapaItem {
   pousos: number;
}

export async function getEtapaDetail(
   id: number,
   signal?: AbortSignal
): Promise<EtapaDetail> {
   const response = await request(
      "GET",
      `${etapasRoute}${id}`,
      null,
      undefined,
      signal
   );
   const json = (await response.json()) as ApiResponse<EtapaDetail>;
   if (!response.ok) {
      throw new Error(json.message || "Etapa não encontrada");
   }
   return json.data!;
}

export async function getEtapas(
   params?: GetEtapasParams,
   signal?: AbortSignal
): Promise<PaginatedEtapasResponse> {
   const queryParams = params
      ? {
           ...(params.data_ini && { data_ini: params.data_ini }),
           ...(params.data_fim && { data_fim: params.data_fim }),
           ...(params.origem && { origem: params.origem }),
           ...(params.destino && { destino: params.destino }),
           ...(params.anv && params.anv.length > 0 && { anv: params.anv }),
           ...(params.esf_aer && { esf_aer: params.esf_aer }),
           ...(params.tipo_missao_cod &&
              params.tipo_missao_cod.length > 0 && {
                 tipo_missao_cod: params.tipo_missao_cod,
              }),
           ...(params.trip_search && { trip_search: params.trip_search }),
           ...(params.page != null && { page: params.page.toString() }),
           ...(params.per_page != null && {
              per_page: params.per_page.toString(),
           }),
        }
      : undefined;
   const response = await request(
      "GET",
      etapasRoute,
      null,
      queryParams,
      signal
   );
   const json =
      (await response.json()) as ApiPaginatedResponse<MissaoComEtapas>;
   return {
      items: json.data || [],
      total: json.total,
      page: json.page,
      per_page: json.per_page,
      pages: json.pages,
      total_items: json.total_items ?? 0,
   };
}

export async function getEtapasFlat(
   params?: GetEtapasParams,
   signal?: AbortSignal
): Promise<PaginatedEtapasFlatResponse> {
   const queryParams: Record<string, string | string[]> = { flat: "true" };
   if (params) {
      if (params.data_ini) queryParams.data_ini = params.data_ini;
      if (params.data_fim) queryParams.data_fim = params.data_fim;
      if (params.origem) queryParams.origem = params.origem;
      if (params.destino) queryParams.destino = params.destino;
      if (params.anv && params.anv.length > 0) queryParams.anv = params.anv;
      if (params.esf_aer) queryParams.esf_aer = params.esf_aer;
      if (params.tipo_missao_cod && params.tipo_missao_cod.length > 0)
         queryParams.tipo_missao_cod = params.tipo_missao_cod;
      if (params.trip_search) queryParams.trip_search = params.trip_search;
      if (params.page != null) queryParams.page = params.page.toString();
      if (params.per_page != null)
         queryParams.per_page = params.per_page.toString();
   }
   const response = await request(
      "GET",
      etapasRoute,
      null,
      queryParams,
      signal
   );
   const json = (await response.json()) as ApiPaginatedResponse<EtapaFlatItem>;
   return {
      items: json.data || [],
      total: json.total,
      page: json.page,
      per_page: json.per_page,
      pages: json.pages,
   };
}

// ─── Etapa CRUD ────────────────────────────────────────────────────────────

export interface TripEtapaIn {
   trip_id: number;
   func: string;
   func_bordo: string;
}

export interface OIEtapaIn {
   esf_aer_id: number;
   tipo_missao_id: number;
   reg: "d" | "n" | "v";
   tvoo: number;
}

export interface EtapaCreatePayload {
   missao_id: number;
   data: string;
   origem: string;
   destino: string;
   dep: string;
   arr: string;
   tvoo: number;
   anv: string;
   pousos: number;
   tow?: number | null;
   pax?: number | null;
   carga?: number | null;
   comb?: number | null;
   lub?: number | null;
   nivel?: string | null;
   sagem: boolean;
   parte1: boolean;
   obs?: string | null;
   tripulantes: TripEtapaIn[];
   oi_etapas: OIEtapaIn[];
}

export interface EtapaUpdatePayload extends Partial<
   Omit<EtapaCreatePayload, "missao_id">
> {
   tripulantes?: TripEtapaIn[];
   oi_etapas?: OIEtapaIn[];
}

export interface EtapaPublic {
   id: number;
}

export async function createEtapa(
   data: EtapaCreatePayload
): Promise<ApiResult<EtapaPublic>> {
   return parseApiResponse<EtapaPublic>(
      await request("POST", etapasRoute, data)
   );
}

export async function updateEtapa(
   id: number,
   data: EtapaUpdatePayload
): Promise<ApiResult<EtapaPublic>> {
   return parseApiResponse<EtapaPublic>(
      await request("PUT", `${etapasRoute}${id}`, data)
   );
}

export async function deleteEtapa(id: number): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("DELETE", `${etapasRoute}${id}`)
   );
}

// ─── Bulk Update ──────────────────────────────────────────────────────────

export interface BulkUpdatePayload {
   ids: number[];
   data: Pick<EtapaUpdatePayload, "sagem" | "parte1">;
}

export async function bulkUpdateEtapas(
   payload: BulkUpdatePayload
): Promise<ApiResult<null>> {
   const results = await Promise.all(
      payload.ids.map((id) => updateEtapa(id, payload.data))
   );
   const failed = results.filter((r) => !r.ok);
   if (failed.length > 0) {
      return {
         ok: false,
         data: null,
         message: `Falha ao atualizar ${failed.length} de ${payload.ids.length} etapas`,
      };
   }
   return { ok: true, data: null, message: null };
}

// ─── Export ───────────────────────────────────────────────────────────────

export interface ExportEtapasPayload {
   ids: number[];
   pousos: boolean;
   nivel: boolean;
   tow: boolean;
   pax: boolean;
   carga: boolean;
   comb: boolean;
   lub: boolean;
   esforco_aereo: boolean;
   tripulantes: boolean;
}

export async function exportEtapas(
   payload: ExportEtapasPayload
): Promise<Blob> {
   const response = await request("POST", `${etapasRoute}export`, payload);
   if (!response.ok) {
      const json = await response.json();
      throw new Error(json.message || "Erro ao exportar etapas");
   }
   return response.blob();
}

// ─── Missão CRUD ───────────────────────────────────────────────────────────

const missaoRoute = "estatistica/missao/";

export async function createMissao(
   data: MissaoCreate
): Promise<ApiResult<MissaoPublic>> {
   return parseApiResponse<MissaoPublic>(
      await request("POST", missaoRoute, data)
   );
}

export async function updateMissao(
   id: number,
   data: MissaoUpdate
): Promise<ApiResult<MissaoPublic>> {
   return parseApiResponse<MissaoPublic>(
      await request("PUT", `${missaoRoute}${id}`, data)
   );
}

export async function deleteMissao(id: number): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("DELETE", `${missaoRoute}${id}`)
   );
}
