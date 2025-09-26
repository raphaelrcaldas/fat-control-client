import { baseUrl } from "../Api";

const authRoute = `${baseUrl}auth/`;

export async function getToken(formData: FormData) {
   const response = await fetch(`${authRoute}token`, {
      body: formData,
      method: "POST",
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
