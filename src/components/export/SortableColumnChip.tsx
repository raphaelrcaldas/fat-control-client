"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { HiLockClosed, HiOutlineMenu } from "react-icons/hi";
import clsx from "clsx";

/**
 * Forma do chip, compartilhada entre o item da lista e a copia que segue o
 * cursor no `DragOverlay` — as duas TEM que ser identicas, senao o chip muda
 * de tamanho no instante em que o arrasto comeca.
 *
 * `touch-none` e obrigatorio no arrastavel: sem ele o browser reivindica o
 * gesto para rolar e dispara `pointercancel`, abortando o arrasto no dedo.
 */
const CHIP_BASE =
   "flex shrink-0 touch-none items-center gap-1.5 rounded border bg-white px-2 py-1 text-xs font-medium whitespace-nowrap shadow-sm select-none";

function ChipContent({ label, locked }: { label: string; locked?: boolean }) {
   return (
      <>
         <HiOutlineMenu className="h-3.5 w-3.5 shrink-0 text-slate-400" />
         {locked && (
            <HiLockClosed className="h-3 w-3 shrink-0 text-slate-400" />
         )}
         {label}
      </>
   );
}

interface SortableColumnChipProps {
   id: string;
   label: string;
   /** Coluna obrigatoria: ganha cadeado, mas continua reordenavel. */
   locked?: boolean;
}

export function SortableColumnChip({
   id,
   label,
   locked,
}: SortableColumnChipProps) {
   const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
   } = useSortable({ id });

   return (
      <li
         ref={setNodeRef}
         // `Translate`, nao `Transform`: o transform do dnd-kit carrega
         // tambem `scaleX/scaleY`, que deformava chips de larguras diferentes
         // ("P/G" vs "Nome Completo"). Aqui so o deslocamento interessa.
         style={{ transform: CSS.Translate.toString(transform), transition }}
         // Enquanto arrasta, este vira a LACUNA: quem segue o cursor e a copia
         // do DragOverlay. A lacuna desliza junto com os vizinhos e por isso
         // mostra exatamente onde o chip vai cair.
         className={clsx(
            CHIP_BASE,
            "cursor-grab active:cursor-grabbing",
            isDragging
               ? "border-primary-300 border-dashed text-transparent opacity-70 [&>svg]:invisible"
               : "border-slate-200 text-slate-600"
         )}
         {...attributes}
         {...listeners}
      >
         <ChipContent label={label} locked={locked} />
      </li>
   );
}

/**
 * Copia erguida do chip, renderizada pelo `DragOverlay`.
 *
 * Existe porque a tira e um container de rolagem (`overflow-x-auto`): assim
 * que um eixo deixa de ser `visible`, o outro tambem passa a recortar, e o
 * chip erguido aparecia cortado na borda da div. O DragOverlay desenha fora
 * desse container e some com o recorte.
 */
export function ColumnChipOverlay({
   label,
   locked,
}: {
   label: string;
   locked?: boolean;
}) {
   return (
      <div
         className={clsx(
            CHIP_BASE,
            "border-primary-400 ring-primary-100 cursor-grabbing text-slate-700 shadow-lg ring-2"
         )}
      >
         <ChipContent label={label} locked={locked} />
      </div>
   );
}
