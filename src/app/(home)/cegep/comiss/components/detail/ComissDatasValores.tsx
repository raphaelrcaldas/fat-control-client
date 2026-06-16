"use client";

import { useMemo } from "react";
import { isoStrToDate } from "utils/dateHandler";
import { realCurrency } from "utils/financeiro";
import { ComissWithMiss } from "services/routes/cegep/comiss";

export function ComissDatasValores({ comiss }: { comiss: ComissWithMiss }) {
   const { dataAbertura, dataFechamento } = useMemo(
      () => ({
         dataAbertura: isoStrToDate(comiss.data_ab).toLocaleDateString(
            "pt-br",
            {
               day: "2-digit",
               month: "2-digit",
               year: "2-digit",
            }
         ),
         dataFechamento: isoStrToDate(comiss.data_fc).toLocaleDateString(
            "pt-br",
            { day: "2-digit", month: "2-digit", year: "2-digit" }
         ),
      }),
      [comiss.data_ab, comiss.data_fc]
   );

   return (
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
         <PeriodoCard
            borderClass="border-emerald-200"
            dotClass="bg-emerald-500"
            titleClass="text-emerald-800"
            titulo="Abertura"
            data={dataAbertura}
            dataLabel="Data"
            qtd={comiss.qtd_aj_ab}
            valor={comiss.valor_aj_ab}
         />
         <PeriodoCard
            borderClass="border-orange-200"
            dotClass="bg-orange-500"
            titleClass="text-orange-800"
            titulo="Fechamento"
            data={dataFechamento}
            dataLabel="Data Prevista"
            qtd={comiss.qtd_aj_fc}
            valor={comiss.valor_aj_fc}
         />
      </div>
   );
}

interface PeriodoCardProps {
   borderClass: string;
   dotClass: string;
   titleClass: string;
   titulo: string;
   data: string;
   dataLabel: string;
   qtd: number;
   valor: number;
}

function PeriodoCard({
   borderClass,
   dotClass,
   titleClass,
   titulo,
   data,
   dataLabel,
   qtd,
   valor,
}: PeriodoCardProps) {
   return (
      <div className={`rounded border ${borderClass} bg-white p-4 shadow-sm`}>
         <h4
            className={`mb-1 flex items-center gap-2 text-sm font-semibold ${titleClass}`}
         >
            <div className={`h-2 w-2 rounded-full ${dotClass}`} />
            {titulo}
         </h4>
         <div className="grid grid-cols-3 gap-4">
            <Stat valor={data} label={dataLabel} />
            <Stat valor={Number(qtd).toFixed(1)} label="Ajuda de Custo" />
            <Stat valor={realCurrency(valor)} label="Valor" />
         </div>
      </div>
   );
}

function Stat({ valor, label }: { valor: string; label: string }) {
   return (
      <div className="text-center">
         <span className="block text-base font-semibold text-gray-900">
            {valor}
         </span>
         <span className="text-xs text-gray-500">{label}</span>
      </div>
   );
}
