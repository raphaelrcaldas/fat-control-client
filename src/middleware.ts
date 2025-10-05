import { NextResponse, NextRequest } from "next/server";
import { getToken } from "services/routes/auth";
import { generateRandomString, sha256 } from "../utils/auth";

const loginRedirect = process.env.LOGIN_REDIRECT;

if (process.env.NODE_ENV === 'development' && process.env.DEV_TOKEN) {
   var tokenDev = process.env.DEV_TOKEN;
}

export async function middleware(request: NextRequest) {
   const tokenCookie = request.cookies.get("token");
   let tokenValue: string | undefined = tokenCookie?.value || tokenDev;

   // --- CENÁRIO 1: Usuário voltando do FATLOGIN com um código ---
   const code = request.nextUrl.searchParams.get("code");
   if (code) {
      const pkceVerifier = request.cookies.get("pkce_code_verifier")?.value;
      if (!pkceVerifier) {
         return redirectToLogin(request);
      }

      try {
         const tokenResponse = await getToken(code, request.nextUrl.origin, pkceVerifier);
         if (!tokenResponse.ok) {
            return NextResponse.redirect(
               new URL(loginRedirect + "?error=token_exchange_failed", request.url)
            );
         }
         const { first_login, access_token } = await tokenResponse.json();

         const response = NextResponse.redirect(
            new URL(first_login ? "/change-password" : "/", request.url)
         );

         response.cookies.delete("pkce_code_verifier");
         response.cookies.set("token", access_token, {
            maxAge: 24 * 60 * 60,
         });

         return response;

      } catch (error) {
         return NextResponse.redirect(new URL(loginRedirect + "?error=network_error", request.url));
      }
   }

   // --- CENÁRIO 2: Usuário sem token ---
   if (!tokenValue) {
      return redirectToLogin(request);
   }

   const response = NextResponse.next();
   response.cookies.set("token", tokenValue ?? "", {
      maxAge: 24 * 60 * 60,
   });

   return response;

}

// Função auxiliar para centralizar a lógica de redirecionamento para o login
async function redirectToLogin(request: NextRequest) {
   if (!loginRedirect) {
      console.error("ERRO: A variável de ambiente LOGIN_REDIRECT não está definida.");
      return new NextResponse("Erro de configuração de autenticação.", { status: 500 });
   }
   const codeVerifier = generateRandomString(32);
   const codeChallenge = await sha256(codeVerifier);
   const params = new URLSearchParams({
      client_id: "fatcontrol",
      redirect_uri: request.nextUrl.origin,
      response_type: "code",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
   });
   const redirectUrl = `${loginRedirect}?${params.toString()}`;
   const response = NextResponse.redirect(redirectUrl);
   response.cookies.set("pkce_code_verifier", codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 300,
      sameSite: "lax",
   });
   return response;
}

export const config = {
   matcher: ["/((?!api|static|favicon.ico|_next).*)"],
};
