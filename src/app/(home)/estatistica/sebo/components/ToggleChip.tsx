"use client";
import type { ReactNode } from "react";
import clsx from "clsx";
import { Button } from "flowbite-react";

interface ToggleChipProps {
   active: boolean;
   onToggle: () => void;
   children: ReactNode;
   /** Classe aplicada quando ativo (default: cor da organização). */
   activeClass?: string;
   /** Classes extras no botão (ex.: largura em grid). */
   className?: string;
}

/** Chip on/off reutilizável, acessível (aria-pressed) e sóbrio. */
export function ToggleChip({
   active,
   onToggle,
   children,
   activeClass = "bg-primary-600 text-white",
   className,
}: ToggleChipProps) {
   return (
      <Button
         color="light"
         size="xs"
         clearTheme={{ color: { light: true } }}
         type="button"
         onClick={onToggle}
         aria-pressed={active}
         // `focus:ring-0` anula o `focus:ring-4` da base do Button: sem a cor
         // `light` ele herdava a cor do texto e aparecia até no clique do mouse.
         // `focus-visible:outline-solid` é obrigatório: o `focus:outline-none`
         // da base zera `--tw-outline-style` e o contorno sumia no teclado.
         className={clsx(
            "focus-visible:outline-primary-600 inline-flex h-10 shrink-0 items-center justify-center px-2 py-1.5 text-xs font-semibold uppercase transition-colors focus:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid motion-reduce:transition-none",
            active
               ? activeClass
               : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            className
         )}
      >
         {children}
      </Button>
   );
}
