import { realCurrency } from "utils/financeiro";
import type { ComissSummaryStats } from "services/routes/cegep/comiss";

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

   const pct = (v: number) =>
      orcamento > 0 ? Math.round((v / orcamento) * 100) : 0;
   // Clamp em [0, 100] para as barras não estourarem o trilho quando o
   // consumido/previsto ultrapassa o orçamento.
   const width = (v: number) =>
      orcamento > 0 ? Math.min(100, Math.max(0, (v / orcamento) * 100)) : 0;
   const disponivel = orcamento - soma - previsao;
   const excedido = disponivel < 0;

   return (
      <div className="rounded border border-slate-200 bg-white p-5 shadow-sm">
         <div className="mb-2 flex items-start justify-between">
            <span className="block text-xs font-bold tracking-wider text-slate-500 uppercase">
               {label}
            </span>
            <span className="text-slate-400">{icon}</span>
         </div>

         <div className="mb-4 text-3xl font-bold text-slate-900">
            {realCurrency(orcamento)}
         </div>

         <div className="mb-1 flex justify-between text-sm text-slate-500">
            <span>{temPrevisao ? "Consumido / Previsto" : "Consumido"}</span>
            <div className="flex gap-1 font-semibold text-slate-700">
               <span className="text-green-600">{pct(soma)}%</span>
               {temPrevisao && (
                  <span className="text-yellow-500">{pct(previsao)}%</span>
               )}
            </div>
         </div>

         <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
               className="h-full rounded-l-full bg-green-500"
               style={{ width: `${width(soma)}%` }}
            />
            {temPrevisao && (
               <div
                  className="h-full bg-yellow-400"
                  style={{ width: `${width(previsao)}%` }}
               />
            )}
         </div>

         <div className="mt-3 flex gap-4 text-[10px] font-bold tracking-wide uppercase">
            <LegendItem dotClass="bg-green-500" textClass="text-green-700">
               Pago {realCurrency(soma)}
            </LegendItem>
            {temPrevisao && (
               <LegendItem dotClass="bg-yellow-400" textClass="text-yellow-700">
                  Previsto {realCurrency(previsao)}
               </LegendItem>
            )}
            <LegendItem
               dotClass={excedido ? "bg-red-500" : "bg-blue-500"}
               textClass={excedido ? "text-red-700" : "text-blue-700"}
               className="ml-auto"
            >
               {excedido ? "Excedido" : "Disponível"}{" "}
               {realCurrency(Math.abs(disponivel))}
            </LegendItem>
         </div>
      </div>
   );
}

function LegendItem({
   dotClass,
   textClass,
   className = "",
   children,
}: {
   dotClass: string;
   textClass: string;
   className?: string;
   children: React.ReactNode;
}) {
   return (
      <div className={`flex items-center gap-1.5 ${textClass} ${className}`}>
         <span className={`h-2 w-2 rounded-full ${dotClass}`} />
         {children}
      </div>
   );
}
