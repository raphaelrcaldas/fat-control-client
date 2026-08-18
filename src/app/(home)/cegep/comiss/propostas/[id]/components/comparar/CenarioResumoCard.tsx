import clsx from "clsx";
import { realCurrency } from "utils/financeiro";
import type { CenarioCor } from "../../cenarioPalette";
import type { ImpactoFY, PlanoStats } from "../../propostaCalc";
import {
   BudgetBar,
   type BudgetSegment,
} from "../../../../components/BudgetBar";

interface CenarioResumoCardProps {
   codigo: string;
   nome: string;
   cor: CenarioCor;
   militares: number;
   impacto: ImpactoFY;
   stats: PlanoStats | undefined;
   /** Quanto do cenário só recai sobre o exercício seguinte. */
   transbordo: number;
   ano: number;
   /** Diferença de custo para o cenário mais barato (0 no próprio). */
   delta: number;
   maisBarato: boolean;
   /** Cenário aberto na tela de trás — ancora quem está comparando. */
   ativo: boolean;
}

/**
 * Um cenário como cartão comparável. Mesma anatomia do `PlanoMetricCard` do
 * sandbox — espinha na cor do cenário, número grande e `BudgetBar` — para que
 * a leitura no modal seja a mesma leitura da tela de trás.
 *
 * O número grande aqui é o **custo do cenário no exercício**, não o projetado:
 * o modal existe para escolher entre cenários, e é esse valor que os separa. O
 * projetado aparece na barra, que continua medindo o teto.
 */
export function CenarioResumoCard({
   codigo,
   nome,
   cor,
   militares,
   impacto,
   stats,
   transbordo,
   ano,
   delta,
   maisBarato,
   ativo,
}: CenarioResumoCardProps) {
   const semTeto = stats?.semTeto ?? true;
   const excede = stats?.excedeTeto ?? false;

   // Pago e previsto são o MESMO consolidado nos três cartões: entram na barra
   // (a escala depende deles) mas ficam fora da legenda, que repetiria o mesmo
   // par de valores lado a lado. O total consolidado é dito uma vez, na faixa
   // de contexto do modal.
   const segments: BudgetSegment[] = [
      {
         id: "pago",
         label: "Pago",
         value: stats?.pago ?? 0,
         barClass: "bg-green-500",
         dotClass: "bg-green-500",
         textClass: "text-green-700",
         omitirLegenda: true,
      },
   ];
   if ((stats?.previsto ?? 0) > 0) {
      segments.push({
         id: "previsto",
         label: "Previsto",
         value: stats?.previsto ?? 0,
         barClass: "bg-yellow-400",
         dotClass: "bg-yellow-400",
         textClass: "text-yellow-700",
         omitirLegenda: true,
      });
   }
   segments.push({
      id: "cenario",
      label: nome,
      value: impacto.total,
      barClass: cor.barSegment,
      dotClass: cor.dot,
      textClass: cor.text,
      omitirLegenda: true,
      simulado: true,
   });

   return (
      <div
         className={clsx(
            "relative flex flex-col overflow-hidden rounded border bg-white p-4 shadow-sm",
            // O cartão do cenário aberto na tela de trás ganha o anel que a
            // paleta já reserva para "cartão selecionado" — sem badge, que
            // disputaria espaço com "menor custo" e "excede o teto".
            ativo
               ? clsx("border-transparent ring-2", cor.ring)
               : "border-slate-200"
         )}
      >
         <span
            aria-hidden
            className={clsx("absolute top-0 left-0 h-full w-1", cor.barSegment)}
         />

         <div className="flex items-start justify-between gap-2">
            <span className="flex min-w-0 items-center gap-2">
               <span
                  aria-hidden
                  className={clsx(
                     "grid h-6 w-6 shrink-0 place-items-center rounded-md text-xs font-bold text-white",
                     cor.barSegment
                  )}
               >
                  {codigo}
               </span>
               <span className="truncate font-semibold text-slate-900">
                  {nome}
               </span>
            </span>

            {maisBarato && (
               <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] leading-4 font-bold tracking-wide text-slate-600 uppercase">
                  Menor custo
               </span>
            )}
            {excede && (
               <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[10px] leading-4 font-bold tracking-wide text-red-700 uppercase">
                  Excede o teto
               </span>
            )}
         </div>

         <div className="mt-3 flex flex-wrap items-baseline gap-x-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
               {realCurrency(impacto.total)}
            </span>
            {/* Delta contra o mais barato: é a pergunta do modal — "quanto
                custa a mais escolher este?". No próprio mais barato não há o
                que dizer. */}
            {!maisBarato && delta > 0 && (
               <span className="text-sm font-semibold text-slate-500 tabular-nums">
                  +{realCurrency(delta)}
               </span>
            )}
         </div>

         <p className="mt-0.5 mb-3 text-sm text-slate-500">
            em {ano} ·{" "}
            <span className="tabular-nums">
               {militares} {militares === 1 ? "militar" : "militares"}
            </span>
            {!semTeto && (
               <>
                  {" · "}
                  <span
                     className={clsx(
                        "font-semibold tabular-nums",
                        excede ? "text-red-600" : "text-slate-600"
                     )}
                  >
                     {stats?.pctProjetado}% do teto
                  </span>
               </>
            )}
         </p>

         <div className="mt-auto">
            <BudgetBar
               total={
                  semTeto ? (stats?.projetado ?? 0) : (stats?.orcamento ?? 0)
               }
               segments={segments}
               remainder={
                  semTeto
                     ? undefined
                     : {
                          label: excede ? "Excedido" : "Disponível",
                          value: stats?.disponivel ?? 0,
                          dotClass: excede ? "bg-red-500" : "bg-blue-500",
                          textClass: excede ? "text-red-700" : "text-blue-700",
                       }
               }
            />

            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 border-t border-slate-100 pt-2 text-xs">
               <Par
                  rotulo="Aberturas"
                  valor={realCurrency(impacto.aberturas)}
               />
               <Par
                  rotulo="Fechamentos"
                  valor={realCurrency(impacto.fechamentos)}
               />
               {transbordo > 0 && (
                  <div className="col-span-2 flex items-baseline justify-between">
                     <dt className="text-slate-500">Transborda p/ {ano + 1}</dt>
                     <dd className="font-medium text-slate-700 tabular-nums">
                        {realCurrency(transbordo)}
                     </dd>
                  </div>
               )}
            </dl>
         </div>
      </div>
   );
}

function Par({ rotulo, valor }: { rotulo: string; valor: string }) {
   return (
      <div className="flex items-baseline justify-between gap-1">
         <dt className="text-slate-500">{rotulo}</dt>
         <dd className="font-medium text-slate-700 tabular-nums">{valor}</dd>
      </div>
   );
}
