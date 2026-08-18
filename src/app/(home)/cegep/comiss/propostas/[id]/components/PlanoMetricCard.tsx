import clsx from "clsx";
import { realCurrency } from "utils/financeiro";
import type { CenarioCor } from "../cenarioPalette";
import type { PlanoStats } from "../propostaCalc";
import { BudgetBar, type BudgetSegment } from "../../../components/BudgetBar";

interface PlanoMetricCardProps {
   label: string;
   icon: React.ReactNode;
   stats: PlanoStats;
   /** Cor do cenário ativo — pinta o segmento do rascunho. */
   cor: CenarioCor;
   /** Nome do cenário ativo, para a legenda do segmento de rascunho. */
   cenarioNome: string;
   /**
    * Primeira carga do consolidado: nada foi confirmado ainda, então o cartão
    * não pode afirmar valor nem ausência de teto.
    */
   isLoading?: boolean;
}

/**
 * KPI do exercício sob a ótica da proposta. O número grande é o **total
 * projetado** (consolidado real + rascunho) — é ele que muda quando se mexe no
 * cenário; o teto entra como referência secundária.
 */
export function PlanoMetricCard({
   label,
   icon,
   stats,
   cor,
   cenarioNome,
   isLoading = false,
}: PlanoMetricCardProps) {
   const { orcamento, pago, previsto, rascunho, projetado, disponivel } = stats;

   // Tons espelhados do `GestaoFiscalCard`: as duas telas leem o mesmo
   // orçamento, então verde/amarelo/azul têm que significar o mesmo em ambas.
   const segments: BudgetSegment[] = [
      {
         id: "pago",
         label: "Pago",
         value: pago,
         barClass: "bg-green-500",
         dotClass: "bg-green-500",
         textClass: "text-green-700",
      },
   ];

   // Mesma regra do `GestaoFiscalCard`: legenda "PREVISTO R$ 0,00" mente —
   // Aberturas não tem previsão. As duas telas compartilham a barra, então
   // compartilham também a regra.
   if (previsto > 0) {
      segments.push({
         id: "previsto",
         label: "Previsto",
         value: previsto,
         barClass: "bg-yellow-400",
         dotClass: "bg-yellow-400",
         textClass: "text-yellow-700",
      });
   }

   segments.push({
      id: "cenario",
      // Fora da legenda: o valor já aparece no chip ao lado do número grande,
      // e a cor do chip é a mesma do segmento.
      label: cenarioNome,
      value: rascunho,
      barClass: cor.barSegment,
      dotClass: cor.dot,
      textClass: cor.text,
      omitirLegenda: true,
      // O que a proposta acrescentaria ao exercício ainda é simulação: entra
      // listrado e pulsando, como o trecho sandbox da Calculadora.
      simulado: true,
   });

   return (
      <div className="rounded border border-slate-200 bg-white p-5 shadow-sm">
         <div className="mb-2 flex items-start justify-between">
            <span className="block text-xs leading-4 font-bold tracking-wider text-slate-500 uppercase">
               {label}
            </span>
            <span aria-hidden className="text-slate-400">
               {icon}
            </span>
         </div>

         {isLoading ? (
            <CarregandoStats />
         ) : (
            <>
               <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span
                     title="Projetado: consolidado do exercício + rascunho"
                     className={clsx(
                        "text-3xl font-bold tabular-nums",
                        stats.excedeTeto ? "text-red-600" : "text-slate-900"
                     )}
                  >
                     {realCurrency(projetado)}
                  </span>
                  {rascunho !== 0 && (
                     <span
                        title={`Impacto do cenário ${cenarioNome}`}
                        className={clsx(
                           "inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-xs leading-4 font-semibold tabular-nums",
                           cor.soft,
                           cor.text
                        )}
                     >
                        {/* Amarra o chip ao segmento da barra — que perdeu a
                            legenda para não repetir este mesmo valor. */}
                        <span
                           aria-hidden
                           className={clsx("h-2 w-2 rounded-full", cor.dot)}
                        />
                        {rascunho > 0 ? "+" : ""}
                        {realCurrency(rascunho)}
                        <span className="sr-only"> de {cenarioNome}</span>
                     </span>
                  )}
               </div>

               {/* Sem teto some só o que depende dele (o "de R$ X" e o
                   percentual); a composição do projetado continua — é ela que
                   diz quanto o exercício já tem comprometido. */}
               <div className="mt-1 mb-4 flex flex-wrap items-baseline justify-between gap-x-2 text-sm">
                  <span className="text-slate-500 tabular-nums">
                     {stats.semTeto
                        ? "Comprometido"
                        : `de ${realCurrency(orcamento)}`}
                  </span>
                  {!stats.semTeto && (
                     <span
                        className={clsx(
                           "font-semibold tabular-nums",
                           stats.excedeTeto ? "text-red-600" : "text-slate-700"
                        )}
                     >
                        {stats.pctProjetado}% do teto
                     </span>
                  )}
               </div>

               {/* Sem teto a escala da barra é o próprio projetado: ela passa a
                   mostrar a COMPOSIÇÃO, não consumo de uma cota. */}
               <BudgetBar
                  total={stats.semTeto ? projetado : orcamento}
                  segments={segments}
                  remainder={
                     stats.semTeto
                        ? undefined
                        : {
                             label: stats.excedeTeto
                                ? "Excedido"
                                : "Disponível",
                             value: disponivel,
                             dotClass: stats.excedeTeto
                                ? "bg-red-500"
                                : "bg-blue-500",
                             textClass: stats.excedeTeto
                                ? "text-red-700"
                                : "text-blue-700",
                          }
                  }
               />
            </>
         )}
      </div>
   );
}

/**
 * Consolidado ainda em voo. Barra neutra no lugar dos números — sem texto de
 * vazio, que aqui viraria a afirmação falsa "sem teto cadastrado".
 */
function CarregandoStats() {
   return (
      <div className="space-y-3">
         <div className="h-8 w-40 animate-pulse rounded bg-slate-200" />
         <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
         <div className="h-2.5 w-full animate-pulse rounded-full bg-slate-100" />
      </div>
   );
}
