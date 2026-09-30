import { baseUrl } from "../Api";
import request, { parseApiResponse } from "../Api";
import type { ApiResult } from "@/types/api";

const authRoute = `${baseUrl}auth/`;

export async function getToken(code: string, origin: string, pkceVerf: string) {
   const formData = new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: origin,
      client_id: "fatcontrol",
   });

   const response = await fetch(authRoute + "token", {
      method: "POST",
      headers: {
         "Content-Type": "application/x-www-form-urlencoded",
         Cookie: `pkce_code_verifier=${pkceVerf}`,
      },
      body: formData.toString(),
      cache: "no-store",
   });

   return response;
}

export async function refreshToken(token: string) {
   const response = await fetch(`${authRoute}refresh_token`, {
      method: "POST",
      headers: {
         Authorization: `Bearer ${token}`,
      },
   });

   return response;
}

export async function devLogin(
   userId: number
): Promise<ApiResult<{ access_token: string }>> {
   return parseApiResponse<{ access_token: string }>(
      await request("POST", `auth/dev_login?user_id=${userId}`)
   );
}

export async function switchOrg(
   organizacaoId: string | null
): Promise<ApiResult<{ access_token: string }>> {
   return parseApiResponse<{ access_token: string }>(
      // Com teto: enquanto a troca corre, o overlay modal deixa o app inerte
      // e sem Esc — uma requisição pendurada prenderia a tela até o reload.
      // O abort cai no `catch` de `trocarOrg`, que mostra o erro.
      await request(
         "POST",
         "auth/switch-org",
         { organizacao_id: organizacaoId },
         null,
         AbortSignal.timeout(15_000)
      )
   );
}
