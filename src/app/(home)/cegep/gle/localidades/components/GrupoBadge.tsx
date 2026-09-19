import clsx from "clsx";

import { GRUPO_A, grupoLetra } from "services/routes/cegep/gle";

interface GrupoBadgeProps {
   grupo: number;
   /** `sm` para dentro de tabela; `md` para cabeçalho de card. */
   size?: "sm" | "md";
}

/**
 * Grupo da localidade especial, sempre como letra.
 *
 * A distinção entre A e B **não pode depender só de cor** — a letra é o
 * dado, o tom é reforço. Os dois usam a escala slate porque nenhum dos dois
 * é alerta: A é grau maior, não perigo, e `red-*` é reservado a
 * perigo/exclusão/erro.
 */
export function GrupoBadge({ grupo, size = "sm" }: GrupoBadgeProps) {
   const isA = grupo === GRUPO_A;
   return (
      <span
         className={clsx(
            "inline-flex items-center justify-center rounded font-bold tabular-nums",
            size === "sm"
               ? "min-w-[24px] px-1.5 py-0.5 text-xs"
               : "min-w-[28px] px-2 py-1 text-sm",
            isA
               ? "bg-slate-800 text-white"
               : "border border-slate-300 bg-white text-slate-700"
         )}
         title={`Grupo ${grupoLetra(grupo)}`}
      >
         {grupoLetra(grupo)}
      </span>
   );
}
