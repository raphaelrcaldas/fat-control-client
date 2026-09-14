import { minutesToTime } from "@/../utils/dateHandler";
import type { OperacaoKpis } from "services/routes/ops/operacoes";

const nf = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

interface Metrica {
   label: string;
   /** `null` = o backend não tem o dado. Diferente de zero. */
   value: number | null;
   /** Texto já formatado, para horas. */
   texto?: string;
   unidade?: string;
   apoio?: string;
   /** Cartão de destaque (horas voadas). */
   destaque?: boolean;
}

/**
 * Os indicadores da operação.
 *
 * Métrica que veio zero sai da grade e desce para uma faixa: numa operação de
 * transporte, PQD, cargas lançadas e combustível transferido vêm zero, e cinco
 * cartões "0" empurram para baixo justamente o que a operação rendeu. O zero
 * continua legível na faixa — some da grade, não da tela.
 *
 * `null` não desce: "indisponível" é dado que não chegou, e escondê-lo junto
 * com os zeros afirmaria que não houve, que é outra coisa.
 */
export function IndicadoresGrid({
   kpis,
   efetivo,
}: {
   kpis: OperacaoKpis;
   efetivo?: number;
}) {
   const lancadas =
      kpis.heavy_qtd == null || kpis.cds_qtd == null
         ? null
         : kpis.heavy_qtd + kpis.cds_qtd;

   const metricas: Metrica[] = [
      {
         label: "Horas voadas",
         value: kpis.horas,
         texto: minutesToTime(kpis.horas),
         destaque: true,
      },
      {
         label: "Etapas",
         value: kpis.etapas,
         apoio:
            kpis.missoes > 0 ? `${nf.format(kpis.missoes)} missões` : undefined,
      },
      {
         label: "Aeronaves",
         value: kpis.anv,
         apoio:
            kpis.modelos > 0
               ? `${kpis.modelos} ${kpis.modelos === 1 ? "modelo" : "modelos"}`
               : undefined,
      },
      // Efetivo entra junto de etapas e aeronaves: é dimensão da operação,
      // como elas, e não produção de voo. No fim da lista ele sobrava sozinho
      // numa terceira fileira de quatro colunas.
      ...(efetivo !== undefined
         ? [{ label: "Efetivo", value: efetivo } as Metrica]
         : []),
      { label: "Pax transportados", value: kpis.pax },
      { label: "Carga transportada", value: kpis.carga, unidade: "kg" },
      { label: "Combustível consumido", value: kpis.comb, unidade: "L" },
      { label: "PQDs lançados", value: kpis.pqd },
      {
         label: "Cargas lançadas",
         value: lancadas,
         apoio:
            lancadas != null && lancadas > 0 && kpis.peso_lancado != null
               ? `${nf.format(kpis.heavy_qtd)} Heavy / ${nf.format(kpis.cds_qtd)} CDS · ${nf.format(kpis.peso_lancado)} kg`
               : undefined,
      },
      {
         label: "Combustível transferido",
         value: kpis.comb_transf,
         unidade: "L",
      },
   ];

   const visiveis = metricas.filter((m) => m.value == null || m.value > 0);
   const zerados = metricas.filter((m) => m.value === 0);

   return (
      <section aria-label="Indicadores da operação" className="space-y-2">
         {/* Cada cartão é uma `dl` própria em vez de todos dentro de uma só:
             `div` como filho direto de `dl` reprova `definition-list` no axe,
             e o cartão precisa do wrapper para a borda e o layout. */}
         <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
            {visiveis.map((m) => (
               <dl
                  key={m.label}
                  className={`flex min-w-0 flex-col rounded border px-3 py-2.5 shadow-sm ${
                     m.destaque
                        ? "border-slate-950 bg-slate-950"
                        : "border-slate-200 bg-white"
                  }`}
               >
                  <dt
                     className={`truncate text-xs ${m.destaque ? "text-slate-400" : "text-slate-600"}`}
                  >
                     {m.label}
                  </dt>
                  <dd
                     className={`flex flex-wrap items-baseline gap-x-1.5 leading-tight font-semibold tracking-tight tabular-nums ${
                        m.destaque
                           ? "text-[28px] text-white"
                           : "text-2xl text-slate-900"
                     }`}
                  >
                     {m.value == null ? (
                        <span className="text-sm font-medium text-slate-500 italic">
                           Indisponível
                        </span>
                     ) : (
                        (m.texto ?? nf.format(m.value))
                     )}
                     {m.unidade && m.value != null && (
                        <span className="text-sm font-medium text-slate-500">
                           {m.unidade}
                        </span>
                     )}
                  </dd>
                  {/* Slot fixo: sem ele, cartões com e sem apoio têm alturas
                      diferentes e a segunda fileira desalinha da primeira. */}
                  <dd className="mt-1 min-h-4 text-[11px] leading-4 text-slate-500">
                     {m.apoio && <span className="truncate">{m.apoio}</span>}
                  </dd>
               </dl>
            ))}
         </div>

         {zerados.length > 0 && (
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-600">
               <span className="font-semibold text-slate-700">
                  Sem registro nesta operação:
               </span>
               {zerados.map((m) => (
                  <span
                     key={m.label}
                     className="rounded bg-slate-100 px-1.5 py-0.5"
                  >
                     {m.label}
                  </span>
               ))}
            </p>
         )}
      </section>
   );
}
