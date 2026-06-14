import request from "../Api";
import type { ApiResponse } from "@/types/api";
import { UserPublic } from "./users";

const indispRoute = "indisp/";

export interface CrewIndisp {
   trig: string;
   id: number;
   user: UserPublic;
   func: { func: string; oper: string; proj: string };
   cemal: string | null;
   data_ult_voo: string | null;
}

export interface IndispType {
   id?: number;
   user_id?: number;
   date_start: string;
   date_end: string;
   mtv: string;
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
   return json.data || [];
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
      throw new Error(json.message || "Erro ao criar indisponibilidade");
   }
   return json.message || "Sucesso";
}

export async function updateIndisp(indisp: IndispType): Promise<string> {
   const response = await request("PUT", indispRoute + indisp.id, indisp);
   const json: ApiResponse<null> = await response.json();
   if (!response.ok) {
      throw new Error(json.message || "Erro ao atualizar indisponibilidade");
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
