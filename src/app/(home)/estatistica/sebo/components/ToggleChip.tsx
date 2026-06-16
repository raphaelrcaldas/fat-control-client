"use client";
import type { ReactNode } from "react";
import clsx from "clsx";

interface ToggleChipProps {
   active: boolean;
   onToggle: () => void;
   children: ReactNode;
   /** Classe aplicada quando ativo (default: vermelho da marca). */
   activeClass?: string;
   /** Classes extras no botão (ex.: largura em grid). */
   className?: string;
}

/** Chip on/off reutilizável, acessível (aria-pressed) e sóbrio. */
export function ToggleChip({
   active,
   onToggle,
   children,
   activeClass = "bg-red-600 text-white",
   className,
}: ToggleChipProps) {
   return (
      <button
         type="button"
         onClick={onToggle}
         aria-pressed={active}
         className={clsx(
            "inline-flex w-10 items-center justify-center rounded px-3 py-1.5 text-sm font-semibold uppercase transition-colors",
            active
               ? activeClass
               : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            className
         )}
      >
         {children}
      </button>
   );
}
