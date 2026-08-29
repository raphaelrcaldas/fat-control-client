import request, { parseApiResponse } from "../Api";
import type { ApiResult } from "@/types/api";

const feedbacksRoute = "feedbacks/";

export type FeedbackTipo = "bug" | "sugestao" | "duvida" | "elogio";

export type FeedbackStatus =
   "aberto" | "em_analise" | "aceito" | "recusado" | "concluido";

export interface FeedbackUser {
   id: number;
   p_g: string;
   nome_guerra: string;
}

export interface Feedback {
   id: number;
   user_id: number;
   uae: string;
   tipo: FeedbackTipo;
   titulo: string;
   descricao: string;
   rota: string | null;
   status: FeedbackStatus;
   resposta: string | null;
   respondido_em: string | null;
   created_at: string;
   autor: FeedbackUser;
   respondente: FeedbackUser | null;
}

export interface FeedbackUpdate {
   status?: FeedbackStatus;
   resposta?: string | null;
}

export interface GetFeedbacksParams {
   status?: FeedbackStatus;
   tipo?: FeedbackTipo;
}

export async function getFeedbacks(
   params?: GetFeedbacksParams,
   signal?: AbortSignal
): Promise<Feedback[]> {
   const queryParams: Record<string, string> = {};
   if (params?.status) queryParams.status = params.status;
   if (params?.tipo) queryParams.tipo = params.tipo;

   const response = await request(
      "GET",
      feedbacksRoute,
      null,
      Object.keys(queryParams).length > 0 ? queryParams : null,
      signal
   );
   const result = await parseApiResponse<Feedback[]>(response);
   if (!result.ok) {
      throw new Error(result.message || "Erro ao carregar feedbacks");
   }
   return result.data ?? [];
}

export async function updateFeedback(
   id: number,
   data: FeedbackUpdate
): Promise<ApiResult<Feedback>> {
   return parseApiResponse<Feedback>(
      await request("PATCH", `${feedbacksRoute}${id}`, data)
   );
}
