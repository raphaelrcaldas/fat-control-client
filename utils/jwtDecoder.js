"use server";
const jose = require("jose");

const secretKey = jose.base64url.decode(process.env.SECRET_KEY);
const algorithm = process.env.ALGORITHM;

async function decodeJWS(token) {
   const { payload } = await jose.compactVerify(token, secretKey, {
      algorithms: [algorithm],
   });

   const data = new TextDecoder().decode(payload);
   return JSON.parse(data);
}

const checkTokenExpiration = (timeExp) => {
   if (!timeExp) return false;

   const exp = timeExp * 1000; // Convert to milliseconds
   const now = Date.now();

   return exp > now;
};

const checkTokenPayload = (subject) => {
   if (!subject) return false;

   return true;
};

export async function checkToken(token) {
   if (!token) {
      return false;
   }
   try {
      const decoded = await decodeJWS(token);
      
      const tokekValidTime = checkTokenExpiration(decoded.exp);
      const tokekValidContent = checkTokenPayload(decoded.sub);
      
      return tokekValidContent && tokekValidTime;
   } catch (error) {
      return false;
   }
}
