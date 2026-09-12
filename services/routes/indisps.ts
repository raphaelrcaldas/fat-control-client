import request, { ApiError } from "../Api";
import type { IndispMtv } from "@/constants/ops/indisponibilidades";
import type { ApiResponse } from "@/types/api";
import { UserPublic } from "./users";
import {
   RestricoesDerivadasEntrySchema,
   type RestricaoDerivada,
} from "./ops/restricoes";

const indispRoute = "indisp/";

export interface CrewIndisp {
   trig: string;
   id: number;
   user: UserPublic;
   func: string;
   oper: string;
   proj: string;
   data_op: string | null;
   cemal: string | null;
   data_ult_voo: string | null;
}

export interface IndispType {
   id?: number;
   user_id?: number;
   date_start: string;
   date_end: string;
   mtv: IndispMtv;
   obs: string | null;
   created_by?: number;
   created_at?: string;
   updated_at?: string | null;
   deleted_at?: string | null;
   user_created?: UserPublic;
}

export interface CrewIndispList {
   trip: CrewIndisp;
   indisps: IndispType[];
   restricoes_derivadas: RestricaoDerivada[];
   elegivel_desadaptacao: boolean;
}

// Interface para filtros de indisponibilidade
export interface IndispFilters {
   [key: string]: string | undefined;
   date_from?: string;
   date_to?: string;
   mtv?: string;
}

// ========================================
// Queries
// ========================================

export async function getCrewIndisps(
   func: string,
   dateFrom: string,
   dateTo: string,
   signal?: AbortSignal
): Promise<CrewIndispList[]> {
   const response = await request(
      "GET",
      indispRoute,
      null,
      { funcao: func, date_from: dateFrom, date_to: dateTo },
      signal
   );
   const json = (await response.json()) as ApiResponse<CrewIndispList[]>;
   if (!response.ok) {
      throw new Error(json.message || "Erro ao buscar indisponibilidades");
   }
   if (!json.data) {
      throw new Error("Resposta vazia do servidor");
   }
   return json.data.map((entry) => ({
      ...entry,
      ...RestricoesDerivadasEntrySchema.parse(entry),
   }));
}

export async function getIndispByUser(
   userId: number,
   filters?: IndispFilters,
   signal?: AbortSignal
): Promise<IndispType[]> {
   const response = await request(
      "GET",
      `${indispRoute}user/${userId}`,
      null,
      filters,
      signal
   );
   const json = (await response.json()) as ApiResponse<IndispType[]>;
   if (!response.ok) {
      throw new Error(
         json.message || "Erro ao buscar indisponibilidades do usuário"
      );
   }
   return json.data || [];
}

// ========================================
// Mutations
// ========================================

export async function addIndisp(indisp: IndispType): Promise<string> {
   const response = await request("POST", indispRoute, indisp);
   const json: ApiResponse<null> = await response.json();
   if (!response.ok) {
      throw new ApiError(
         json.message || "Erro ao criar indisponibilidade",
         json.errors
      );
   }
   return json.message || "Sucesso";
}

export async function updateIndisp(indisp: IndispType): Promise<string> {
   const response = await request("PUT", indispRoute + indisp.id, indisp);
   const json: ApiResponse<null> = await response.json();
   if (!response.ok) {
      throw new ApiError(
         json.message || "Erro ao atualizar indisponibilidade",
         json.errors
      );
   }
   return json.message || "Sucesso";
}

export async function deleteIndisp(indispId: number): Promise<string> {
   const response = await request("DELETE", indispRoute + indispId);
   const json: ApiResponse<null> = await response.json();
   if (!response.ok) {
      throw new Error(json.message || "Erro ao excluir indisponibilidade");
   }
   return json.message || "Sucesso";
}
