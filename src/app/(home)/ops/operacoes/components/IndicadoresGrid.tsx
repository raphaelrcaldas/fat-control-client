import type { ReactNode } from "react";
import {
   TbClockHour4,
   TbRoute,
   TbPlane,
   TbUsersGroup,
   TbUsers,
   TbPackage,
   TbGasStation,
   TbDroplet,
   TbParachute,
   TbPackageExport,
   TbArrowsExchange,
} from "react-icons/tb";
import { minutesToTime } from "@/../utils/dateHandler";
import { KpiCard } from "@/components/ui/KpiCard";
import type { OperacaoKpis } from "services/routes/ops/operacoes";
import type { ContagemCirculo } from "./pessoalAgrupado";

const nf = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

interface Metrica {
   label: string;
   icon: ReactNode;
   /** `null` = o backend não tem o dado. Diferente de zero. */
   value: number | null;
   /** Texto já formatado, para horas. */
   texto?: string;
   unidade?: string;
   apoio?: string;
}

/**
 * Os indicadores da operação.
 *
 * O cartão é o `KpiCard` compartilhado, o mesmo de `estatistica/indicadores`:
 * são o mesmo objeto de leitura — um número do GT com rótulo, unidade e
 * composição — e duas implementações divergiam no ícone, no peso do número e
 * no espaçamento. O que é próprio daqui não é o cartão, é quais métricas
 * entram e o que fazer com as que vieram zero.
 *
 * Todos os cartões têm o mesmo peso: a grade é um painel de leitura, e o
 * dossiê já diz de quem é a operação no cabeçalho.
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
   circulos,
}: {
   kpis: OperacaoKpis;
   efetivo?: number;
   /** Composição do efetivo por círculo, para o apoio do cartão. */
   circulos?: ContagemCirculo[];
}) {
   const lancadas =
      kpis.heavy_qtd == null || kpis.cds_qtd == null
         ? null
         : kpis.heavy_qtd + kpis.cds_qtd;

   const metricas: Metrica[] = [
      {
         label: "Horas voadas",
         icon: <TbClockHour4 className="h-5 w-5" />,
         value: kpis.horas,
         texto: minutesToTime(kpis.horas),
      },
      {
         label: "Etapas",
         icon: <TbRoute className="h-5 w-5" />,
         value: kpis.etapas,
         apoio:
            kpis.missoes > 0 ? `${nf.format(kpis.missoes)} missões` : undefined,
      },
      {
         label: "Aeronaves",
         icon: <TbPlane className="h-5 w-5" />,
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
         ? [
              {
                 label: "Efetivo",
                 icon: <TbUsersGroup className="h-5 w-5" />,
                 value: efetivo,
                 // A composição por círculo cabe no apoio do cartão e responde
                 // "30 militares, mas quantos oficiais?" sem abrir a lista.
                 apoio: circulos?.length
                    ? circulos.map((c) => `${c.total} ${c.label}`).join(" · ")
                    : undefined,
              } as Metrica,
           ]
         : []),
      {
         label: "Pax transportados",
         icon: <TbUsers className="h-5 w-5" />,
         value: kpis.pax,
      },
      {
         label: "Carga transportada",
         icon: <TbPackage className="h-5 w-5" />,
         value: kpis.carga,
         unidade: "kg",
      },
      {
         label: "Combustível consumido",
         icon: <TbGasStation className="h-5 w-5" />,
         value: kpis.comb,
         unidade: "L",
      },
      {
         label: "Lubrificante consumido",
         icon: <TbDroplet className="h-5 w-5" />,
         value: kpis.lub,
         unidade: "L",
      },
      {
         label: "PQDs lançados",
         icon: <TbParachute className="h-5 w-5" />,
         value: kpis.pqd,
      },
      {
         label: "Cargas lançadas",
         icon: <TbPackageExport className="h-5 w-5" />,
         value: lancadas,
         apoio:
            lancadas != null && lancadas > 0 && kpis.peso_lancado != null
               ? `${nf.format(kpis.heavy_qtd)} Heavy / ${nf.format(kpis.cds_qtd)} CDS · ${nf.format(kpis.peso_lancado)} kg`
               : undefined,
      },
      {
         label: "Combustível transferido",
         icon: <TbArrowsExchange className="h-5 w-5" />,
         value: kpis.comb_transf,
         unidade: "L",
      },
   ];

   const visiveis = metricas.filter((m) => m.value == null || m.value > 0);
   const zerados = metricas.filter((m) => m.value === 0);

   return (
      <section aria-label="Indicadores da operação" className="space-y-2">
         <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
            {visiveis.map((m) => (
               <KpiCard
                  key={m.label}
                  icon={m.icon}
                  label={m.label}
                  value={
                     m.value == null ? null : (m.texto ?? nf.format(m.value))
                  }
                  unit={m.unidade}
                  sub={m.apoio}
                  reservaSub
               />
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
