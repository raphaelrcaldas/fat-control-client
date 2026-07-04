/** Primeiro exercício fiscal controlado pelo sistema. */
export const PRIMEIRO_EXERCICIO = 2026;

/**
 * Anos disponíveis para o seletor de exercício fiscal. Começa em
 * {@link PRIMEIRO_EXERCICIO} e vai até pelo menos 2031, sempre incluindo o ano
 * seguinte ao atual. Assim, anos históricos nunca somem do seletor (ao
 * contrário de uma janela móvel) e há folga para planejar o próximo exercício.
 */
export function getFiscalYears(
   currentYear: number = new Date().getFullYear()
): number[] {
   const last = Math.max(2031, currentYear + 1);
   const years: number[] = [];
   for (let y = PRIMEIRO_EXERCICIO; y <= last; y++) years.push(y);
   return years;
}

/** Exercício default: o ano atual, nunca antes do primeiro exercício. */
export function getDefaultFiscalYear(
   currentYear: number = new Date().getFullYear()
): number {
   return Math.max(PRIMEIRO_EXERCICIO, currentYear);
}
