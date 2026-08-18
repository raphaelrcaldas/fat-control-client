/**
 * Preferência de movimento do sistema, para a lógica que o CSS não alcança.
 *
 * `motion-reduce:` já cobre a *transição*; o que ele não cobre é o valor
 * inicial artificial que existe só para a transição acontecer (começar em zero
 * e aplicar o valor no frame seguinte). Sem consultar a preferência aqui, quem
 * pediu menos movimento recebia o salto sem sequer a interpolação — o pior dos
 * dois mundos.
 *
 * Retorna `false` no servidor, onde não há `matchMedia`: o efeito que a
 * consome só roda no cliente.
 */
export function prefereMenosMovimento(): boolean {
   if (typeof window === "undefined" || !window.matchMedia) return false;
   return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
