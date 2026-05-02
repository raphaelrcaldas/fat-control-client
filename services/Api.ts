import { deleteCookie } from "cookies-next";
import type { ApiResult } from "@/types/api";

export const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

if (!baseUrl) {
   console.warn(
      "A variável de ambiente NEXT_PUBLIC_API_URL não está definida."
   );
}

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

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

   // Interceptor para 401
   if (response.status === 401 && typeof window !== "undefined") {
      // Redireciona para a página de login
      deleteCookie("token");
      window.location.href = "/";
   }

   // Interceptor para 403
   if (response.status === 403 && typeof window !== "undefined") {
      const body = await response
         .clone()
         .json()
         .catch(() => null);
      if (body?.message === "PASSWORD_CHANGE_REQUIRED") {
         window.location.href = "/change-password";
      } else {
         window.location.href = "/";
      }
   }

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
   };
}
