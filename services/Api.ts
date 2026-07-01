import { deleteCookie } from "cookies-next";
import type { ApiResult } from "@/types/api";

export const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

if (!baseUrl) {
   console.warn(
      "A variável de ambiente NEXT_PUBLIC_API_URL não está definida."
   );
}

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/**
 * Redirects deliberativos disparados por erro do backend.
 *
 * Cada regra casa por `status` e, opcionalmente, por um `code` no campo
 * `message` da resposta. A primeira que casar executa `before?` (efeito
 * colateral, ex.: limpar token) e navega para `redirect`. Regras sem `code`
 * são catch-all do status e devem vir DEPOIS das específicas.
 *
 * Casos não cobertos ficam a cargo do caller (ex.: 403 de ação/permissão →
 * ApiResult.ok=false → toast). Escalável: novo caso = nova entrada.
 */
interface RedirectRule {
   status: number;
   code?: string;
   redirect: string;
   before?: () => void;
}

const REDIRECT_RULES: RedirectRule[] = [
   // Sessão inválida/expirada → limpa token e volta ao login.
   {
      status: 401,
      redirect: "/",
      before: () => deleteCookie("token", { path: "/" }),
   },
   // Troca de senha pendente (sinalizada pelo middleware do backend).
   {
      status: 403,
      code: "PASSWORD_CHANGE_REQUIRED",
      redirect: "/change-password",
   },
   // Rota proibida no contexto atual (escopo/role) — ver
   // require_admin/require_system_admin no backend.
   { status: 403, code: "SCOPE_FORBIDDEN", redirect: "/403" },
];

/**
 * Aplica os REDIRECT_RULES à resposta. Retorna true se redirecionou.
 * Só lê o body quando há regra que depende de código para aquele status.
 */
async function handleAuthRedirect(response: Response): Promise<boolean> {
   if (typeof window === "undefined") return false;

   const candidates = REDIRECT_RULES.filter(
      (r) => r.status === response.status
   );
   if (candidates.length === 0) return false;

   let message: string | undefined;
   if (candidates.some((r) => r.code)) {
      const body = await response
         .clone()
         .json()
         .catch(() => null);
      message = body?.message ?? undefined;
   }

   const rule = candidates.find((r) => !r.code || r.code === message);
   if (!rule) return false;

   rule.before?.();
   window.location.href = rule.redirect;
   return true;
}

function getTokenFromCookies(): string | null {
   if (typeof document === "undefined") {
      return null;
   }
   const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
   return match ? match[2] : null;
}

export default async function request<T = any>(
   method: HttpMethod,
   endpoint: string,
   body: T | null = null,
   params: Record<
      string,
      string | number | string[] | number[] | undefined
   > | null = null,
   signal?: AbortSignal
): Promise<Response> {
   let fullUrl = `${baseUrl}${endpoint}`;

   if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
         if (value !== undefined && value !== null && value !== "") {
            if (Array.isArray(value)) {
               value.forEach((v) => searchParams.append(key, String(v)));
            } else {
               searchParams.append(key, String(value));
            }
         }
      }
      fullUrl += `?${searchParams.toString()}`;
   }

   const headers: HeadersInit = {
      "Content-Type": "application/json",
   };

   const token = getTokenFromCookies();
   if (token) {
      headers["Authorization"] = `Bearer ${token}`;
   }

   const options: RequestInit = {
      method: method,
      headers: headers,
      signal: signal,
   };

   if (body) {
      options.body = JSON.stringify(body);
   }

   const response = await fetch(fullUrl, options);

   // Interceptor único de redirects deliberativos (401/403 + códigos).
   await handleAuthRedirect(response);

   return response;
}

export async function parseApiResponse<T = unknown>(
   response: Response
): Promise<ApiResult<T>> {
   const json = await response.json();
   return {
      ok: response.ok,
      data: json.data ?? null,
      message: json.message ?? null,
      errors: json.errors ?? null,
   };
}

/**
 * Erro de API que preserva o dict `errors` (campo -> mensagem) enviado pelo
 * backend em ApiErrorResponse. As mutations lancam esta classe para que o
 * `onError` acesse os erros de campo estruturados (ex.: validacao 422) alem da
 * mensagem de topo. Handlers que so leem `.message` continuam funcionando.
 */
export class ApiError extends Error {
   readonly errors: Record<string, unknown> | null;

   constructor(message: string, errors: Record<string, unknown> | null = null) {
      super(message);
      this.name = "ApiError";
      this.errors = errors;
   }
}
