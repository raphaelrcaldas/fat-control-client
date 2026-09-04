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
   onClose: () => void
): React.RefObject<HTMLElement | null> {
   const panelRef = useRef<HTMLElement | null>(null);

   useEffect(() => {
      if (!open) return;

      const panel = panelRef.current;
      const restoreTo = document.activeElement as HTMLElement | null;

      // O primeiro foco vai para o painel, e nao para o primeiro botao: quem
      // usa leitor de tela precisa ouvir o titulo da gaveta antes das acoes.
      panel?.focus();

      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      const onKey = (e: KeyboardEvent) => {
         if (e.key === "Escape") {
            onClose();
            return;
         }
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
   }, [open, onClose]);

   return panelRef;
}
