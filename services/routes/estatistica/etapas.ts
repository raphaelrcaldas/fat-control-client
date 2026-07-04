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
   pousos: number;
   sagem: boolean;
   parte1: boolean;
   obs: string | null;
   oi_etapas: OIEtapaItem[];
   tripulantes: TripEtapaItem[];
   pqd: PqdEtapaItem[];
   revo: RevoEtapaItem[];
   heavy_cds: HeavyCdsEtapaItem[];
}

export interface MissaoComEtapas {
   id: number;
   titulo: string | null;
   obs: string | null;
   is_simulador: boolean;
   etapas: EtapaItem[];
}

export interface MissaoPublic {
   id: number;
   titulo: string | null;
   obs: string | null;
   is_simulador: boolean;
}

export interface MissaoCreate {
   titulo?: string | null;
   obs?: string | null;
   is_simulador?: boolean;
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
   funcao?: string;
   is_simulador?: boolean;
   page?: number;
   per_page?: number;
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
   ant: number;
   ult_promo: string | null;
   ant_rel: number | null;
}

export interface OIEtapaItem {
   esf_aer_id: number;
   tipo_missao_id: number;
   esf_aer: string;
   tipo_missao_cod: string;
   reg: "d" | "n" | "v";
   tvoo: number;
}

export type PqdTipo = "VTC" | "LV" | "PREC" | "LIVRE";
export type HeavyCdsTipo = "heavy" | "cds";

export interface PqdEtapaItem {
   tipo: PqdTipo;
   qtd: number;
}

export interface RevoEtapaItem {
   comb_transf: number;
}

export interface HeavyCdsEtapaItem {
   tipo: HeavyCdsTipo;
   peso: number;
   dist: number;
   radial: number;
}

export interface EtapaDetail extends EtapaItem {
   tow: number | null;
   pax: number | null;
   carga: number | null;
   comb: number | null;
   lub: number | null;
   nivel: string | null;
}

export interface MissaoComEtapasDetail extends Omit<MissaoComEtapas, "etapas"> {
   etapas: EtapaDetail[];
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
): Promise<MissaoComEtapas[]> {
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
           ...(params.funcao && { funcao: params.funcao }),
           ...(params.is_simulador != null && {
              is_simulador: params.is_simulador ? "true" : "false",
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
   const json = (await response.json()) as ApiResponse<MissaoComEtapas[]>;
   return json.data ?? [];
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
      if (params.funcao) queryParams.funcao = params.funcao;
      if (params.is_simulador != null)
         queryParams.is_simulador = params.is_simulador ? "true" : "false";
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

export interface PqdEtapaIn {
   tipo: PqdTipo;
   qtd: number;
}

export interface RevoEtapaIn {
   comb_transf: number;
}

export interface HeavyCdsEtapaIn {
   tipo: HeavyCdsTipo;
   peso: number;
   dist: number;
   radial: number;
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
         errors: null,
      };
   }
   return { ok: true, data: null, message: null, errors: null };
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

export interface ExportEtapasResult {
   blob: Blob;
   filename: string | null;
}

function parseContentDispositionFilename(header: string | null): string | null {
   if (!header) return null;
   // filename*=UTF-8''... tem prioridade sobre filename="..."
   const star = header.match(/filename\*=(?:UTF-8'')?([^;]+)/i);
   if (star?.[1]) {
      try {
         return decodeURIComponent(star[1].trim().replace(/^"|"$/g, ""));
      } catch {
         // formato inesperado — cai para o filename simples
      }
   }
   const simple = header.match(/filename="?([^";]+)"?/i);
   return simple?.[1]?.trim() ?? null;
}

export async function exportEtapas(
   payload: ExportEtapasPayload
): Promise<ExportEtapasResult> {
   const response = await request("POST", `${etapasRoute}export`, payload);
   if (!response.ok) {
      const json = await response.json();
      throw new Error(json.message || "Erro ao exportar etapas");
   }
   const filename = parseContentDispositionFilename(
      response.headers.get("content-disposition")
   );
   return { blob: await response.blob(), filename };
}

// ─── Missão CRUD ───────────────────────────────────────────────────────────

const missaoRoute = "estatistica/missao/";

export async function getMissao(
   id: number,
   signal?: AbortSignal
): Promise<MissaoComEtapasDetail> {
   const response = await request(
      "GET",
      `${missaoRoute}${id}`,
      null,
      undefined,
      signal
   );
   const json = (await response.json()) as ApiResponse<MissaoComEtapasDetail>;
   if (!response.ok) {
      throw new Error(json.message || "Missão não encontrada");
   }
   return json.data!;
}

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

export async function deleteMissaoComEtapas(
   id: number
): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("DELETE", `${missaoRoute}${id}/com-etapas`)
   );
}

// ─── Missão + Etapas atomico ──────────────────────────────────────────────

export interface EtapaCreateNestedPayload {
   data: string;
   origem: string;
   destino: string;
   dep: string; // HH:mm:ss
   arr: string; // HH:mm:ss
   tvoo: number;
   anv: string;
   pousos: number;
   tow: number | null;
   pax: number | null;
   carga: number | null;
   comb: number | null;
   lub: number | null;
   nivel: string | null;
   sagem: boolean;
   parte1: boolean;
   obs: string | null;
   tripulantes: TripEtapaIn[];
   oi_etapas: OIEtapaIn[];
   pqd: PqdEtapaIn[];
   revo: RevoEtapaIn[];
   heavy_cds: HeavyCdsEtapaIn[];
}

export interface MissaoComEtapasCreatePayload {
   titulo: string | null;
   obs: string | null;
   is_simulador: boolean;
   etapas: EtapaCreateNestedPayload[];
}

export async function createMissaoWithEtapas(
   data: MissaoComEtapasCreatePayload
): Promise<ApiResult<MissaoPublic>> {
   return parseApiResponse<MissaoPublic>(
      await request("POST", `${missaoRoute}with-etapas`, data)
   );
}

export interface EtapaUpdateNestedPayload extends EtapaCreateNestedPayload {
   id: number;
}

export interface MissaoComEtapasUpdatePayload {
   titulo: string | null;
   obs: string | null;
   delete_ids: number[];
   update: EtapaUpdateNestedPayload[];
   create: EtapaCreateNestedPayload[];
}

export async function updateMissaoWithEtapas(
   id: number,
   data: MissaoComEtapasUpdatePayload
): Promise<ApiResult<MissaoComEtapasDetail>> {
   return parseApiResponse<MissaoComEtapasDetail>(
      await request("PUT", `${missaoRoute}${id}/with-etapas`, data)
   );
}
