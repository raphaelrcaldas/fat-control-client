"use client";

import { useEffect, useState } from "react";

/**
 * Alvo do `createPortal`, resolvido so no cliente (no SSR nao ha `document`).
 *
 * Portalizar e OBRIGATORIO para qualquer `position: fixed` dentro do grupo
 * `(home)`: o `PageTransition` envolve toda pagina e mantem `translate: 0px`
 * residual apos a animacao. Um `translate` diferente de `none` cria bloco
 * conteiner, entao o `fixed` se ancora no wrapper (que comeca abaixo do
 * navbar) em vez da viewport — o overlay vaza abaixo da dobra e injeta
 * rolagem espuria na pagina.
 */
export function usePortalTarget(): HTMLElement | null {
   const [target, setTarget] = useState<HTMLElement | null>(null);

   useEffect(() => {
      setTarget(document.body);
   }, []);

   return target;
}
