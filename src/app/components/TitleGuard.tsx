"use client";

import { useEffect } from "react";

interface TitleGuardProps {
   /** Título usado se o head já nascer sem tag (caso patológico). */
   fallback: string;
}

/**
 * Impede que a aba fique sem título durante a navegação.
 *
 * O App Router **desmonta e remonta** a tag `<title>` a cada navegação
 * client-side em vez de só trocar o texto. Entre os dois momentos o
 * documento fica sem título nenhum e o navegador preenche a aba com a URL
 * — medido em ~150ms no dev server, com `document.querySelectorAll("head
 * title").length` indo a 0 e voltando a 1.
 *
 * Aqui o título perdido é reposto assim que some. Repor cria uma tag
 * própria (o setter de `document.title` insere uma quando não existe
 * nenhuma), e é justamente ela que fecha a janela nas navegações
 * seguintes: o Next remove e recria a dele, a nossa permanece.
 *
 * Guarda o último título não-vazio em vez de cravar uma constante, para
 * não atropelar página que define o próprio título (ex: `ops/om/[id]`).
 */
export function TitleGuard({ fallback }: TitleGuardProps) {
   useEffect(() => {
      let ultimo = document.title || fallback;

      const observer = new MutationObserver(() => {
         if (document.title) {
            ultimo = document.title;
            return;
         }
         // Reatribuir dispara nova mutação, mas o título já não está
         // vazio na próxima passada — não há laço.
         document.title = ultimo;
      });

      observer.observe(document.head, { childList: true });
      return () => observer.disconnect();
   }, [fallback]);

   return null;
}
