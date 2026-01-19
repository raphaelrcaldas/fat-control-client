/**
 * Níveis de operacionalidade de tripulantes
 */

export type OperType = "ba" | "op" | "in" | "al";

/**
 * Labels para níveis de operacionalidade
 */
export const OPER_LABELS: Record<OperType, string> = {
   in: "Instrutor",
   op: "Operacional",
   ba: "Básico",
   al: "Aluno",
};

/**
 * Todos os níveis de operacionalidade
 */
export const TODOS_NIVEIS_OPER: OperType[] = ["ba", "op", "in", "al"];

/**
 * Retorna o label de um nível de operacionalidade
 */
export function getOperLabel(oper: OperType): string {
   return OPER_LABELS[oper];
}
