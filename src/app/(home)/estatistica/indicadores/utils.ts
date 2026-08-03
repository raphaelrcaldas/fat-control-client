/** Inteiro com separador de milhar pt-BR. */
export function fmtInt(n: number): string {
   return n.toLocaleString("pt-BR");
}

/** Decimal com 1 casa (lubrificante vem de Numeric(5,1)). */
export function fmtDec(n: number): string {
   return n.toLocaleString("pt-BR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
   });
}

/**
 * Quilogramas em toneladas. Um total anual de carga passa de um milhão
 * de kg — em kg o número vira ilegível no card.
 */
export function kgToT(kg: number): string {
   return (kg / 1000).toLocaleString("pt-BR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
   });
}

/** Participação percentual, protegida contra total zero. */
export function pct(parte: number, total: number): number {
   return total > 0 ? (parte / total) * 100 : 0;
}
