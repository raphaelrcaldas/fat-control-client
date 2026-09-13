import {
   TbClockHour4,
   TbRoute,
   TbPlane,
   TbUsers,
   TbWeight,
   TbGasStation,
   TbParachute,
   TbPackageExport,
   TbTransfer,
} from "react-icons/tb";
import { minutesToTime } from "@/../utils/dateHandler";
import type { OperacaoKpis } from "services/routes/ops/operacoes";

const nf = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

export function KpiGrid({ kpis }: { kpis: OperacaoKpis }) {
   const metrics = [
      {
         label: "Horas voadas",
         value: minutesToTime(kpis.horas),
         unit: "h",
         icon: TbClockHour4,
      },
      { label: "Etapas", value: kpis.etapas, icon: TbRoute },
      { label: "Aeronaves", value: kpis.anv, icon: TbPlane },
      { label: "Pax transportados", value: kpis.pax, icon: TbUsers },
      {
         label: "Carga transportada",
         value: kpis.carga,
         unit: "kg",
         icon: TbWeight,
      },
      {
         label: "Combustível consumido",
         value: kpis.comb,
         unit: "L",
         icon: TbGasStation,
      },
      { label: "PQDs lançados", value: kpis.pqd, icon: TbParachute },
      {
         label: "Cargas lançadas",
         value:
            kpis.heavy_qtd == null || kpis.cds_qtd == null
               ? undefined
               : kpis.heavy_qtd + kpis.cds_qtd,
         detail:
            kpis.peso_lancado == null ||
            kpis.heavy_qtd == null ||
            kpis.cds_qtd == null
               ? undefined
               : `${nf.format(kpis.heavy_qtd)} Heavy / ${nf.format(kpis.cds_qtd)} CDS • ${nf.format(kpis.peso_lancado)} kg`,
         icon: TbPackageExport,
      },
      {
         label: "Combustível transferido",
         value: kpis.comb_transf,
         unit: "L",
         icon: TbTransfer,
      },
   ];

   return (
      <section aria-label="Indicadores da operação">
         <dl className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
            {metrics.map(({ label, value, unit, detail, icon: Icon }) => (
               <div
                  key={label}
                  className="relative min-w-0 rounded border border-slate-200 bg-white px-3 py-3 pr-12 shadow-sm sm:px-4 sm:pr-14"
               >
                  <Icon
                     aria-hidden
                     className="text-primary-600 absolute top-1/2 right-3 size-6 -translate-y-1/2 sm:right-4"
                     strokeWidth={1.5}
                  />
                  <dt className="min-h-9 text-sm leading-snug font-medium text-slate-600 sm:min-h-8">
                     {label}
                  </dt>
                  <dd className="flex flex-wrap items-baseline gap-x-1.5 text-2xl leading-tight font-semibold tracking-tight text-slate-900 tabular-nums">
                     {value == null ? (
                        <span className="text-sm font-medium text-slate-500">
                           Indisponível
                        </span>
                     ) : typeof value === "number" ? (
                        nf.format(value)
                     ) : (
                        value
                     )}
                     {unit && value != null && (
                        <span className="text-sm font-medium text-slate-500">
                           {unit}
                        </span>
                     )}
                  </dd>
                  {detail && (
                     <dd className="mt-1 text-xs leading-relaxed text-slate-600">
                        {detail}
                     </dd>
                  )}
               </div>
            ))}
         </dl>
      </section>
   );
}
