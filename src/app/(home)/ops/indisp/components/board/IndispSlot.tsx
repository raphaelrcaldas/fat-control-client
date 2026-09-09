import { MouseEvent, PointerEvent, useCallback, useRef } from "react";
import { HiPlus } from "react-icons/hi";
import { laneTop } from "./utils/indispBoardLayout";

interface IndispSlotProps {
   /** Colunas livres onde o único hit-area pode criar um registro. */
   freeCols: readonly number[];
   total: number;
   onAdd: (col: number) => void;
}

/**
 * Vaga de criação: um único hit-area por linha, só para ponteiro fino.
 *
 * Ao trocar o dia pelo período como unidade da grade, criar um registro de um
 * dia perdeu o gesto óbvio que a célula vazia dava. A vaga devolve esse gesto
 * sem poluir a grade. O hit-area fica sob as faixas e só cria nas colunas sem
 * indisponibilidade administrativa.
 *
 * No dedo ela NÃO existe: affordance de hover não sobrevive a ponteiro grosso,
 * e um alvo transparente que abre formulário ao toque acidental é armadilha.
 * Ali o caminho de criação é trigrama → ficha do tripulante → "+ Adicionar".
 */
export function IndispSlot({ freeCols, total, onAdd }: IndispSlotProps) {
   const markerRef = useRef<HTMLSpanElement>(null);

   const columnAt = useCallback(
      (clientX: number, target: HTMLButtonElement) => {
         const bounds = target.getBoundingClientRect();
         if (bounds.width <= 0) return null;
         const col = Math.floor(
            ((clientX - bounds.left) / bounds.width) * total
         );
         return col >= 0 && col < total ? col : null;
      },
      [total]
   );

   const moveMarker = useCallback(
      (event: PointerEvent<HTMLButtonElement>) => {
         const col = columnAt(event.clientX, event.currentTarget);
         const marker = markerRef.current;
         if (col === null || !marker) return;
         marker.style.left = `${event.clientX - event.currentTarget.getBoundingClientRect().left}px`;
         marker.hidden = !freeCols.includes(col);
      },
      [columnAt, freeCols]
   );

   const handleClick = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
         const col = columnAt(event.clientX, event.currentTarget);
         if (col !== null && freeCols.includes(col)) onAdd(col);
      },
      [columnAt, freeCols, onAdd]
   );

   return (
      <button
         type="button"
         onClick={handleClick}
         onPointerEnter={moveMarker}
         onPointerMove={moveMarker}
         onPointerLeave={() => {
            if (markerRef.current) markerRef.current.hidden = true;
         }}
         /* Continua fora da sequência de Tab: criar por teclado é trigrama →
            ficha do tripulante → "+ Adicionar". */
         tabIndex={-1}
         title="Registrar indisponibilidade"
         aria-label="Registrar indisponibilidade na data apontada"
         style={{ top: laneTop(0), height: "var(--bar-h)" }}
         className="absolute inset-x-0 z-10 cursor-[inherit] pointer-coarse:hidden pointer-fine:hover:bg-slate-100"
      >
         <span
            ref={markerRef}
            hidden
            aria-hidden
            className="pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-500"
         >
            <HiPlus />
         </span>
      </button>
   );
}
