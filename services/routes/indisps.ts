import request from "../Api";
import { UserPublic } from "./users";

const indispRoute = "indisp/";

export interface CrewIndisp {
   trig: string;
   id: number;
   user: UserPublic;
   func: { func: string; oper: string; proj: string };
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

// Resposta padrão de mutações
export interface IndispMutationResponse {
   detail: string;
}

// ========================================
// Queries
// ========================================

export async function getCrewIndisps(
   func: string,
   uae: string,
   signal?: AbortSignal
): Promise<CrewIndispList[]> {
   const response = await request(
      "GET",
      indispRoute,
      null,
      { funcao: func, uae },
      signal
   );
   if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Erro ao buscar indisponibilidades");
   }
   return (await response.json()) as CrewIndispList[];
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
   if (!response.ok) {
      const error = await response.json();
      throw new Error(
         error.detail || "Erro ao buscar indisponibilidades do usuário"
      );
   }
   return (await response.json()) as IndispType[];
}

// ========================================
// Mutations
// ========================================

export async function addIndisp(
   indisp: IndispType
): Promise<IndispMutationResponse> {
   const response = await request("POST", indispRoute, indisp);
   const data = await response.json();
   if (!response.ok) {
      throw new Error(data.detail || "Erro ao criar indisponibilidade");
   }
   return data as IndispMutationResponse;
}

export async function updateIndisp(
   indisp: IndispType
): Promise<IndispMutationResponse> {
   const response = await request("PUT", indispRoute + indisp.id, indisp);
   const data = await response.json();
   if (!response.ok) {
      throw new Error(data.detail || "Erro ao atualizar indisponibilidade");
   }
   return data as IndispMutationResponse;
}

export async function deleteIndisp(
   indispId: number
): Promise<IndispMutationResponse> {
   const response = await request("DELETE", indispRoute + indispId);
   const data = await response.json();
   if (!response.ok) {
      throw new Error(data.detail || "Erro ao excluir indisponibilidade");
   }
   return data as IndispMutationResponse;
}
