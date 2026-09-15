"use client";

import {
   PointerEvent,
   useCallback,
   useEffect,
   useRef,
   WheelEvent,
} from "react";

/** Movimento abaixo disso ainda é clique, não arrasto. */
const LIMIAR_PX = 3;

interface DragState {
   pointerId: number;
   x: number;
   y: number;
   /** Largura de um dia, medida no início do gesto. */
   dayPx: number;
   /** Deslocamento já aplicado durante o gesto. */
   passos: number;
}

/**
 * Navegação por arrasto numa linha do tempo horizontal: a grade inteira é a
 * superfície do gesto.
 *
 * Compartilhado por `ops/indisp` (faixas de indisponibilidade) e `ops/quadro`
 * (etapas de missão), que substituíram as setas de navegação por este gesto.
 * Vive aqui, e não dentro de uma das duas telas, porque concentra armadilhas
 * medidas no navegador — gesto vertical pertence ao scroll, o `pointerup` pode
 * nunca chegar (só `pointercancel`), o `lostpointercapture` do filho borbulha,
 * e o trackpad dispara dezenas de eventos que precisam acumular até fechar um
 * dia. Ver `docs/ai/notes/frontend-armadilhas.md`. Com duas cópias, a próxima
 * correção consertaria uma e deixaria a outra em produção.
 *
 * Como os itens da grade também são clicáveis (a faixa e a vaga de "+" no
 * indisp, o chip de etapa no quadro), o hook expõe `wasDragged()` para que um
 * arrasto terminado em cima deles não dispare o clique.
 *
 * `trackWidth` deve medir **apenas** a área que representa tempo: incluir uma
 * coluna fixa lateral superestima o dia e faz o conteúdo escorregar sob o dedo.
 */
export function useTimelineDrag(
   trackWidth: () => number,
   dayCount: number,
   shiftDays: (days: number) => void
) {
   const drag = useRef<DragState | null>(null);
   const dragged = useRef(false);
   const frame = useRef<number | null>(null);
   const pending = useRef(0);
   const flush = useCallback(() => {
      frame.current = null;
      const delta = pending.current;
      pending.current = 0;
      if (delta) shiftDays(delta);
   }, [shiftDays]);
   useEffect(
      () => () => {
         if (frame.current !== null) cancelAnimationFrame(frame.current);
      },
      []
   );

   const onPointerDown = useCallback(
      (event: PointerEvent<HTMLDivElement>) => {
         dragged.current = false;
         // Só o botão principal; roda do meio e menu de contexto passam reto.
         if (event.button !== 0) return;
         const largura = trackWidth();
         if (largura <= 0) return;
         drag.current = {
            pointerId: event.pointerId,
            x: event.clientX,
            y: event.clientY,
            dayPx: largura / dayCount,
            passos: 0,
         };
      },
      [trackWidth, dayCount]
   );

   const onPointerMove = useCallback(
      (event: PointerEvent<HTMLDivElement>) => {
         const atual = drag.current;
         if (!atual || atual.pointerId !== event.pointerId) return;
         const dx = event.clientX - atual.x;
         const dy = event.clientY - atual.y;
         // Um gesto vertical pertence ao scroll, mesmo com pequena deriva
         // horizontal do dedo. A direção é decidida antes de capturar o toque.
         if (
            !dragged.current &&
            event.pointerType === "touch" &&
            Math.abs(dy) > LIMIAR_PX &&
            Math.abs(dy) > Math.abs(dx)
         ) {
            drag.current = null;
            return;
         }
         if (Math.abs(dx) > LIMIAR_PX && !dragged.current) {
            dragged.current = true;
            event.currentTarget.setPointerCapture(event.pointerId);
         }

         const passos = Math.round(-dx / atual.dayPx);
         pending.current += passos - atual.passos;
         atual.passos = passos;
         if (frame.current === null)
            frame.current = requestAnimationFrame(flush);
      },
      [flush]
   );

   const finishDrag = useCallback(
      (event: PointerEvent<HTMLDivElement>) => {
         const atual = drag.current;
         if (!atual || atual.pointerId !== event.pointerId) return;
         drag.current = null;
         // pointerup/pointercancel liberam a captura automaticamente;
         // em lostpointercapture ela já foi perdida. O id pode estar inativo.
         if (frame.current !== null) cancelAnimationFrame(frame.current);
         flush();
      },
      [flush]
   );

   // Dois dedos no trackpad é o gesto mais natural numa linha do tempo
   // horizontal, e não fazia nada. Acumula porque o trackpad dispara dezenas
   // de eventos pequenos — só desloca quando fecha um dia inteiro.
   const wheelAcc = useRef(0);
   const onWheel = useCallback(
      (event: WheelEvent<HTMLDivElement>) => {
         if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
         const largura = trackWidth();
         if (largura <= 0) return;
         const dayPx = largura / dayCount;
         wheelAcc.current += event.deltaX;
         const passos = Math.trunc(wheelAcc.current / dayPx);
         if (passos !== 0) {
            wheelAcc.current -= passos * dayPx;
            shiftDays(passos);
         }
      },
      [trackWidth, dayCount, shiftDays]
   );

   const wasDragged = useCallback(() => dragged.current, []);

   return {
      dragHandlers: {
         onPointerDown,
         onPointerMove,
         onPointerUp: finishDrag,
         // O navegador pode assumir o gesto (scroll vertical no toque) e só
         // avisar por `pointercancel`. Ainda preservamos o deslocamento que
         // o usuário já fez antes de o navegador assumir o gesto.
         onPointerCancel: finishDrag,
         onLostPointerCapture: (event: PointerEvent<HTMLDivElement>) => {
            // O toque começa com captura implícita no filho. Ao transferi-la
            // para a grade, o lostpointercapture do filho borbulha até aqui;
            // isso não significa que a grade perdeu sua própria captura.
            if (event.target === event.currentTarget) finishDrag(event);
         },
         onWheel,
      },
      wasDragged,
   };
}
