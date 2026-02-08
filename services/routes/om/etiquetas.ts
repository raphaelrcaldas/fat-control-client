import request from "../../Api";
import type { ApiResponse } from "@/types/api";

const etiquetasRoute = "ops/om/etiquetas/";

export interface Etiqueta {
   id: number;
   nome: string;
   cor: string;
   descricao: string | null;
}

export interface EtiquetaCreate {
   nome: string;
   cor: string;
   descricao?: string | null;
}

export interface EtiquetaUpdate {
   nome?: string;
   cor?: string;
   descricao?: string | null;
}

export async function listEtiquetas(): Promise<Etiqueta[]> {
   const response = await request("GET", etiquetasRoute);
   const json = (await response.json()) as ApiResponse<Etiqueta[]>;
   return json.data!;
}

export async function createEtiqueta(data: EtiquetaCreate): Promise<Etiqueta> {
   const response = await request("POST", etiquetasRoute, data);
   const json: ApiResponse<Etiqueta> = await response.json();
   if (!response.ok) {
      throw new Error(json.message || "Erro ao criar etiqueta");
   }
   return json.data as Etiqueta;
}

export async function updateEtiqueta(
   id: number,
   data: EtiquetaUpdate
): Promise<Etiqueta> {
   const response = await request("PUT", `${etiquetasRoute}${id}`, data);
   const json: ApiResponse<Etiqueta> = await response.json();
   if (!response.ok) {
      throw new Error(json.message || "Erro ao atualizar etiqueta");
   }
   return json.data as Etiqueta;
}

export async function deleteEtiqueta(id: number): Promise<void> {
   const response = await request("DELETE", `${etiquetasRoute}${id}`);
   const json: ApiResponse<null> = await response.json();
   if (!response.ok) {
      throw new Error(json.message || "Erro ao excluir etiqueta");
   }
}
