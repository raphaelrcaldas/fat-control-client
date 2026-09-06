import clsx from "clsx";
import { getOperLabel } from "@/constants/tripulantes";
import { useFuncoes } from "@/hooks/queries";
import type { FuncType, OperType } from "../types/trip.types";

type TripFuncBadgeProps = {
   func: FuncType;
   oper: OperType;
};

/**
 * Função e operacionalidade num chip único.
 *
 * Antes eram dois contêineres aninhados (pill branca com borda e sombra
 * envolvendo um badge colorido); em cinquenta linhas a moldura extra pesava
 * mais que o dado. A cor é a da FUNÇÃO — a mesma do catálogo em `/config`, que
 * o resto do sistema usa para agrupar tripulante por função.
 */
export function TripFuncBadge({ func, oper }: TripFuncBadgeProps) {
   const { labelShort, colors } = useFuncoes();

   return (
      <span
         className={clsx(
            "inline-flex min-w-18 items-center justify-center gap-1 rounded border px-2 py-0.5 text-xs leading-5 font-semibold uppercase",
            colors(func).badge
         )}
         title={`${labelShort(func)}: ${getOperLabel(oper)}`}
      >
         {/* Sem `opacity-*` para atenuar a funcao: sobre o fundo claro do chip
             a opacidade derruba o contraste abaixo de AA. A hierarquia sai do
             peso — a operacionalidade e o que muda de linha para linha. */}
         <span className="font-medium">{func}</span>
         <span aria-hidden>·</span>
         <span>{oper}</span>
      </span>
   );
}
