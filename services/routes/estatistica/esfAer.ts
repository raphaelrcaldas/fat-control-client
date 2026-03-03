import request from "../../Api";
import type { ApiResponse } from "@/types/api";

const esfAerRoute = "estatistica/esfaer/";

export interface EsfAerItem {
   id: number;
   descricao: string;
}

export async function getEsfAerList(
   signal?: AbortSignal
): Promise<EsfAerItem[]> {
   const response = await request(
      "GET",
      `${esfAerRoute}list`,
      null,
      null,
      signal
   );
   const json = (await response.json()) as ApiResponse<EsfAerItem[]>;
   return json.data || [];
}

export interface EsfAerResumoItem {
   id: number;
   descricao: string;
   alocado: number;
   voado: number;
   saldo: number;
   meses: number[];
}

export interface EsfAerResumoResponse {
   items: EsfAerResumoItem[];
   total_alocado: number;
   total_voado: number;
   total_saldo: number;
   total_meses: number[];
}

export async function getEsfAerResumo(
   anoRef: number,
   signal?: AbortSignal
): Promise<EsfAerResumoResponse> {
   const response = await request(
      "GET",
      esfAerRoute,
      null,
      { ano_ref: anoRef },
      signal
   );
   const json = (await response.json()) as ApiResponse<EsfAerResumoResponse>;
   return (
      json.data ?? {
         items: [],
         total_alocado: 0,
         total_voado: 0,
         total_saldo: 0,
         total_meses: Array(12).fill(0),
      }
   );
}
