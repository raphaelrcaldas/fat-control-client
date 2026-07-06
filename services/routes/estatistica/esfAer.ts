import request from "../../Api";
import type { ApiResponse } from "@/types/api";

const esfAerRoute = "estatistica/esfaer/";

export interface EsfAerItem {
   id: number;
   descricao: string;
}

export async function getEsfAerList(
   signal?: AbortSignal
): Promise<EsfAerItem[]> {
   const response = await request(
      "GET",
      `${esfAerRoute}list`,
      null,
      null,
      signal
   );
   const json = (await response.json()) as ApiResponse<EsfAerItem[]>;
   return json.data || [];
}

export interface EsfAerResumoItem {
   id: number;
   descricao: string;
   alocado: number;
   voado: number;
   saldo: number;
   meses_sagem: number[];
   meses_voados: number[];
}

export interface EsfAerResumoResponse {
   items: EsfAerResumoItem[];
   total_alocado: number;
   total_voado: number;
   total_saldo: number;
   total_meses_sagem: number[];
   total_meses_voados: number[];
}

export interface EsfAerUpdateItem {
   tipo: string;
   modelo: string;
   grupo: string;
   programa: string;
   subprograma: string;
   aplicacao: string;
   horas_alocadas: number;
   meses_sagem: number[];
}

export interface EsfAerUpdateRequest {
   ano_ref: number;
   items: EsfAerUpdateItem[];
}

export interface EsfAerDiffRow {
   descricao: string;
   antes: number | null;
   depois: number | null;
}

export interface EsfAerImportResponse {
   ano_ref: number;
   rows: EsfAerDiffRow[];
   total_antes: number;
   total_depois: number;
}

export async function updateEsfAer(
   data: EsfAerUpdateRequest
): Promise<EsfAerImportResponse> {
   const response = await request("PUT", esfAerRoute, data);
   const json = (await response.json()) as ApiResponse<EsfAerImportResponse>;
   return (
      json.data ?? {
         ano_ref: data.ano_ref,
         rows: [],
         total_antes: 0,
         total_depois: 0,
      }
   );
}

/**
 * Tipos do endpoint `GET estatistica/esfaer/historico?ano_ref=`.
 * Unidade de tempo SEMPRE em minutos (formatar com `minutesToTime`).
 *
 * `grupo` é string livre (coluna real do backend) — a lista de grupos é
 * DERIVADA dos dados (ver `deriveGrupos` em `historico/utils.ts`) e grupos
 * desconhecidos recebem cor/paleta de fallback (`historico/constants.ts`).
 */

export interface HistPoint {
   /** Data ISO da mudança, "YYYY-MM-DD". */
   data: string;
   /** Esforço alocado vigente a partir desta data, em MINUTOS. */
   alocado: number;
   /** Variação em relação ao ponto anterior, em MINUTOS (criação = alocado). */
   delta: number;
}

export interface HistPrograma {
   esfaer_id: number;
   /** Descrição completa do programa (ex.: "COMAE PEO SPMAS FAB-TAL"). */
   descricao: string;
   /**
    * Nome curto de exibição (ex.: "FAB-TAL", "SAR-OPS"). O endpoint real deve
    * fornecê-lo (ou derivá-lo no backend); não é confiável derivar da
    * `descricao` na UI. Use sempre `nome` para rótulos de série/lista/legenda.
    */
   nome: string;
   /** Grupo do programa (string livre vinda do backend, ex.: "COMAE"). */
   grupo: string;
   /** Último alocado vigente da timeline, em MINUTOS. */
   atual: number;
   timeline: HistPoint[];
}

export interface EsfAerHistorico {
   ano_ref: number;
   programas: HistPrograma[];
   total: {
      /** Soma dos `atual` de todos os programas, em MINUTOS. */
      atual: number;
      /** Timeline carry-forward do total (união das datas de mudança). */
      timeline: HistPoint[];
   };
}

/**
 * Busca o histórico de esforço aéreo de um ano de referência, no mesmo
 * padrão de `getEsfAerResumo`: envelope `ApiResponse` + fallback vazio
 * quando `data` vier ausente.
 */
export async function getEsfAerHistorico(
   anoRef: number,
   signal?: AbortSignal
): Promise<EsfAerHistorico> {
   const response = await request(
      "GET",
      `${esfAerRoute}historico`,
      null,
      { ano_ref: anoRef },
      signal
   );
   const json = (await response.json()) as ApiResponse<EsfAerHistorico>;
   return (
      json.data ?? {
         ano_ref: anoRef,
         programas: [],
         total: { atual: 0, timeline: [] },
      }
   );
}

export async function getEsfAerResumo(
   anoRef: number,
   simulador: boolean,
   signal?: AbortSignal
): Promise<EsfAerResumoResponse> {
   const response = await request(
      "GET",
      esfAerRoute,
      null,
      {
         ano_ref: anoRef,
         simulador: simulador ? "true" : "false",
      },
      signal
   );
   const json = (await response.json()) as ApiResponse<EsfAerResumoResponse>;
   return (
      json.data ?? {
         items: [],
         total_alocado: 0,
         total_voado: 0,
         total_saldo: 0,
         total_meses_sagem: Array(12).fill(0),
         total_meses_voados: Array(12).fill(0),
      }
   );
}
