"use server";
const jose = require("jose");

const secretKey = jose.base64url.decode(process.env.SECRET_KEY);
const algorithm = process.env.ALGORITHM;

export async function decodeJWS(token) {
   const { payload } = await jose.compactVerify(token, secretKey, {
      algorithms: [algorithm],
   });

   const data = new TextDecoder().decode(payload);
   return JSON.parse(data);
}
