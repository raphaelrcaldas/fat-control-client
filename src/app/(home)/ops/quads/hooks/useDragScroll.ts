"use client";
import { useRef } from "react";

export interface DragScrollProps {
   ref: React.RefObject<HTMLDivElement | null>;
   onMouseDown: (e: React.MouseEvent) => void;
   onMouseMove: (e: React.MouseEvent) => void;
   onMouseUp: () => void;
   onMouseLeave: () => void;
   onTouchStart: (e: React.TouchEvent) => void;
   onTouchMove: (e: React.TouchEvent) => void;
   onTouchEnd: () => void;
}

/**
 * Encapsula a lógica imperativa de "arrastar para rolar" (drag scroll)
 * horizontal de um container. Retorna o ref e os handlers prontos para
 * espalhar no elemento scrollável.
 *
 * O estado de repouso do cursor (`cursor-grab`) deve vir da className do
 * container; o hook apenas alterna para `grabbing` durante o arraste.
 */
export function useDragScroll(speed = 1.5): DragScrollProps {
   const ref = useRef<HTMLDivElement>(null);
   const isDragging = useRef(false);
   const startX = useRef(0);
   const scrollLeft = useRef(0);

   const onMouseDown = (e: React.MouseEvent) => {
      if (!ref.current) return;
      isDragging.current = true;
      startX.current = e.pageX - ref.current.offsetLeft;
      scrollLeft.current = ref.current.scrollLeft;
      ref.current.style.cursor = "grabbing";
   };

   const onMouseMove = (e: React.MouseEvent) => {
      if (!isDragging.current || !ref.current) return;
      e.preventDefault();
      const x = e.pageX - ref.current.offsetLeft;
      const walk = (x - startX.current) * speed;
      ref.current.scrollLeft = scrollLeft.current - walk;
   };

   const onMouseUp = () => {
      isDragging.current = false;
      if (ref.current) ref.current.style.cursor = "grab";
   };

   const onTouchStart = (e: React.TouchEvent) => {
      if (!ref.current) return;
      isDragging.current = true;
      startX.current = e.touches[0].pageX - ref.current.offsetLeft;
      scrollLeft.current = ref.current.scrollLeft;
   };

   const onTouchMove = (e: React.TouchEvent) => {
      if (!isDragging.current || !ref.current) return;
      const x = e.touches[0].pageX - ref.current.offsetLeft;
      const walk = (x - startX.current) * speed;
      ref.current.scrollLeft = scrollLeft.current - walk;
   };

   return {
      ref,
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onMouseLeave: onMouseUp,
      onTouchStart,
      onTouchMove,
      onTouchEnd: onMouseUp,
   };
}
