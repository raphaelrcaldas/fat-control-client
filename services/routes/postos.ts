import request from "../Api";
import type { ApiResponse } from "@/types/api";

// Re-export dados estáticos de constants/
export {
   postoGradRecords,
   CIRCULO_LABELS,
   getPostoByShort,
   getPostoByAnt,
   getPostosByCirculo,
   type PostoGrad,
   type CirculoType,
} from "../../src/constants/militar";

const postoRoute = "postos/";

/**
 * Busca postos do servidor (usa dados estáticos locais)
 * @deprecated Use postoGradRecords diretamente de constants/militar
 */
export async function getPostos(): Promise<
   import("../../src/constants/militar").PostoGrad[]
> {
   const response = await request("GET", postoRoute);
   const json = await response.json() as ApiResponse<import("../../src/constants/militar").PostoGrad[]>;
   return json.data || [];
}
