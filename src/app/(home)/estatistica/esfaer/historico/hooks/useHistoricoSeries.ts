import { useMemo } from "react";
import { getGroupColor, TOTAL_COLOR } from "../constants";
import {
   buildChangeMeta,
   toApexData,
   type ApexSeries,
   type ChangeMeta,
} from "../utils";
import type { CarryForward } from "./useCarryForward";
import type {
   EsfAerHistorico,
   HistPoint,
} from "services/routes/estatistica/esfAer";

/**
 * Descritor de visibilidade vindo do estado da página. `series`/`colors`/etc. são
 * recomputados a partir dele.
 */
export interface HistoricoVisibility {
   /** Total visível — respeitado também no modo isolado (não é forçado ON). */
   totalVisible: boolean;
   /** Visibilidade de cada série Σ por grupo (ausente = oculto). */
   groups: Record<string, boolean>;
   /** Visibilidade por programa (`esfaer_id → visível`; ausente = OCULTO). */
   toggled: Record<number, boolean>;
   /** Quando preenchido, mostra só Total + este programa. */
   isolated: number | null;
}

/**
 * Arrays POSICIONAIS em lockstep para o ApexCharts. `series[i]` corresponde a
 * `colors[i]`, `dashArray[i]`, `widths[i]`, `markerSizes[i]` e `meta[i]`
 * (`meta[i][j]` ↔ `series[i].data[j]`) — nomes de série NÃO são chave de nada
 * (podem colidir entre programas homônimos).
 */
export interface HistoricoSeries {
   series: ApexSeries[];
   colors: string[];
   dashArray: number[];
   widths: number[];
   markerSizes: number[];
   meta: ChangeMeta[][];
}

/** Estilo por tipo de série (largura, tracejado e tamanho do marcador). */
const STYLE = {
   total: { width: 3, dash: 0, marker: 4 },
   group: { width: 2.5, dash: 5, marker: 0 },
   program: { width: 2, dash: 0, marker: 3 },
} as const;

/**
 * Monta — em lockstep — as séries, cores, estilos e metadados do gráfico de
 * histórico a partir do `historico`, do estado de visibilidade e dos derivados
 * compartilhados da página (`carry` e `programColors`, computados UMA vez e
 * também usados por rail/changelog). Ordem das séries: Total → Σ grupos →
 * programas. Tudo é recomputado junto para índice → cor/meta nunca desalinhar.
 *
 * Modo isolado (`isolated != null`): apenas o programa isolado (mais o Total,
 * se o toggle do Total estiver ligado — isolar não força o Total de volta).
 */
export function useHistoricoSeries(
   historico: EsfAerHistorico,
   visibility: HistoricoVisibility,
   carry: CarryForward,
   programColors: Map<number, string>
): HistoricoSeries {
   const { totalVisible, groups, toggled, isolated } = visibility;

   return useMemo(() => {
      const anoRef = historico.ano_ref;
      // Fim do domínio = última atualização global (último ponto do Total).
      // Todas as séries estendem seu valor vigente (horizontal) até aqui — não
      // até 31/dez.
      const totalTl = historico.total.timeline;
      const endData = totalTl.length
         ? totalTl[totalTl.length - 1].data
         : `${anoRef}-01-01`;

      const series: ApexSeries[] = [];
      const colors: string[] = [];
      const dashArray: number[] = [];
      const widths: number[] = [];
      const markerSizes: number[] = [];
      const meta: ChangeMeta[][] = [];

      const add = (
         name: string,
         timeline: HistPoint[],
         color: string,
         style: { width: number; dash: number; marker: number }
      ) => {
         series.push({ name, data: toApexData(timeline, endData) });
         colors.push(color);
         dashArray.push(style.dash);
         widths.push(style.width);
         markerSizes.push(style.marker);
         meta.push(buildChangeMeta(timeline, endData));
      };

      // 1) Total — respeita o toggle do usuário (inclusive no modo isolado):
      // se o chip do Total está desligado, isolar um programa não o traz de volta.
      if (totalVisible) {
         add("Total", historico.total.timeline, TOTAL_COLOR, STYLE.total);
      }

      // 2) Σ por grupo (derivados dos dados) — ocultos no modo isolado.
      if (isolated === null) {
         for (const grupo of carry.grupos) {
            if (!groups[grupo]) continue;
            add(
               `Σ ${grupo}`,
               carry.porGrupo[grupo],
               getGroupColor(grupo),
               STYLE.group
            );
         }
      }

      // 3) Programas — só o isolado no modo isolado; senão os toggled ON.
      for (const p of historico.programas) {
         const visivel =
            isolated !== null
               ? p.esfaer_id === isolated
               : toggled[p.esfaer_id] === true;
         if (!visivel) continue;

         add(
            p.nome,
            p.timeline,
            programColors.get(p.esfaer_id) ?? getGroupColor(p.grupo),
            STYLE.program
         );
      }

      return { series, colors, dashArray, widths, markerSizes, meta };
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
