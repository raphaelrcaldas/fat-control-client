"use client";

import { useEffect, useId, useRef } from "react";
import { Spinner } from "flowbite-react";

interface LoadingOverlayProps {
   message?: string;
}

// `<dialog>` nativo aberto via `showModal()`: a top layer ignora o stacking
// context do pai (dispensa `createPortal`/`z-[60]`, o componente pode
// renderizar onde está) e torna o resto do documento inerte, travando
// teclado e ponteiro sem focus trap manual. O nome acessível vem do próprio
// dialog via `aria-labelledby`; por isso o `Spinner` (que carrega seu
// próprio `role="status"`) sai da árvore de acessibilidade.
export default function LoadingOverlay({
   message = "Saindo...",
}: LoadingOverlayProps) {
   const dialogRef = useRef<HTMLDialogElement>(null);
   const messageId = useId();

   useEffect(() => {
      const el = dialogRef.current;
      if (!el) return;
      el.showModal();
      // Esc não pode fechar: o overlay só sai quando o componente desmonta.
      // O listener é no documento, e não no `onKeyDown` do dialog: um Tab
      // leva o foco para o `body` (não há nada focável aqui dentro), e aí o
      // keydown nunca passa pelo dialog — medido: o terceiro Esc fechava.
      // Reforço para motor sem `closedby`.
      const bloquearEsc = (e: KeyboardEvent) => {
         if (e.key === "Escape") e.preventDefault();
      };
      document.addEventListener("keydown", bloquearEsc, true);
      return () => {
         document.removeEventListener("keydown", bloquearEsc, true);
         if (el.open) el.close();
      };
   }, []);

   return (
      <dialog
         ref={dialogRef}
         aria-labelledby={messageId}
         aria-busy="true"
         // Esc e "voltar" não fecham o dialog. O "voltar" do Android segue
         // navegando o histórico por baixo do véu (não medido).
         closedby="none"
         onCancel={(e) => e.preventDefault()}
         // O Preflight do Tailwind zera `margin` em todo elemento (`* {
         // margin: 0 }`), inclusive `<dialog>`. Isso vence o `margin: auto`
         // que o UA aplica em `dialog:modal` para centralizar (author sempre
         // sobrepõe UA, com ou sem especificidade) — sem `m-auto` explícito o
         // cartão cola no canto superior esquerdo em vez de centralizar.
         // `outline-none`: o foco no dialog é técnico (não há controle
         // dentro), e o anel desenhava uma borda em volta do cartão. O
         // cartão (fundo, raio, sombra) é o próprio dialog: o UA põe
         // `overflow: auto` no `dialog:modal`, que cortava a sombra de um
         // filho. `flex` fica no filho — `display` de autor no dialog venceria
         // o `display: none` do dialog fechado. `min-w-56`: mesma largura em
         // "Saindo..." e "Trocando para…".
         className="m-auto min-w-56 rounded border-0 bg-white p-8 shadow-2xl outline-none backdrop:bg-black/50"
      >
         <div className="flex flex-col items-center gap-4">
            <Spinner size="xl" color="primary" aria-hidden />
            {/* `aria-hidden` chega até o <span role="status"> do Spinner:
                ele repassa `restProps` para o elemento com o role. */}
            <p id={messageId} className="text-lg font-medium text-gray-700">
               {message}
            </p>
         </div>
      </dialog>
   );
}
