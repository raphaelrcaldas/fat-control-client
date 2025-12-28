import request from "../Api";

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
   return (await request("GET", postoRoute)).json();
}
