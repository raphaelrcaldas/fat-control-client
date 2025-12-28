import request from "../../Api";
import { cegepRoute } from ".";

// Re-export de constants/
export {
   CORES_PREDEFINIDAS as coresPredefinidas,
   type CorPredefinida,
   isCorPredefinida,
} from "../../../src/constants/cegep/etiquetas";

const etiquetasRoute = cegepRoute + "etiquetas/";

export interface Etiqueta {
   id?: number;
   nome: string;
   cor: string;
   descricao?: string;
}

export async function getEtiquetas(): Promise<Etiqueta[]> {
   const response = await request("GET", etiquetasRoute);
   return (await response.json()) as Etiqueta[];
}

export async function createUpdateEtiqueta(
   etiqueta: Etiqueta
): Promise<Etiqueta> {
   const response = await request("POST", etiquetasRoute, etiqueta);
   return (await response.json()) as Etiqueta;
}

export async function deleteEtiquetaApi(etiquetaId: number): Promise<void> {
   await request("DELETE", etiquetasRoute + etiquetaId);
}
