// Re-export tipos de constants/tripulantes
export {
   type FuncType,
   type FuncaoTripulante,
   FUNC_LABELS,
   FUNC_LABELS_SHORT,
   TODAS_FUNCOES,
   FUNCOES_PRINCIPAIS,
   getFuncLabel,
} from "../../src/constants/tripulantes/funcoes";

export {
   type OperType,
   OPER_LABELS,
   TODOS_NIVEIS_OPER,
   getOperLabel,
} from "../../src/constants/tripulantes/operacionalidade";

// Interfaces de API (mantidas aqui por serem específicas de API)
import type { FuncType, OperType } from "../../src/constants/tripulantes";

/**
 * Campos da função única (1:1) do tripulante. Vivem diretamente no
 * tripulante (colunas `func`/`oper`/`proj`/`data_op`), não em entidade
 * separada.
 *
 * `proj` é o `modelo` do projeto (FK para `projetos_anvs.modelo`): catálogo
 * dinâmico por org, obtido em `GET /aeronaves/projetos`.
 */
export interface TripFuncFields {
   func: FuncType;
   oper: OperType;
   proj: string;
   data_op: string | null;
}
