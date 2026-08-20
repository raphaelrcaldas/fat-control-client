"use client";

import clsx from "clsx";
import { useFuncoes } from "@/hooks/queries/useFuncoes";
import type { TipoSubprograma } from "services/routes/instrucao/subprogramas";

/**
 * Cor de cada tipo de subprograma.
 *
 * Verde = formar (entra na função), azul = manter o padrão já conquistado,
 * roxo = ir além dele. Classes cravadas porque o Tailwind não compila nome
 * de cor montado em runtime — mesmo motivo do FUNC_COLORS.
 */
const TIPO_COLORS: Record<TipoSubprograma, string> = {
   Formação: "bg-emerald-100 text-emerald-800 border-emerald-500/60",
   Manutenção: "bg-blue-100 text-blue-800 border-blue-500/60",
   Especialização: "bg-purple-100 text-purple-800 border-purple-500/60",
};

// Largura fixa nos dois: badge que muda de tamanho por linha vira serrilhado
// na coluna. Cabe o maior valor de cada conjunto ("Especialização" e 3 letras).
const BASE =
   "inline-flex items-center justify-center rounded border px-2 py-0.5";

export function TipoBadge({ tipo }: { tipo: TipoSubprograma }) {
   return (
      <span
         className={clsx(BASE, "w-28 text-xs font-semibold", TIPO_COLORS[tipo])}
      >
         {tipo}
      </span>
   );
}

export function FuncBadge({ func }: { func: string }) {
   const { colors } = useFuncoes();

   return (
      <span
         className={clsx(
            BASE,
            "w-12 font-mono text-xs font-bold uppercase",
            colors(func).badge
         )}
      >
         {func}
      </span>
   );
}
