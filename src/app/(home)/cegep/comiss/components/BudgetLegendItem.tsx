import clsx from "clsx";

interface BudgetLegendItemProps {
   /** Rótulo curto da fatia (Pago, Previsto, Disponível, nome do cenário…). */
   label: string;
   /** Valor já formatado — sempre na linha de baixo, nunca ao lado do rótulo. */
   valor: string;
   dotClass: string;
   textClass: string;
   /** Posicionamento no container da legenda (ex: `col-start-3`). */
   className?: string;
}

/**
 * Item de legenda das barras de orçamento — usado pelo `GestaoFiscalCard` e
 * pela `BudgetBar` do sandbox de propostas, que precisam ler igual.
 *
 * Rótulo em cima, valor embaixo: em linha única o par "PAGO R$ 814.339,22"
 * quebrava no meio quando o card ficava estreito, e um item ia parar sozinho
 * numa segunda linha desalinhado dos outros.
 */
export function BudgetLegendItem({
   label,
   valor,
   dotClass,
   textClass,
   className,
}: BudgetLegendItemProps) {
   return (
      <div
         className={clsx(
            "flex flex-col items-center gap-0.5 text-center",
            textClass,
            className
         )}
      >
         <span className="flex items-center gap-1.5 text-xs leading-4 font-bold tracking-wide uppercase">
            <span
               aria-hidden
               className={clsx("h-2 w-2 shrink-0 rounded-full", dotClass)}
            />
            {label}
         </span>
         <span className="text-sm leading-4 font-semibold tabular-nums">
            {valor}
         </span>
      </div>
   );
}
