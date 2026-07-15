/**
 * Chip de ícone das linhas de campo (leitura, edição e promoções).
 * Um único ponto para a dupla de cores 100/600 — a migração de tema red→primary
 * teve que ser repetida célula a célula justamente porque isso vivia inline.
 */

import type { ComponentType } from "react";
import clsx from "clsx";

const TONES = {
   /** Acento de marca (tematizado por org). */
   primary: "bg-primary-100 text-primary-600",
   /** Estado de edição ativa. */
   blue: "bg-blue-100 text-blue-600",
} as const;

interface FieldIconChipProps {
   icon: ComponentType<{ className?: string }>;
   tone?: keyof typeof TONES;
}

export function FieldIconChip({
   icon: Icon,
   tone = "primary",
}: FieldIconChipProps) {
   return (
      <div className={clsx("shrink-0 rounded-md p-2.5", TONES[tone])}>
         <Icon className="h-4 w-4" />
      </div>
   );
}
