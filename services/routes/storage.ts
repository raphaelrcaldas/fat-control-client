import type { ApiResponse } from "@/types/api";
import request, { ApiError, readApiData } from "../Api";

const storageRoute = "storage/";

export interface BucketStats {
   name: string;
   total_size: number;
   total_objects: number;
   /** False quando a listagem do bucket falhou — os totais são 0 por falta
    * de leitura, não por o bucket estar vazio. */
   readable: boolean;
}

export interface AllBucketsStats {
   total_size: number;
   total_objects: number;
   /** Cota de referência declarada no backend (Settings.STORAGE_QUOTA_MB). */
   quota_mb: number;
   buckets: BucketStats[];
}

export async function getAllBucketsStats(
   signal?: AbortSignal
): Promise<AllBucketsStats> {
   const response = await request(
      "GET",
      `${storageRoute}all`,
      null,
      null,
      signal
   );
   // O backend responde 502 quando não consegue falar com o storage — a
   // mensagem dele tem que chegar à tela, senão a falha vira "0 B / OK".
   const result = await readApiData<ApiResponse<AllBucketsStats>>(
      response,
      (message) => message ?? "Não foi possível ler o storage."
   );
   if (!result.data) {
      throw new ApiError(
         result.message ?? "Não foi possível ler o storage.",
         result.errors,
         response.status
      );
   }
   return result.data;
}
