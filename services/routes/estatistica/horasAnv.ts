import request from "../../Api";
import type { ApiResponse } from "@/types/api";

const horasAnvRoute = "estatistica/horas-anv/";

export interface AnvMesData {
   tvoo: number;
   pousos: number;
}

export interface AnvHorasRow {
   matricula: string;
   meses: AnvMesData[];
   total_tvoo: number;
   total_pousos: number;
}

export interface AnvHorasResponse {
   items: AnvHorasRow[];
   total_meses: AnvMesData[];
   total_tvoo: number;
   total_pousos: number;
}

export async function getHorasAnv(
   anoRef: number,
   signal?: AbortSignal
): Promise<AnvHorasResponse> {
   const response = await request(
      "GET",
      horasAnvRoute,
      null,
      { ano_ref: anoRef },
      signal
   );
   const json = (await response.json()) as ApiResponse<AnvHorasResponse>;
   return (
      json.data ?? {
         items: [],
         total_meses: Array.from({ length: 12 }, () => ({ tvoo: 0, pousos: 0 })),
         total_tvoo: 0,
         total_pousos: 0,
      }
   );
}
