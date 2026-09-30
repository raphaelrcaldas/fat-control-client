import { z } from "zod";
import request, { ApiError, parseApiResponse, readApiData } from "../Api";
import type { ApiResponse, ApiResult } from "@/types/api";

// Duas rotas, dois escopos. O TRATAMENTO é control-plane de sistema e vive
// sob `/admin` (gate `require_system_admin` no grupo); o ENVIO é aberto a
// qualquer autenticado com org ativa, e o backend congela o `uae` a partir
// dela — por isso não há rota de admin para criar em nome de outra unidade.
const feedbacksRoute = "admin/feedbacks/";
const envioRoute = "feedbacks/";

export type FeedbackTipo =
   "bug" | "sugestao" | "duvida" | "elogio" | "desabafo";

export type FeedbackStatus =
   "aberto" | "em_analise" | "aceito" | "recusado" | "concluido";

export type FeedbackOrigem = "client" | "fatbird";

export interface FeedbackUser {
   id: number;
   p_g: string;
   nome_guerra: string;
}

export type FeedbackEventoTipo = "mensagem" | "status";

export interface FeedbackEvento {
   id: number;
   tipo: FeedbackEventoTipo;
   texto: string | null;
   status: FeedbackStatus | null;
   /** Nulo = administrador que saiu do sistema ("Administração"). */
   autor: FeedbackUser | null;
   /** Lado do balão, calculado pelo backend. */
   do_autor: boolean;
   created_at: string;
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
   /** App de origem do envio — o front não escolhe, o backend deriva do token. */
   origem: FeedbackOrigem;
   created_at: string;
   autor: FeedbackUser;
   total_mensagens: number;
   ultima_mensagem: FeedbackEvento | null;
   ultima_atividade: string;
}

export interface FeedbackDetalhe extends Feedback {
   eventos: FeedbackEvento[];
}

export interface FeedbackUpdate {
   status: FeedbackStatus;
}

/** Espelha `FeedbackAdminMensagemCreate`. */
export interface FeedbackMensagemAdmin {
   texto: string;
   status?: FeedbackStatus;
}

export interface FeedbackCreate {
   tipo: FeedbackTipo;
   titulo: string;
   descricao: string;
   /** Tela de onde o feedback partiu. Null quando não veio de uma tela. */
   rota?: string | null;
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
   const result = await readApiData<ApiResponse<Feedback[]>>(
      response,
      (message) => message || "Erro ao carregar feedbacks"
   );

   return result.data ?? [];
}

export async function getFeedback(
   id: number,
   signal?: AbortSignal
): Promise<FeedbackDetalhe> {
   const response = await request(
      "GET",
      `${feedbacksRoute}${id}`,
      null,
      null,
      signal
   );
   const result = await readApiData<ApiResponse<FeedbackDetalhe>>(
      response,
      (message) => message || "Erro ao carregar o feedback"
   );
   if (!result.data) {
      throw new ApiError(
         result.message || "Erro ao carregar o feedback",
         result.errors,
         response.status
      );
   }
   return result.data;
}

export async function addFeedback(
   data: FeedbackCreate
): Promise<ApiResult<Feedback>> {
   return parseApiResponse<Feedback>(await request("POST", envioRoute, data));
}

export async function enviarMensagemAdmin(
   id: number,
   data: FeedbackMensagemAdmin
): Promise<ApiResult<FeedbackDetalhe>> {
   return parseApiResponse<FeedbackDetalhe>(
      await request("POST", `${feedbacksRoute}${id}/mensagens`, data)
   );
}

export async function updateFeedback(
   id: number,
   data: FeedbackUpdate
): Promise<ApiResult<FeedbackDetalhe>> {
   return parseApiResponse<FeedbackDetalhe>(
      await request("PATCH", `${feedbacksRoute}${id}`, data)
   );
}

export async function deleteFeedback(id: number): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("DELETE", `${feedbacksRoute}${id}`)
   );
}

// --- Lado do autor: "Meus feedbacks" (qualquer autenticado). Mesmo prefixo
// de ENVIO — o backend deriva dono e origem do token, então estas chamadas
// só alcançam feedbacks do próprio usuário com origem='client'.

export async function getMeusFeedbacks(
   signal?: AbortSignal
): Promise<Feedback[]> {
   const response = await request("GET", `${envioRoute}me`, null, null, signal);
   const result = await readApiData<ApiResponse<Feedback[]>>(
      response,
      (message) => message || "Erro ao carregar seus feedbacks"
   );

   return result.data ?? [];
}

export async function getMeuFeedback(
   id: number,
   signal?: AbortSignal
): Promise<FeedbackDetalhe> {
   const response = await request(
      "GET",
      `${envioRoute}${id}`,
      null,
      null,
      signal
   );
   const result = await readApiData<ApiResponse<FeedbackDetalhe>>(
      response,
      (message) => message || "Erro ao carregar o feedback"
   );
   if (!result.data) {
      throw new ApiError(
         result.message || "Erro ao carregar o feedback",
         result.errors,
         response.status
      );
   }
   return result.data;
}

/** Espelha `FeedbackMensagemCreate` (api/fcontrol_api/schemas/feedback.py). */
export const MENSAGEM_MAX = 2000;
export const mensagemSchema = z.object({
   texto: z.string().trim().min(1).max(MENSAGEM_MAX),
});

export async function enviarMensagem(
   id: number,
   texto: string
): Promise<FeedbackEvento> {
   const response = await request("POST", `${envioRoute}${id}/mensagens`, {
      texto,
   });
   const result = await parseApiResponse<FeedbackEvento>(response);
   if (!result.ok || !result.data) {
      // 409 (conversa encerrada) e 404 (feedback excluído no meio do
      // caminho) precisam do status preservado — a tela distingue os dois.
      throw new ApiError(
         result.message || "Erro ao enviar mensagem",
         result.errors,
         response.status
      );
   }
   return result.data;
}
