import { useMemo } from "react";
import { MONTH_LABELS } from "../constants";

export interface EsfAerMonthlyRow {
   label: string;
   planejado: number;
   voado: number;
   /** Acumulado voado até o mês; `null` após o último mês com voo. */
   acumulado: number | null;
}

export interface EsfAerMonthly {
   rows: EsfAerMonthlyRow[];
   voadoMax: number;
   lastFlownIndex: number;
}

/**
 * Deriva a série mensal (planejado linear, voado e acumulado) a partir do
 * total alocado e dos minutos voados por mês. Fonte única consumida tanto
 * pelo gráfico quanto pela tabela mensal, evitando divergências.
 */
export function useEsfAerMonthly(
   totalAlocado: number,
   totalMeses: number[]
): EsfAerMonthly {
   return useMemo(() => {
      const monthlyPlan = totalAlocado / 12;

      let lastFlownIndex = -1;
      for (let i = 11; i >= 0; i--) {
         if (totalMeses[i] > 0) {
            lastFlownIndex = i;
            break;
         }
      }

      let accum = 0;
      let voadoMax = 0;
      const rows = MONTH_LABELS.map((label, i) => {
         const voado = totalMeses[i];
         accum += voado;
         if (voado > voadoMax) voadoMax = voado;
         return {
            label,
            planejado: Math.round(monthlyPlan * (i + 1)),
            voado,
            acumulado: i <= lastFlownIndex ? accum : null,
         };
      });

      return { rows, voadoMax, lastFlownIndex };
   }, [totalAlocado, totalMeses]);
}
