import request from "../Api";
import type { ApiResponse } from "@/types/api";

const storageRoute = "storage/";

export interface BucketStats {
   name: string;
   total_size: number;
   total_objects: number;
}

export interface AllBucketsStats {
   total_size: number;
   total_objects: number;
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
   const json = (await response.json()) as ApiResponse<AllBucketsStats>;
   if (!json.data) throw new Error("Resposta inválida do servidor");
   return json.data;
}
