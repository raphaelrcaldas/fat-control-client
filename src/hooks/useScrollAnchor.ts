"use client";

import { useCallback, useEffect, useRef } from "react";

/** Sobe a árvore até o container que de fato rola. */
function scrollerDe(el: HTMLElement): HTMLElement | null {
   for (let pai = el.parentElement; pai; pai = pai.parentElement) {
      const { overflowY } = getComputedStyle(pai);
      if (
         /auto|scroll|overlay/.test(overflowY) &&
         pai.scrollHeight > pai.clientHeight
      ) {
         return pai;
      }
   }
   return null;
}

/**
 * Janela em que a âncora fica vigiando a altura do conteúdo.
 *
 * Cobre a requisição da página nova com folga. Passando disto, qualquer
 * mudança de altura já é outra coisa (um filtro, um card que expandiu) e
 * corrigir a rolagem seria sequestrar o gesto de outra pessoa.
 */
const JANELA_MS = 1500;

/**
 * Mantém um elemento parado na tela enquanto o conteúdo em volta muda de
 * altura.
 *
 * Nasceu do paginador. Numa listagem, a última página é quase sempre mais
 * curta que as outras — 32 registros contra 50. Quando ela renderiza, o
 * conteúdo encolhe e o navegador **corta** o `scrollTop` para o novo máximo,
 * em silêncio e com toda a razão: não há mais para onde rolar. O estrago
 * aparece na volta, quando o conteúdo recresce e ninguém restaura o valor
 * cortado — quem estava no fim da lista reaparece no meio dela.
 *
 * A correção não é lembrar o `scrollTop` (que é justamente o número
 * destruído), e sim onde o CONTROLE estava na tela. O usuário acabou de clicar
 * nele, então ele está visível; mantê-lo no mesmo ponto faz a troca de página
 * não mexer em nada sob o cursor, encurte ou cresça a lista.
 *
 * @param chave     muda quando a navegação acontece (a página atual)
 * @param obter     devolve o elemento a ancorar, ou `null` se não houver
 * @returns         chame ANTES de disparar a navegação
 */
export function useScrollAnchor(
   chave: unknown,
   obter: () => HTMLElement | null
) {
   const topoRef = useRef<number | null>(null);

   // Por ref, e nunca nas deps do efeito: o chamador passa uma arrow nova a
   // cada render, e depender dela remontaria o observer a cada quadro.
   const obterRef = useRef(obter);
   obterRef.current = obter;

   const ancorar = useCallback(() => {
      const el = obterRef.current();
      topoRef.current = el ? el.getBoundingClientRect().top : null;
   }, []);

   useEffect(() => {
      const topo = topoRef.current;
      topoRef.current = null;
      // Sem âncora marcada, a mudança veio de outro lugar (um filtro, a URL
      // digitada) e não é nossa para corrigir.
      if (topo === null) return;

      const el = obterRef.current();
      const scroller = el && scrollerDe(el);
      if (!scroller) return;

      const corrigir = () => {
         const atual = obterRef.current();
         if (!atual) return;
         const delta = atual.getBoundingClientRect().top - topo;
         if (Math.abs(delta) > 0.5) scroller.scrollTop += delta;
      };

      corrigir();

      // A altura só muda quando os dados novos renderizam, e com
      // `keepPreviousData` isso é DEPOIS deste efeito — por isso observar o
      // conteúdo, em vez de corrigir uma vez e ir embora.
      const observer = new ResizeObserver(corrigir);
      for (const filho of scroller.children) observer.observe(filho);
      const parar = setTimeout(() => observer.disconnect(), JANELA_MS);

      /**
       * Qualquer rolagem deliberada encerra a janela na hora.
       *
       * Sem isto, quem troca de página e sobe para ler do começo é devolvido
       * ao rodapé quando uma fonte ou imagem tardia mexe na altura 400ms
       * depois. A âncora existe para preservar o gesto do usuário; continuar
       * corrigindo depois que ele rolou é fazer o contrário.
       */
      const desarmar = () => observer.disconnect();
      const gestos = ["wheel", "touchstart", "keydown"] as const;
      for (const gesto of gestos) {
         scroller.addEventListener(gesto, desarmar, {
            once: true,
            passive: true,
         });
      }

      return () => {
         clearTimeout(parar);
         observer.disconnect();
         for (const gesto of gestos) {
            scroller.removeEventListener(gesto, desarmar);
         }
      };
   }, [chave]);

   return ancorar;
}
