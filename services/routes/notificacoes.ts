import request, { parseApiResponse } from "../Api";
import type { ApiPaginatedResponse, ApiResult } from "@/types/api";

const notificacoesRoute = "notificacoes/";

export type NotificacaoEscopo = "direta" | "tarefa";
export type NotificacaoAudiencia = "gestor" | "tripulante";

/**
 * Notificação in-app do client, sempre de audiência `gestor` — o backend
 * segrega por `audiencia` a partir do `app_client` do token. Chegam os DOIS
 * escopos: `"direta"` (endereçada ao `user_id`, ciclo por `read_at`) e
 * `"tarefa"` (endereçada por permissão, ciclo por `resolved_at`; nada emite
 * na v1, mas quem já tem a permissão/org certa pode recebê-la do backend).
 * `marcar_lida`/`apagar` só aceitam `"direta"` — chamar para uma `"tarefa"`
 * dá 404, então o sino trata os dois escopos de forma diferente.
 */
export interface Notificacao {
   id: number;
   uae: string;
   escopo: NotificacaoEscopo;
   audiencia: NotificacaoAudiencia;
   /** "feedback.mensagem" (para o autor), "feedback.recebido" e
    *  "feedback.mensagem_autor" (para a administração), ...; valor novo do
    *  backend não quebra o front. */
   tipo: string;
   titulo: string;
   descricao: string | null;
   recurso: string;
   recurso_id: number | null;
   /** Só em `escopo: "direta"`; em `"tarefa"` vem `null` (não é o ciclo dela). */
   read_at: string | null;
   /** Só em `escopo: "tarefa"`; em `"direta"` vem `null` (não é o ciclo dela). */
   resolved_at: string | null;
   /**
    * Dados do evento, forma própria por `tipo` — genérico de propósito,
    * para que payload novo não quebre o front. `feedback.mensagem` e
    * `feedback.mensagem_autor`: `{qtd: number}`; rótulo em `descricao` (título do feedback), destino
    * em `recurso_id` (ver `notificacaoHref.ts`).
    */
   payload: Record<string, unknown>;
   created_at: string;
}

export interface NotificacaoContador {
   nao_lidas: number;
   tarefas: number;
   total: number;
}

export interface GetNotificacoesParams {
   page?: number;
   per_page?: number;
   apenas_pendentes?: boolean;
}

export async function getNotificacoes(
   params?: GetNotificacoesParams,
   signal?: AbortSignal
): Promise<ApiPaginatedResponse<Notificacao>> {
   // `request` não aceita boolean no `params`. O FastAPI interpreta o VALOR
   // do query param (não só a presença): manda "true" só quando ligado, e
   // omite a chave quando desligado — o endpoint já tem `apenas_pendentes:
   // bool = False`, então a ausência produz o mesmo default.
   const query: Record<string, string | number> = {};
   if (params?.page !== undefined) query.page = params.page;
   if (params?.per_page !== undefined) query.per_page = params.per_page;
   if (params?.apenas_pendentes) query.apenas_pendentes = "true";

   const response = await request(
      "GET",
      notificacoesRoute,
      null,
      query,
      signal
   );
   const json = (await response.json()) as ApiPaginatedResponse<Notificacao>;
   if (!response.ok) {
      throw new Error(json.message || "Erro ao carregar notificações");
   }
   return json;
}

export async function getContadorNotificacoes(
   signal?: AbortSignal
): Promise<NotificacaoContador | null> {
   const result = await parseApiResponse<NotificacaoContador>(
      await request("GET", `${notificacoesRoute}contador`, null, null, signal)
   );
   if (!result.ok) {
      throw new Error(
         result.message || "Erro ao carregar contador de notificações"
      );
   }
   return result.data;
}

/** Idempotente no backend: marcar uma já lida não é erro. */
export async function marcarNotificacaoLida(
   id: number
): Promise<ApiResult<Notificacao>> {
   return parseApiResponse<Notificacao>(
      await request("PATCH", `${notificacoesRoute}${id}/lida`)
   );
}

export async function marcarTodasNotificacoesLidas(): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("POST", `${notificacoesRoute}marcar-todas-lidas`)
   );
}

export async function apagarNotificacao(id: number): Promise<ApiResult<null>> {
   return parseApiResponse<null>(
      await request("DELETE", `${notificacoesRoute}${id}`)
   );
}
