// @vitest-environment jsdom

import type { PointerEvent } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook } from "@testing-library/react";
import { useBoardDrag } from "@/app/(home)/ops/indisp/components/board/hooks/useBoardDrag";

beforeEach(() => {
   vi.useFakeTimers();
   vi.stubGlobal("requestAnimationFrame", (callback: () => void) =>
      setTimeout(callback, 0)
   );
   vi.stubGlobal("cancelAnimationFrame", clearTimeout);
});
afterEach(() => {
   cleanup();
   vi.unstubAllGlobals();
   vi.useRealTimers();
});

function setup() {
   const board = document.createElement("div");
   const child = document.createElement("button");
   board.append(child);
   board.setPointerCapture = vi.fn();
   board.hasPointerCapture = vi.fn(() => true);
   board.releasePointerCapture = vi.fn();
   const shift = vi.fn();
   const { result } = renderHook(() => useBoardDrag(() => 350, 7, shift));
   const event = (x: number, y = 100, target: HTMLElement = child) =>
      ({
         currentTarget: board,
         target,
         pointerId: 1,
         pointerType: "touch",
         button: 0,
         clientX: x,
         clientY: y,
      }) as unknown as PointerEvent<HTMLDivElement>;
   return { board, child, shift, result, event };
}

describe("arrasto da grade no toque", () => {
   it.each(["onPointerUp", "onPointerCancel", "onLostPointerCapture"] as const)(
      "finaliza %s sem tentar liberar um ponteiro já invalidado pelo navegador",
      (handler) => {
         const { result, event, shift, board } = setup();
         vi.mocked(board.releasePointerCapture).mockImplementation(() => {
            throw new DOMException("Invalid pointer id", "NotFoundError");
         });
         act(() => {
            result.current.dragHandlers.onPointerDown(event(100));
            result.current.dragHandlers.onPointerMove(event(50));
            result.current.dragHandlers[handler](event(50, 100, board));
            result.current.dragHandlers.onLostPointerCapture(
               event(50, 100, board)
            );
            vi.runAllTimers();
         });
         expect(board.releasePointerCapture).not.toHaveBeenCalled();
         expect(shift).toHaveBeenCalledExactlyOnceWith(1);
      }
   );

   it("continua após o filho perder a captura implícita para a grade", () => {
      const { result, event, shift } = setup();
      act(() => {
         result.current.dragHandlers.onPointerDown(event(100));
         result.current.dragHandlers.onPointerMove(event(104));
         result.current.dragHandlers.onLostPointerCapture(event(104));
         result.current.dragHandlers.onPointerMove(event(50));
         result.current.dragHandlers.onPointerUp(event(50));
      });
      expect(shift).toHaveBeenCalledWith(1);
      expect(result.current.wasDragged()).toBe(true);
   });

   it("encerra quando a própria grade perde a captura", () => {
      const { result, event, shift, board } = setup();
      act(() => {
         result.current.dragHandlers.onPointerDown(event(100));
         result.current.dragHandlers.onPointerMove(event(104));
         result.current.dragHandlers.onLostPointerCapture(
            event(104, 100, board)
         );
         result.current.dragHandlers.onPointerMove(event(50));
         vi.runAllTimers();
      });
      expect(shift).not.toHaveBeenCalled();
   });

   it("preserva rolagem vertical com deriva horizontal do dedo", () => {
      const { result, event, shift, board } = setup();
      act(() => {
         result.current.dragHandlers.onPointerDown(event(100));
         result.current.dragHandlers.onPointerMove(event(104, 140));
         result.current.dragHandlers.onPointerMove(event(50, 180));
         vi.runAllTimers();
      });
      expect(shift).not.toHaveBeenCalled();
      expect(board.setPointerCapture).not.toHaveBeenCalled();
   });

   it("preserva o clique quando não houve arrasto", () => {
      const { result, event, shift } = setup();
      act(() => {
         result.current.dragHandlers.onPointerDown(event(100));
         result.current.dragHandlers.onPointerMove(event(102));
         result.current.dragHandlers.onPointerUp(event(102));
      });
      expect(shift).not.toHaveBeenCalled();
      expect(result.current.wasDragged()).toBe(false);
   });
});
