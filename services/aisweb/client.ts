import request from "services/Api";
import type { ApiResponse } from "@/types/api";

export const DEFAULT_ICAO =
   process.env.NEXT_PUBLIC_AISWEB_ICAO ?? "SBGL";

export async function aiswWebGet<T>(
   path: string,
   signal?: AbortSignal
): Promise<T> {
   const response = await request("GET", path, null, null, signal);
   const json = (await response.json()) as ApiResponse<T>;

   if (!response.ok) {
      throw new Error(json.message ?? "Erro ao buscar dados do AISWEB");
   }

   return json.data as T;
}
