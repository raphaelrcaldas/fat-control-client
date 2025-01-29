import { NextResponse } from "next/server";
import { checkToken } from "../utils/jwtDecoder";
import { refreshToken } from "@/services/routes/auth";

export async function middleware(request) {
   const cookies = request.cookies;
   const token = cookies.get("token");

   const currentPath = request.nextUrl.pathname;
   const isLoginPage = currentPath === "/login";

   const checked = await checkToken(token);

   if (!checked && !isLoginPage) {
      return NextResponse.redirect(request.nextUrl.origin + "/login");
   }

   if (checked && isLoginPage) {
      return NextResponse.redirect(request.nextUrl.origin);
   }

   const response = NextResponse.next();

   if (checked) {
      let tokenValue = token.value;

      const [header, payload, assign] = tokenValue.split(".");
      let expiration = JSON.parse(atob(payload)).exp;

      expiration = new Date(expiration * 1000);
      const timeRemain = (expiration - new Date()) / 1000 / 60;

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
            return NextResponse.redirect(request.nextUrl.origin + "/login");
         }
      }

      response.cookies.set("token", tokenValue);
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
