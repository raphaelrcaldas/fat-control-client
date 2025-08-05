import { NextResponse, NextRequest } from "next/server";
import { checkToken } from "../utils/jwtDecoder";
import { refreshToken } from "../services/routes/auth";

const loginRedirect = process.env.LOGIN_REDIRECT;

if (process.env.NODE_ENV === 'development' && process.env.DEV_TOKEN) {
   var tokenDev = process.env.DEV_TOKEN;
}

export async function middleware(request: NextRequest) {
   const searchParam = request.nextUrl.searchParams;
   const tokenParam = searchParam.get("token");

   const cookiesToken = request.cookies.get("token");

   let tokenValue: string | undefined = tokenParam || cookiesToken?.value || tokenDev;

   const checked = await checkToken(tokenValue);
   if (!checked) {
      return NextResponse.redirect(
         `${loginRedirect}?redirect=${request.nextUrl.origin}`
      );
   }

   const response = NextResponse.next();

   if (checked) {
      const [header, payload, assign] = tokenValue.split(".");
      let expiration = JSON.parse(atob(payload)).exp;

      expiration = new Date(expiration * 1000);
      const timeRemain = (expiration.getTime() - new Date().getTime()) / 1000 / 60;

      if (timeRemain < 15) {
         try {
            const res = await refreshToken(tokenValue);
            if (!res.ok) {
               throw new Error("Failed to refresh token");
            }
            const data = await res.json();
            tokenValue = data.access_token;
         } catch (error) {
            console.error("Erro ao renovar o token:", error);
            return NextResponse.redirect(
               `${loginRedirect}?redirect=${request.nextUrl.origin}`
            );
         }
      }

      response.cookies.set("token", tokenValue, {
         maxAge: 6 * 60 * 60,
      });
   }

   return response;
}

export const config = {
   matcher: [
      /*
       * Match all request paths except for the ones starting with:
       * - api (API routes)
       * - static (static files)
       * - favicon.ico (favicon file)
       * - _next internal calls
       */
      "/((?!api|static|favicon.ico|_next).*)",
   ],
};
