import { useMemo } from "react";
import { getGroupColor, TOTAL_COLOR } from "../constants";
import { ultimoDelta } from "../utils";
import type { CarryForward } from "./useCarryForward";
import type { HistoricoVisibility } from "./useHistoricoSeries";
import type { EsfAerHistorico } from "services/routes/estatistica/esfAer";

/** Teto de leituras de esforço — o excedente vira contagem. */
const MAX_READOUTS = 4;

/** Uma linha de leitura: o que o cabeçalho do gráfico mostra por série. */
export interface Readout {
   /** Chave estável de render (id do esforço, nome do grupo ou "total"). */
   key: string;
   label: string;
   color: string;
   /** Alocado vigente, em MINUTOS. */
   atual: number;
   /** Último Δ da série, em MINUTOS. */
   delta: number;
   /** Série tracejada no gráfico (Σ de grupo). */
   dashed?: boolean;
}

export interface ChartReadouts {
   /** Leituras a exibir, na ordem das séries: Total → Σ grupos → esforços. */
   readouts: Readout[];
   /** Esforços ligados que não couberam no teto (0 = nenhum). */
   excedente: number;
}

/**
 * Deriva a leitura do cabeçalho do gráfico — valor e Δ de cada série ATIVA.
 *
 * Espelha `useHistoricoSeries`: mesma ordem e as mesmas regras de visibilidade
 * (no modo isolado só o isolado aparece, e os Σ de grupo saem de cena). Todo Δ
 * passa por `ultimoDelta`, de modo que rail, tooltip e leitura mostrem sempre
 * o mesmo número para a mesma série.
 */
export function useChartReadouts(
   historico: EsfAerHistorico,
   visibility: HistoricoVisibility,
   carry: CarryForward,
   programColors: Map<number, string>
): ChartReadouts {
   const { totalVisible, groups, toggled, isolated } = visibility;

   return useMemo(() => {
      const readouts: Readout[] = [];

      if (totalVisible) {
         readouts.push({
            key: "total",
            label: "Total da unidade",
            color: TOTAL_COLOR,
            atual: historico.total.atual,
            delta: ultimoDelta(historico.total.timeline),
         });
      }

      if (isolated === null) {
         for (const grupo of carry.grupos) {
            if (!groups[grupo]) continue;
            readouts.push({
               key: `grupo:${grupo}`,
               label: `Σ ${grupo}`,
               color: getGroupColor(grupo),
               atual: carry.somaAtualPorGrupo[grupo] ?? 0,
               delta: ultimoDelta(carry.porGrupo[grupo] ?? []),
               dashed: true,
            });
         }
      }

      // Esforços: só o isolado no modo isolado; senão os ligados no rail.
      const esforcos = historico.programas.filter((p) =>
         isolated !== null
            ? p.esfaer_id === isolated
            : toggled[p.esfaer_id] === true
      );

      // Teto só para a lista de esforços: além dele a faixa viraria uma lista
      // e roubaria a altura do gráfico, que é o conteúdo da tela.
      const excedente = Math.max(0, esforcos.length - MAX_READOUTS);

      for (const p of esforcos.slice(0, MAX_READOUTS)) {
         readouts.push({
            key: `esforco:${p.esfaer_id}`,
            label: p.nome,
            color: programColors.get(p.esfaer_id) ?? getGroupColor(p.grupo),
            atual: p.atual,
            delta: ultimoDelta(p.timeline),
         });
      }

      return { readouts, excedente };
   }, [
      historico,
      carry,
      programColors,
      totalVisible,
      groups,
      toggled,
      isolated,
   ]);
}
