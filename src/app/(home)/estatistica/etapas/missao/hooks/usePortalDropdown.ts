import { useEffect, useRef, useState, type RefObject } from "react";

type ScrollResizeMode = "close" | "reposition";

interface UsePortalDropdownOptions<P> {
   /** Quando aberto, calcula a posicao e registra os listeners. */
   open: boolean;
   /** Elemento ancora usado para o getBoundingClientRect. */
   anchorRef: RefObject<HTMLElement | null>;
   /** Calcula a posicao do portal a partir do rect da ancora. */
   compute: (rect: DOMRect) => P;
   /** scroll/resize fecha o dropdown ("close") ou apenas reposiciona ("reposition"). */
   scrollResize?: ScrollResizeMode;
   /** Fecha ao clicar fora da ancora e do dropdown. */
   closeOnOutside?: boolean;
   /** Fecha ao pressionar Escape. */
   closeOnEscape?: boolean;
   /** Dropdown renderizado via portal — usado no teste de clique-fora. */
   dropdownRef?: RefObject<HTMLElement | null>;
   /** Solicita o fechamento (close/outside/escape). */
   onRequestClose?: () => void;
}

/**
 * Gerencia o posicionamento de um dropdown renderizado via portal: calcula a
 * posicao a partir de uma ancora ao abrir e registra os listeners de
 * scroll/resize (+ opcionalmente clique-fora e Escape), removendo-os ao fechar.
 *
 * Os comportamentos sao configuraveis para acomodar variacoes (fechar vs.
 * reposicionar no scroll, tratar ou nao clique-fora/Escape) sem mudar a
 * semantica de cada consumidor.
 */
export function usePortalDropdown<P>({
   open,
   anchorRef,
   compute,
   scrollResize = "reposition",
   closeOnOutside = false,
   closeOnEscape = false,
   dropdownRef,
   onRequestClose,
}: UsePortalDropdownOptions<P>): P | null {
   const [position, setPosition] = useState<P | null>(null);

   // Refs para callbacks evitam re-subscrever os listeners a cada render.
   const computeRef = useRef(compute);
   computeRef.current = compute;
   const onRequestCloseRef = useRef(onRequestClose);
   onRequestCloseRef.current = onRequestClose;

   useEffect(() => {
      if (!open) return;
      const anchor = anchorRef.current;
      if (!anchor) return;

      const reposition = () => {
         const el = anchorRef.current;
         if (!el) return;
         setPosition(computeRef.current(el.getBoundingClientRect()));
      };
      reposition();

      const handleScrollResize = () => {
         if (scrollResize === "close") onRequestCloseRef.current?.();
         else reposition();
      };
      function handleOutside(e: MouseEvent) {
         const target = e.target as Node;
         if (anchorRef.current?.contains(target)) return;
         if (dropdownRef?.current?.contains(target)) return;
         onRequestCloseRef.current?.();
      }
      function handleEscape(e: KeyboardEvent) {
         if (e.key === "Escape") onRequestCloseRef.current?.();
      }

      window.addEventListener("scroll", handleScrollResize, true);
      window.addEventListener("resize", handleScrollResize);
      if (closeOnOutside) document.addEventListener("mousedown", handleOutside);
      if (closeOnEscape) document.addEventListener("keydown", handleEscape);

      return () => {
         window.removeEventListener("scroll", handleScrollResize, true);
         window.removeEventListener("resize", handleScrollResize);
         if (closeOnOutside)
            document.removeEventListener("mousedown", handleOutside);
         if (closeOnEscape)
            document.removeEventListener("keydown", handleEscape);
      };
   }, [
      open,
      anchorRef,
      dropdownRef,
      scrollResize,
      closeOnOutside,
      closeOnEscape,
   ]);

   return position;
}
