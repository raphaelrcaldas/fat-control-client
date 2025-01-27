// import "@/envConfig.js";
"use server";
const jose = require("jose");

const secretKey = jose.base64url.decode(process.env.NEXT_PUBLIC_SECRET_KEY);
const algorithm = process.env.NEXT_PUBLIC_ALGORITHM;

export async function decodeJWS(token) {
   const { payload, protectedHeader } = await jose.compactVerify(
      token,
      secretKey,
      {
         algorithms: [algorithm],
      }
   );

   const data = new TextDecoder().decode(payload);
   return JSON.parse(data);
}
