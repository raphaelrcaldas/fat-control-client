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
