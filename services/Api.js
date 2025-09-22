export const baseUrl = process.env.NEXT_PUBLIC_API_URL;

function getTokenFromCookies() {
   const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
   return match ? match[2] : null;
}

export default async function request(
   method,
   endpoint,
   body = null,
   params = null,
   signal = undefined
) {
   let fullUrl = `${baseUrl}${endpoint}`;
   let headers = { "Content-Type": "application/json" };
   let options = { method: method, headers: headers };

   if (params) {
      let searchParams = Object.entries(params).map((e) => e.join("="));
      searchParams = searchParams.join("&");

      fullUrl += `?${searchParams}`;
   }

   if (body) {
      options.body = JSON.stringify(body);
   }

   const token = getTokenFromCookies();

   if (token) {
      headers.Authorization = `Bearer ${token}`;
   }

   if (signal) {
      options.signal = signal;
   }

   return await fetch(fullUrl, options);
}
