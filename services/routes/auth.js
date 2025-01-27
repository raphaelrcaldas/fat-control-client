import { baseUrl } from "../Api";

const authRoute = "auth/token";

export async function getToken(formData) {
   const response = await fetch(`${baseUrl}${authRoute}`, {
      body: formData,
      method: "POST",
   });

   return response;
}
