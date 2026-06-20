import { timeToMinutes } from "@/../utils/dateHandler";

/**
 * Calcula tvoo (minutos). arr DEVE ser maior que dep no mesmo dia.
 * arr == 00:00 com dep > 00:00 representa fim do dia (24:00).
 * Retorna 0 se inválido (atravessa o dia). Regra de negócio do simulador.
 */
export function computeTvoo(dep: string, arr: string): number {
   if (!dep || !arr) return 0;
   const depMin = timeToMinutes(dep);
   let arrMin = timeToMinutes(arr);
   if (arrMin === 0 && depMin > 0) arrMin = 1440;
   if (arrMin <= depMin) return 0;
   return arrMin - depMin;
}
