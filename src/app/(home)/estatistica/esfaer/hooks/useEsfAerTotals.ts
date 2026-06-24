import { useMemo } from "react";
import type { EsfAerResumoItem } from "services/routes/estatistica/esfAer";
import { getGroupSummaries, type GroupSummary } from "../utils";

export interface EsfAerTotals {
   items: EsfAerResumoItem[];
   totalAlocado: number;
   totalVoado: number;
   totalSaldo: number;
   totalMesesVoados: number[];
   groupSummaries: GroupSummary[];
}

/**
 * Filtra os itens (ocultando o simulador "SML" quando desligado) e deriva os
 * totais e os resumos por grupo. Centraliza a lógica de domínio que antes
 * vivia na página.
 */
export function useEsfAerTotals(
   allItems: EsfAerResumoItem[],
   showSimulador: boolean
): EsfAerTotals {
   return useMemo(() => {
      const items = showSimulador
         ? allItems
         : allItems.filter((i) => !i.descricao.includes("SML"));

      const totalMesesVoados = items.reduce(
         (acc, i) => {
            i.meses_voados.forEach((v, idx) => (acc[idx] += v));
            return acc;
         },
         Array(12).fill(0) as number[]
      );

      return {
         items,
         totalAlocado: items.reduce((s, i) => s + i.alocado, 0),
         totalVoado: items.reduce((s, i) => s + i.voado, 0),
         totalSaldo: items.reduce((s, i) => s + i.saldo, 0),
         totalMesesVoados,
         groupSummaries: getGroupSummaries(items),
      };
   }, [allItems, showSimulador]);
}
