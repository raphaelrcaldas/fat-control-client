"use client";

import clsx from "clsx";
import type { LocalPassaporte } from "services/routes/inteligencia/passaportes";
import { getLocalConfig } from "../utils/localPassaporte";

/**
 * Chip de custódia do passaporte físico.
 *
 * Largura fixa (`w-32`) para os três rótulos ocuparem a mesma caixa: com
 * largura de conteúdo, "Na seção" e "Com o militar" deixam a coluna oscilando
 * de linha em linha e o olho perde a régua vertical.
 */
export function LocalBadge({ local }: { local: LocalPassaporte }) {
   const config = getLocalConfig(local);
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
