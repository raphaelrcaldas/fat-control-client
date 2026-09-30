import request, { ApiError, readApiData } from "services/Api";
import type { ApiResponse } from "@/types/api";

export const DEFAULT_ICAO = process.env.NEXT_PUBLIC_AISWEB_ICAO ?? "SBGL";

export async function aiswWebGet<T>(
   path: string,
   signal?: AbortSignal
): Promise<T> {
   const response = await request("GET", path, null, null, signal);
   if (!response.ok) {
      const json = await response.json().catch((error) => {
         if (error?.name === "AbortError") throw error;
         return null;
      });
      throw new ApiError(
         json?.message ?? `Erro ${response.status} ao buscar dados do AISWEB`,
         json?.errors ?? null,
         response.status
      );
   }
   const json = await readApiData<ApiResponse<T>>(response);
   return json.data as T;
}
