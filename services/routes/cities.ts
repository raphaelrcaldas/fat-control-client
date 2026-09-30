import request, { readApiData } from "../Api";
import type { ApiResponse } from "@/types/api";

const citiesRoute = "cities/";

export interface Cidade {
   codigo: number;
   nome: string;
   uf: string;
}

export async function getCities(search: string): Promise<Cidade[]> {
   const response = await request("GET", citiesRoute, null, { search: search });
   const json = await readApiData<ApiResponse<Cidade[]>>(response);
   return json.data || [];
}
