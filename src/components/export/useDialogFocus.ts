"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE = [
   "a[href]",
   "button:not([disabled])",
   "input:not([disabled])",
   "select:not([disabled])",
   "textarea:not([disabled])",
   '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * Foco, trava de rolagem e Esc para um painel modal proprio.
 *
 * `aria-modal="true"` promete ao leitor de tela que o resto da pagina esta
 * inerte. Sem cerca de foco a promessa e falsa: o Tab escapa para a tabela
 * atras do overlay e a pessoa navega as cegas por um conteudo que a
 * tecnologia assistiva declarou invisivel. Ao fechar, o foco tem que voltar
 * para onde estava — senao o teclado recomeca do topo da pagina.
 *
 * Nao usamos o `Drawer` do flowbite-react 0.12.17 aqui: ele traz backdrop e
 * Esc, mas nao faz nada disto (sem cerca, sem devolucao de foco, sem travar a
 * rolagem) e ainda renderiza no lugar, o que reabre o problema do `translate`
 * residual do PageTransition ancorando `position: fixed`.
 */
export function useDialogFocus(
   open: boolean,
   onClose: () => void,
   /**
    * Suspende a cerca e o Esc enquanto um dialogo FILHO esta no ar.
    *
    * O `Modal` do flowbite-react 0.12.17 usa `FloatingPortal` e renderiza no
    * `<body>`, fora do painel. Sem isto: (a) `panel.contains(active)` da falso
    * e todo Tab arrasta o foco de volta para dentro da gaveta, disputando com
    * o gerenciador de foco do proprio Modal — nao da para tabular entre os
    * botoes dele; (b) o Esc fecharia a GAVETA por baixo do modal, que so
    * escuta Esc com `dismissible` e ficaria orfao flutuando sobre a tela.
    *
    * Lido por ref dentro do handler, e nao nas deps: mudar de valor nao pode
    * disparar o cleanup, senao o foco seria devolvido ao gatilho no exato
    * momento em que o modal filho o esta pedindo.
    */
   suspenso = false
): React.RefObject<HTMLElement | null> {
   const panelRef = useRef<HTMLElement | null>(null);

   // Por ref, e nunca nas deps: `onClose` costuma ser uma arrow nova a cada
   // render do pai, e o estado do carrinho MORA no pai. Remover um item da
   // gaveta re-renderiza a pagina, o efeito rodaria de novo e o `restoreTo`
   // seria recapturado — a essa altura ja e o <body>, porque a barra que
   // abriu a gaveta esta `inert`. O foco nunca mais voltaria para "Revisar".
   const onCloseRef = useRef(onClose);
   onCloseRef.current = onClose;
   const suspensoRef = useRef(suspenso);
   suspensoRef.current = suspenso;

   useEffect(() => {
      if (!open) return;

      const restoreTo = document.activeElement as HTMLElement | null;

      // O primeiro foco vai para o painel, e nao para o primeiro botao: quem
      // usa leitor de tela precisa ouvir o titulo da gaveta antes das acoes.
      //
      // Sai daqui se o painel ainda nao existe: quem anima a entrada so monta
      // o no no render seguinte, e ai o foco inicial e responsabilidade do
      // chamador, que sabe QUANDO o no aparece (ver `ExportCartDrawer`).
      // Capturar o `restoreTo`, ao contrario, tem que ser AGORA — um render
      // depois, o gatilho ja ganhou `inert` e o navegador jogou o foco no
      // <body>, que viraria o alvo da restauracao.
      panelRef.current?.focus();

      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      const onKey = (e: KeyboardEvent) => {
         if (suspensoRef.current) return;
         if (e.key === "Escape") {
            onCloseRef.current();
            return;
         }
         // Lido AQUI, e nao capturado quando o efeito montou: quem anima a
         // entrada so poe o painel na arvore no render seguinte, e um `panel`
         // capturado cedo demais fica `null` para sempre — a cerca sairia por
         // esta guarda em todo Tab, sem sintoma nenhum a nao ser o foco
         // vazando para a pagina atras do overlay.
         const panel = panelRef.current;
         if (e.key !== "Tab" || !panel) return;

         const focusables = [
            ...panel.querySelectorAll<HTMLElement>(FOCUSABLE),
         ].filter((el) => el.offsetParent !== null);
         if (focusables.length === 0) {
            e.preventDefault();
            return;
         }

         const first = focusables[0];
         const last = focusables[focusables.length - 1];
         const active = document.activeElement;

         // Fora do painel (ou no proprio painel) o Tab volta para dentro.
         if (!panel.contains(active as Node) || active === panel) {
            e.preventDefault();
            (e.shiftKey ? last : first).focus();
            return;
         }
         if (!e.shiftKey && active === last) {
            e.preventDefault();
            first.focus();
         } else if (e.shiftKey && active === first) {
            e.preventDefault();
            last.focus();
         }
      };

      document.addEventListener("keydown", onKey);
      return () => {
         document.removeEventListener("keydown", onKey);
         document.body.style.overflow = previousOverflow;
         // `isConnected`: focar um no ja removido da arvore e um no-op
         // silencioso, e o foco cairia no <body>. Quem esconde o gatilho
         // enquanto o dialogo esta aberto precisa mante-lo montado.
         if (restoreTo?.isConnected) restoreTo.focus();
      };
   }, [open]);

   return panelRef;
}
