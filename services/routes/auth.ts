import { baseUrl } from "../Api";
import request from "../Api";

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

export async function devLogin(userId: number) {
   return await request("POST", `auth/dev_login?user_id=${userId}`);
}
