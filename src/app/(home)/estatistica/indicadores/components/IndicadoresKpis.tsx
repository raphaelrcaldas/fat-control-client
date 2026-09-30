"use client";

import {
   TbClockHour4,
   TbRoute,
   TbPackage,
   TbUsers,
   TbGasStation,
   TbDroplet,
   TbParachute,
   TbArrowsExchange,
   TbPackageExport,
} from "react-icons/tb";
import { minutesToTime } from "@/../utils/dateHandler";
import type {
   Metricas,
   PqdTipoLinha,
   LancamentoLinha,
} from "services/routes/estatistica/indicadores";
import { LANCAMENTO_LABELS } from "../constants";
import { fmtInt, fmtDec, kgToT } from "../utils";
import { KpiCard } from "@/components/ui/KpiCard";

interface IndicadoresKpisProps {
   totais: Metricas;
   isLoading?: boolean;
   pqdPorTipo: PqdTipoLinha[];
   lancamentos: LancamentoLinha[];
}

export function IndicadoresKpis({
   totais,
   pqdPorTipo,
   lancamentos,
   isLoading = false,
}: IndicadoresKpisProps) {
   const totalLancado = totais.heavy_qtd + totais.cds_qtd;
   const loadingSub = isLoading ? (
      <span className="block h-4 w-32 max-w-full animate-pulse rounded bg-slate-100" />
   ) : undefined;

   // Subtextos qualitativos: a composição é o que diferencia estes KPIs
   // de um relatório genérico de horas voadas.
   const pqdSub =
      pqdPorTipo.length > 0
         ? pqdPorTipo.map((p) => `${p.tipo} ${fmtInt(p.qtd)}`).join(" · ")
         : "Nenhum lançamento no ano";

   const lancSub =
      lancamentos.length > 0
         ? lancamentos
              .map(
                 (l) =>
                    `${LANCAMENTO_LABELS[l.tipo] ?? l.tipo} ${fmtInt(l.qtd)}`
              )
              .join(" · ")
         : "Nenhuma carga lançada no ano";

   return (
      <div className="space-y-2">
         <div className="space-y-2">
            {/* Os quatro números que respondem "voamos o quanto devíamos e
             transportamos o quanto prometemos?" */}
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
               <KpiCard
                  isLoading={isLoading}
                  icon={<TbClockHour4 className="h-5 w-5" />}
                  label="Horas Voadas"
                  value={minutesToTime(totais.tvoo)}
                  sub={loadingSub ?? "Tempo de voo total no ano"}
               />
               <KpiCard
                  isLoading={isLoading}
                  icon={<TbRoute className="h-5 w-5" />}
                  label="Etapas"
                  value={fmtInt(totais.etapas)}
                  sub={
                     loadingSub ?? `${fmtInt(totais.pousos)} pousos registrados`
                  }
               />
               <KpiCard
                  isLoading={isLoading}
                  icon={<TbPackage className="h-5 w-5" />}
                  label="Carga Transportada"
                  value={kgToT(totais.carga)}
                  unit="t"
                  sub={loadingSub ?? `${fmtInt(totais.carga)} kg`}
               />
               <KpiCard
                  isLoading={isLoading}
                  icon={<TbUsers className="h-5 w-5" />}
                  label="Passageiros"
                  value={fmtInt(totais.pax)}
                  sub={loadingSub ?? "PAX transportados no ano"}
               />
            </div>

            {/* Indicadores operacionais — o trabalho específico do GT. */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
               <KpiCard
                  isLoading={isLoading}
                  size="md"
                  icon={<TbGasStation className="h-5 w-5" />}
                  label="Combustível"
                  value={fmtInt(totais.comb)}
                  unit="L"
                  sub={loadingSub ?? "Consumido nas etapas"}
               />
               <KpiCard
                  isLoading={isLoading}
                  size="md"
                  icon={<TbDroplet className="h-5 w-5" />}
                  label="Lubrificante"
                  value={fmtDec(totais.lub)}
                  unit="L"
                  sub={loadingSub ?? "Reposto nas etapas"}
               />
               <KpiCard
                  isLoading={isLoading}
                  size="md"
                  icon={<TbParachute className="h-5 w-5" />}
                  label="PQD Lançados"
                  value={fmtInt(totais.pqd)}
                  sub={loadingSub ?? pqdSub}
               />
               <KpiCard
                  isLoading={isLoading}
                  size="md"
                  icon={<TbArrowsExchange className="h-5 w-5" />}
                  label="Comb. Transferido"
                  value={fmtInt(totais.comb_transf)}
                  unit="L"
                  sub={loadingSub ?? "Reabastecimento em voo (REVO)"}
               />
               <KpiCard
                  isLoading={isLoading}
                  size="md"
                  icon={<TbPackageExport className="h-5 w-5" />}
                  label="Cargas Lançadas"
                  value={fmtInt(totalLancado)}
                  sub={
                     loadingSub ??
                     `${lancSub} · ${fmtInt(totais.peso_lancado)} kg`
                  }
               />
            </div>
         </div>
      </div>
   );
}
