import type { CrewFunc, FuncType } from "../types/trip.types";

/**
 * Verifica se uma função específica está disponível para ser adicionada
 * Uma função é considerada indisponível se já existe para o tripulante
 * (independente de oper e proj)
 */
export function isFuncAvailable(
   func: FuncType,
   existingFuncs: CrewFunc[],
   editingFuncId?: number
): boolean {
   // Verifica se a função já existe (independente de oper e proj)
   const exists = existingFuncs.some((f: CrewFunc) => {
      // Se estiver editando, ignora a função atual
      if (editingFuncId && f.id === editingFuncId) {
         return false;
      }
      // Verifica se a função já existe
      return f.func === func;
   });

   return !exists;
}
