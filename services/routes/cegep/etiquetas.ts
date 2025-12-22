import request from "../../Api";
import { cegepRoute } from ".";

const etiquetasRoute = cegepRoute + "etiquetas/";

export interface Etiqueta {
   id?: number;
   nome: string;
   cor: string;
   descricao?: string;
}

// Cores predefinidas para etiquetas
export const coresPredefinidas = [
   "#EF4444", "#F97316", "#F59E0B", "#EAB308", "#84CC16", "#22C55E",
   "#10B981", "#14B8A6", "#06B6D4", "#0EA5E9", "#3B82F6", "#6366F1",
   "#8B5CF6", "#A855F7", "#D946EF", "#EC4899", "#F43F5E", "#78716C",
];

export async function getEtiquetas(): Promise<Etiqueta[]> {
   const response = await request("GET", etiquetasRoute);
   return await response.json() as Etiqueta[];
}

export async function createUpdateEtiqueta(etiqueta: Etiqueta): Promise<Etiqueta> {
   const response = await request("POST", etiquetasRoute, etiqueta);
   return await response.json() as Etiqueta;
}

export async function deleteEtiquetaApi(etiquetaId: number): Promise<void> {
   await request("DELETE", etiquetasRoute + etiquetaId);
}

