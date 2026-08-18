import { realCurrency } from "utils/financeiro";
import type { ComissSummaryStats } from "services/routes/cegep/comiss";
import { BudgetBar, type BudgetSegment } from "./BudgetBar";

interface GestaoFiscalCardProps {
   label: string;
   icon: React.ReactNode;
   stats: ComissSummaryStats;
}

/**
 * Card de KPI orçamentário (Total / Fechamentos / Aberturas). A cota de
 * "Previsto" (amarelo) só aparece quando há `previsao` — Aberturas, por
 * exemplo, não tem previsão.
 */
export function GestaoFiscalCard({
   label,
   icon,
   stats,
}: GestaoFiscalCardProps) {
   const { orcamento, soma, previsao = 0 } = stats;
   const temPrevisao = previsao > 0;

   // Exercício sem teto cadastrado ainda tem o que mostrar: o que já foi pago
   // e o que está previsto existem independentemente do orçamento. Some só o
   // que depende do teto — percentuais e "Disponível".
   const semTeto = orcamento <= 0;
   const comprometido = soma + previsao;

   const pct = (v: number) =>
      orcamento > 0 ? Math.round((v / orcamento) * 100) : 0;
   const disponivel = orcamento - soma - previsao;
   const excedido = disponivel < 0;

   // "Previsto" só entra quando existe: Aberturas não tem previsão, e um
   // segmento zerado deixaria uma legenda "PREVISTO R$ 0,00" mentindo.
   const segments: BudgetSegment[] = [
      {
         id: "pago",
         label: "Pago",
         value: soma,
         barClass: "bg-green-500",
         dotClass: "bg-green-500",
         textClass: "text-green-700",
      },
   ];
   if (temPrevisao) {
      segments.push({
         id: "previsto",
         label: "Previsto",
         value: previsao,
         barClass: "bg-yellow-400",
         dotClass: "bg-yellow-400",
         textClass: "text-yellow-700",
      });
   }

   return (
      <div className="rounded border border-slate-200 bg-white p-5 shadow-sm">
         <div className="mb-2 flex items-start justify-between">
            <span className="block text-xs font-bold tracking-wider text-slate-500 uppercase">
               {label}
            </span>
            <span className="text-slate-400">{icon}</span>
         </div>

         {/* Sem teto o número grande passa a ser o comprometido: exibir o teto
             zerado como destaque seria dizer que o exercício não tem nada. */}
         <div className="mb-4 text-3xl font-bold text-slate-900">
            {realCurrency(semTeto ? comprometido : orcamento)}
         </div>

         <div className="mb-1 flex justify-between text-sm text-slate-500">
            <span>
               {semTeto
                  ? "Comprometido"
                  : temPrevisao
                    ? "Consumido / Previsto"
                    : "Consumido"}
            </span>
            {!semTeto && (
               <div className="flex gap-1 font-semibold text-slate-700 tabular-nums">
                  <span className="text-green-700">{pct(soma)}%</span>
                  {temPrevisao && (
                     <span className="text-yellow-600">{pct(previsao)}%</span>
                  )}
               </div>
            )}
         </div>

         {/* Sem teto a escala da barra é o próprio comprometido: ela mostra a
             COMPOSIÇÃO (pago × previsto), não consumo de uma cota. */}
         <BudgetBar
            total={semTeto ? comprometido : orcamento}
            segments={segments}
            remainder={
               semTeto
                  ? undefined
                  : {
                       label: excedido ? "Excedido" : "Disponível",
                       value: disponivel,
                       dotClass: excedido ? "bg-red-500" : "bg-blue-500",
                       textClass: excedido ? "text-red-700" : "text-blue-700",
                    }
            }
         />
      </div>
   );
}
