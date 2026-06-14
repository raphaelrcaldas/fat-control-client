import { isoDateToString } from "utils/dateHandler";
import { Quad } from "services/routes/quads";

/**
 * Valor exibível de um quadrinho: data formatada (DD/MM/YY) ou "LASTRO"
 * quando não há data associada.
 */
export function quadDisplayValue(quad: Quad): string {
   return quad.value ? isoDateToString(quad.value) : "LASTRO";
}
