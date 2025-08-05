"use server";
import { base64url, compactVerify } from "jose";

const secretKey = base64url.decode(process.env.SECRET_KEY || "");
const algorithm = process.env.ALGORITHM || "HS256";

async function decodeJWS(token: string): Promise<any> {
   const { payload } = await compactVerify(token, secretKey, {
      algorithms: [algorithm],
   });

   const data = new TextDecoder().decode(payload);
   return JSON.parse(data);
}

function checkTokenExpiration(timeExp?: number): boolean {
   if (!timeExp) return false;
   const exp = timeExp * 1000;
   return exp > Date.now();
}

function checkTokenPayload(subject?: string): boolean {
   return !!subject;
}

export async function checkToken(token: string): Promise<boolean> {
   if (!token) return false;

   try {
      const decoded = await decodeJWS(token);
      const tokenValidTime = checkTokenExpiration(decoded.exp);
      const tokenValidContent = checkTokenPayload(decoded.sub);
      return tokenValidContent && tokenValidTime;
   } catch (error) {
      return false;
   }
}