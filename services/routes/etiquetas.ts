import request from "../Api";

const etiquetasRoute = "ops/etiquetas/";

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
   return (await response.json()) as Etiqueta[];
}

export async function createEtiqueta(data: EtiquetaCreate): Promise<Etiqueta> {
   const response = await request("POST", etiquetasRoute, data);
   if (!response.ok) {
      throw new Error("Erro ao criar etiqueta");
   }
   return (await response.json()) as Etiqueta;
}

export async function updateEtiqueta(
   id: number,
   data: EtiquetaUpdate
): Promise<Etiqueta> {
   const response = await request("PUT", `${etiquetasRoute}${id}`, data);
   if (!response.ok) {
      throw new Error("Erro ao atualizar etiqueta");
   }
   return (await response.json()) as Etiqueta;
}

export async function deleteEtiqueta(id: number): Promise<void> {
   const response = await request("DELETE", `${etiquetasRoute}${id}`);
   if (!response.ok) {
      throw new Error("Erro ao excluir etiqueta");
   }
}
