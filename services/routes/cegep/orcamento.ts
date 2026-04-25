import request, { parseApiResponse } from "../../Api";
import type { ApiResponse, ApiResult } from "@/types/api";
import { cegepRoute } from ".";

const orcamentoRoute = cegepRoute + "orcamento/";

export interface OrcamentoAnual {
   id: number;
   ano_ref: number;
   total: number;
   abertura: number;
   fechamento: number;
}

export interface OrcamentoAnualPayload {
   ano_ref: number;
   total: number;
   abertura: number;
   fechamento: number;
}

export interface OrcamentoLogUser {
   id: number;
   p_g: string;
   nome_guerra: string;
}

export interface OrcamentoSnapshot {
   ano_ref: number;
   total: number;
   abertura: number;
   fechamento: number;
}

export interface OrcamentoLog {
   id: number;
   user: OrcamentoLogUser;
   action: string;
   before: OrcamentoSnapshot | null;
   after: OrcamentoSnapshot | null;
   timestamp: string;
}

export async function getOrcamento(
   ano: number,
   signal?: AbortSignal
): Promise<OrcamentoAnual | null> {
   const response = await request(
      "GET",
      orcamentoRoute,
      null,
      { ano: ano.toString() },
      signal
   );
   const json = (await response.json()) as ApiResponse<OrcamentoAnual | null>;
   return json.data ?? null;
}

export async function createOrcamento(
   payload: OrcamentoAnualPayload
): Promise<ApiResult<OrcamentoAnual>> {
   return parseApiResponse<OrcamentoAnual>(
      await request("POST", orcamentoRoute, payload)
   );
}

export async function updateOrcamento(
   id: number,
   payload: OrcamentoAnualPayload
): Promise<ApiResult<OrcamentoAnual>> {
   return parseApiResponse<OrcamentoAnual>(
      await request("PUT", `${orcamentoRoute}${id}`, payload)
   );
}

export async function getOrcamentoLogs(
   id: number,
   signal?: AbortSignal
): Promise<OrcamentoLog[]> {
   const response = await request(
      "GET",
      `${orcamentoRoute}${id}/logs`,
      null,
      null,
      signal
   );
   const json = (await response.json()) as ApiResponse<OrcamentoLog[]>;
   return json.data ?? [];
}
