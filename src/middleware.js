import { NextResponse } from "next/server";
import { decodeJWS } from "../utils/jwtDecoder";

async function checkToken(token) {
   if(!token){
      return false;
   }

   try {
      const decoded = await decodeJWS(token.value);
      const sub = decoded.sub;
      return sub !== undefined;
   
   } catch (error) {
      return false;
   }

}

export async function middleware(request) {
   const cookies = request.cookies;
   const token = cookies.get("token");

   const url = request.nextUrl.origin;

   const checked = await checkToken(token);

   if (request.nextUrl.pathname == "/login") {
      if (checked) {
         const resp = NextResponse.redirect(url);
         resp.cookies.set("token", token.value);

         return resp;
      }
   }

   if (!checked && request.nextUrl.pathname != "/login") {
      return NextResponse.redirect(url + "/login");
   }
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
