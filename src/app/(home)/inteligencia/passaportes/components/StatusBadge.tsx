"use client";

import clsx from "clsx";
import type { StatusPassaporte } from "services/routes/inteligencia/passaportes";
import { getStatusPassaporteConfig } from "../utils/statusPassaporte";

/**
 * Chip de situação do passaporte físico.
 *
 * Largura fixa (`w-32`) para os quatro rótulos ocuparem a mesma caixa: com
 * largura de conteúdo, "Disponível" e "Com o militar" deixam a coluna
 * oscilando de linha em linha e o olho perde a régua vertical.
 */
export function StatusBadge({ status }: { status: StatusPassaporte }) {
   const config = getStatusPassaporteConfig(status);
   const Icon = config.icon;

   return (
      <span
         className={clsx(
            "inline-flex w-32 items-center justify-center gap-1 rounded border px-2 py-0.5 text-xs font-medium",
            config.bg,
            config.border,
            config.color
         )}
      >
         <Icon className="h-3 w-3 shrink-0" />
         {config.label}
      </span>
   );
}
