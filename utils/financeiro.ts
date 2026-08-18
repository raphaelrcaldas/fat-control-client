/**
 * Menor diária da tabela vigente. Serve só para dar **escala em dias** a um
 * comissionamento comparativo (que conta valor, não dias): dividir o valor
 * por ela responde "isso equivale a mais ou menos quantas diárias?". Nunca
 * usar para calcular dinheiro — o valor real vem do backend, por P/G.
 */
export const VALOR_DIARIA = 335;

export function realCurrency(valor: number) {
   return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
   });
}

/**
 * Converte um inteiro de **centavos** para "1.234.567,89" (pt-BR, com
 * separadores e sem símbolo). Par de {@link parseDigitsToCents}: juntos formam
 * a máscara de moeda dos inputs, que guardam o valor em centavos inteiros para
 * não acumular erro binário.
 */
export function formatCents(cents: number): string {
   return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
   }).format(cents / 100);
}

/** Extrai apenas os dígitos do que foi digitado e interpreta como centavos. */
export function parseDigitsToCents(raw: string): number {
   const digits = raw.replace(/\D/g, "");
   if (!digits) return 0;
   return Number(digits);
}
