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
