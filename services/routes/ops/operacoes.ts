import request, { parseApiResponse } from "../../Api";
import type { ApiResponse, ApiResult } from "@/types/api";
import type { UserPublic } from "services/routes/users";

const operacoesRoute = "ops/operacoes/";

export type OperTipo = "operacao" | "manobra" | "exercicio";
export type OperStatus = "planejada" | "andamento" | "encerrada" | "cancelada";

export interface CidadeMini {
   codigo: number;
   nome: string;
   uf: string;
}

export interface OperacaoListItem {
   id: number;
   numero: number;
   nome: string;
   tipo: OperTipo;
   status: OperStatus;
   documento_referencia: string | null;
   cidade: CidadeMini | null;
   data_inicio: string;
   data_fim: string;
   dias: number;
   horas: number; // Σ tvoo em minutos
   etapas: number;
   anv: number;
}

export interface OperacaoTabCounts {
   todas: number;
   andamento: number;
   encerrada: number;
   planejada: number;
   cancelada: number;
}

export interface OperacaoListResponse {
   items: OperacaoListItem[];
   counts: OperacaoTabCounts;
}

export interface OperacaoKpis {
   horas: number;
   etapas: number;
   anv: number;
   pax: number;
   carga: number;
   comb: number;
   missoes: number;
   modelos: number;
}

export interface EsforcoRow {
   esf_aer_id: number;
   descricao: string;
   etapas: number;
   horas: number;
}

export interface EsforcoBloco {
   rows: EsforcoRow[];
   total_etapas: number;
   total_horas: number;
}

export interface SeboRow {
   trip_id: number;
   nome: string;
   func: string;
   etapas: number;
   horas: number;
}

export interface OperacaoDetail {
   id: number;
   numero: number;
   nome: string;
   tipo: OperTipo;
   status: OperStatus;
   documento_referencia: string | null;
   cidade: CidadeMini | null;
   data_inicio: string;
   data_fim: string;
   dias: number;
   obs: string | null;
   created_at: string;
   kpis: OperacaoKpis;
   esforco: EsforcoBloco;
   sebo: SeboRow[];
}

export interface OperacaoEtapaRow {
   id: number;
   data: string;
   origem: string;
   destino: string;
   anv: string;
   esforco: string | null;
   tvoo: number;
   dep: string;
   arr: string;
}

export interface EtapaCandidata {
   id: number;
   data: string;
   origem: string;
   destino: string;
   anv: string;
   missao_id: number;
   tvoo: number;
   dep: string;
   arr: string;
   bloqueada: boolean;
   operacao_atual: number | null;
}

export type FuncPessoal = "Tripulante" | "Apoio" | "Manutenção";
export type SitPessoal = "d" | "g" | "c";

export interface OperacaoPessoalOut {
   id: number;
   user: UserPublic;
   func: FuncPessoal;
   sit: SitPessoal;
   data_ingresso: string;
   data_regresso: string;
   dias: number;
}

export interface OperacaoCreate {
   nome: string;
   tipo: OperTipo;
   cidade_id: number;
   data_inicio: string;
   data_fim: string;
   status: OperStatus;
   documento_referencia: string | null;
   obs: string | null;
}

export type OperacaoUpdate = Partial<OperacaoCreate>;

export interface OperacaoPessoalIn {
   user_id: number;
   func: FuncPessoal;
   sit: SitPessoal;
   data_ingresso: string;
   data_regresso: string;
}

export interface AssociarResult {
   associadas: number;
   bloqueadas: number[];
}

export interface GetOperacoesParams {
   status?: OperStatus;
   tipo?: OperTipo;
   date_start?: string;
   date_end?: string;
   q?: string;
}

// --------------------------------------------------------------------------- //
// Leitura
// --------------------------------------------------------------------------- //
export async function getOperacoes(
   params?: GetOperacoesParams,
   signal?: AbortSignal
): Promise<OperacaoListResponse> {
   const queryParams: Record<string, string> = {};
   if (params?.status) queryParams.status = params.status;
   if (params?.tipo) queryParams.tipo = params.tipo;
   if (params?.date_start) queryParams.date_start = params.date_start;
   if (params?.date_end) queryParams.date_end = params.date_end;
   if (params?.q) queryParams.q = params.q;

   const response = await request(
      "GET",
      operacoesRoute,
      null,
      queryParams,
      signal
   );
   if (!response.ok) {
      throw new Error(`Erro ao buscar operações: ${response.status}`);
   }
   const json = (await response.json()) as ApiResponse<OperacaoListResponse>;
   return json.data ?? { items: [], counts: emptyCounts() };
}

export class OperacaoFetchError extends Error {
   status: number;

   constructor(status: number) {
      super(`Erro ao buscar operação: ${status}`);
      this.status = status;
   }
}

export async function getOperacao(
   id: number,
   signal?: AbortSignal
): Promise<OperacaoDetail> {
   const response = await request(
      "GET",
      `${operacoesRoute}${id}`,
      null,
      null,
      signal
   );
   if (!response.ok) {
      throw new OperacaoFetchError(response.status);
   }
   const json = (await response.json()) as ApiResponse<OperacaoDetail>;
   return json.data as OperacaoDetail;
}

export async function getOperacaoEtapas(
   id: number,
   signal?: AbortSignal
): Promise<OperacaoEtapaRow[]> {
   const response = await request(
      "GET",
      `${operacoesRoute}${id}/etapas`,
      null,
      null,
      signal
   );
   if (!response.ok) {
      throw new Error(`Erro ao buscar etapas: ${response.status}`);
   }
   const json = (await response.json()) as ApiResponse<OperacaoEtapaRow[]>;
   return json.data ?? [];
}

export async function getCandidatas(
   id: number,
   signal?: AbortSignal
): Promise<EtapaCandidata[]> {
   const response = await request(
      "GET",
      `${operacoesRoute}${id}/candidatas`,
      null,
      null,
      signal
   );
   if (!response.ok) {
      throw new Error(`Erro ao buscar candidatas: ${response.status}`);
   }
   const json = (await response.json()) as ApiResponse<EtapaCandidata[]>;
   return json.data ?? [];
}

export async function getPessoal(
   id: number,
   signal?: AbortSignal
): Promise<OperacaoPessoalOut[]> {
   const response = await request(
      "GET",
      `${operacoesRoute}${id}/pessoal`,
      null,
      null,
      signal
   );
   if (!response.ok) {
      throw new Error(`Erro ao buscar pessoal: ${response.status}`);
   }
   const json = (await response.json()) as ApiResponse<OperacaoPessoalOut[]>;
   return json.data ?? [];
}

// --------------------------------------------------------------------------- //
// Escrita
// --------------------------------------------------------------------------- //
export async function createOperacao(
   data: OperacaoCreate
): Promise<ApiResult<OperacaoListItem>> {
   return parseApiResponse<OperacaoListItem>(
      await request("POST", operacoesRoute, data)
   );
}

export async function updateOperacao(
   id: number,
   data: OperacaoUpdate
): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("PUT", `${operacoesRoute}${id}`, data)
   );
}

export async function deleteOperacao(id: number): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("DELETE", `${operacoesRoute}${id}`)
   );
}

export async function associarEtapas(
   id: number,
   etapa_ids: number[]
): Promise<ApiResult<AssociarResult>> {
   return parseApiResponse<AssociarResult>(
      await request("POST", `${operacoesRoute}${id}/etapas`, { etapa_ids })
   );
}

export async function desassociarEtapa(
   id: number,
   etapaId: number
): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("DELETE", `${operacoesRoute}${id}/etapas/${etapaId}`)
   );
}

export async function addPessoal(
   id: number,
   data: OperacaoPessoalIn
): Promise<ApiResult<OperacaoPessoalOut>> {
   return parseApiResponse<OperacaoPessoalOut>(
      await request("POST", `${operacoesRoute}${id}/pessoal`, data)
   );
}

export async function updatePessoal(
   id: number,
   pessoalId: number,
   data: OperacaoPessoalIn
): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("PUT", `${operacoesRoute}${id}/pessoal/${pessoalId}`, data)
   );
}

export async function removePessoal(
   id: number,
   pessoalId: number
): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("DELETE", `${operacoesRoute}${id}/pessoal/${pessoalId}`)
   );
}

function emptyCounts(): OperacaoTabCounts {
   return {
      todas: 0,
      andamento: 0,
      encerrada: 0,
      planejada: 0,
      cancelada: 0,
   };
}
