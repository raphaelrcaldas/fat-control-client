"use client";

import { useEffect, useState } from "react";

/** Breakpoints do Tailwind, na expressão que a media query entende. */
const BREAKPOINTS = {
   sm: "40rem",
   md: "48rem",
   lg: "64rem",
   xl: "80rem",
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Verdadeiro abaixo do breakpoint pedido.
 *
 * Existe para o que CSS não alcança: texto de rótulo em prop (uma opção de
 * select não é elemento e não aceita classe responsiva) e `inert`, que é
 * atributo. Layout continua sendo trabalho de classe responsiva.
 *
 * A consulta usa a expressão IDÊNTICA à do Tailwind, e o número não é o que
 * parece: dentro de uma media query o `rem` se resolve contra o tamanho
 * INICIAL de fonte (16px), ignorando a raiz de 87,5% do client — então `md:`
 * é 768px, não os 672px que a conta ingênua daria.
 *
 * O primeiro render é sempre o de desktop (`false`), inclusive no servidor:
 * quem depender disso para MOSTRAR algo no mobile deve fazê-lo por classe, não
 * por este hook.
 */
export function useAbaixoDe(breakpoint: Breakpoint): boolean {
   const [compacto, setCompacto] = useState(false);

   useEffect(() => {
      const mq = window.matchMedia(`(min-width: ${BREAKPOINTS[breakpoint]})`);
      const aplicar = () => setCompacto(!mq.matches);
      aplicar();
      mq.addEventListener("change", aplicar);
      return () => mq.removeEventListener("change", aplicar);
   }, [breakpoint]);

   return compacto;
}
