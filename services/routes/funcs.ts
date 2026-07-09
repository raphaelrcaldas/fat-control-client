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

export {
   PROJETOS,
   type ProjType,
   PROJ_LABELS,
   getProjLabel,
} from "../../src/constants/tripulantes/projetos";

// Interfaces de API (mantidas aqui por serem específicas de API)
import type {
   FuncType,
   OperType,
   ProjType,
} from "../../src/constants/tripulantes";

/**
 * Campos da função única (1:1) do tripulante. Vivem diretamente no
 * tripulante (colunas `func`/`oper`/`proj`/`data_op`), não em entidade
 * separada.
 */
export interface TripFuncFields {
   func: FuncType;
   oper: OperType;
   proj: ProjType;
   data_op: string | null;
}
