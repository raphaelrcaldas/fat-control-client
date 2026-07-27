"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ComissList } from "services/routes/cegep/comiss";
import {
   simularMissao,
   type SimulacaoResultado,
} from "services/routes/cegep/missoes";
import { useComissList } from "@/hooks/queries/useComiss";
import { compareByAntiguidade } from "utils/sortByAntiguidade";
import { pernoiteCompleto, type PernoiteRow } from "./useSimulacao";

/** Dias consecutivos que fecham um módulo (`DIAS_MODULO` em services/comis.py). */
const DIAS_MODULO = 16;

/** Espera entre a última mexida no formulário e a projeção. */
const DEBOUNCE_MS = 400;

export interface ImpactoComiss {
   comiss: ComissList;
   /** Comissionamento por período (dias a cumprir) ou comparativo (valor). */
   isPeriodo: boolean;
   /** Completude de hoje como o backend devolve — já limitada a 100. */
   atual: number;
   /**
    * Completude de hoje SEM o teto de 100.
    *
    * `comiss.completude` chega clampado (`min(completude, 1)` no backend),
    * então quem já cumpriu além do previsto aparece como 100. Recalcular a
    * base crua é o que mantém o ganho honesto: sem isso, um comissionamento
    * a 140% de 100 dias mostraria "+50 p.p." por uma missão de 10 dias que,
    * na prática, não move a barra.
    */
   atualBruta: number;
   /** Completude projetada, limitada a 100 — o que a barra desenha. */
   projetada: number;
   /** Projeção sem o teto de 100: > 100 significa que a missão extrapola. */
   projetadaBruta: number;
   /** Ganho em pontos percentuais, das grandezas sem teto. */
   ganho: number;
   /** Acréscimo em dias (período) — 0 no modo comparativo. */
   deltaDias: number;
   /** Acréscimo em reais (comparativo) — custo de 1 militar comissionado. */
   deltaValor: number;
   /** A missão sozinha já tem 16+ dias corridos e fecharia o módulo. */
   fechaModulo: boolean;
}

/** Percentual do backend: fração × 100, arredondada em 1 casa, sem teto. */
function percentual(parte: number, total: number): number {
   if (!total) return 0;
   return Math.round((parte / total) * 1000) / 10;
}

function useDebounced<T>(value: T, delay: number): T {
   const [debounced, setDebounced] = useState(value);
   useEffect(() => {
      const id = setTimeout(() => setDebounced(value), delay);
      return () => clearTimeout(id);
   }, [value, delay]);
   return debounced;
}

interface UseImpactoComissoesOptions {
   pnts: PernoiteRow[];
   acrecDesloc: boolean;
}

/**
 * Projeta o efeito da missão em planejamento sobre os comissionamentos que o
 * usuário acoplar à simulação.
 *
 * **É uma consulta complementar, paralela ao cálculo principal.** O payload
 * do cálculo de custo não muda e o total geral da missão continua sendo só
 * dos militares genéricos: aqui roda uma segunda chamada ao mesmo `/simular`,
 * montada apenas com `{p_g, sit:'c', qtd:1}` dos P/G acoplados. Duas
 * propriedades do backend tornam isso suficiente — `total_dias` não depende
 * de combinação alguma, e `valor_unitario` já é por militar, então uma linha
 * por P/G serve quantos comissionados houver daquele posto.
 *
 * A projeção reproduz `recalcular_cache_comiss`
 * (`api/fcontrol_api/services/comis.py`):
 *
 * - **período**: `completude = dias_comp / dias_cumprir`
 * - **comparativo**: `completude = vals_comp / (valor_aj_ab + valor_aj_fc)`
 *
 * **A janela `data_ab`–`data_fc` é ignorada de propósito** (decisão de
 * produto, jul/2026, em paridade com o simulador do FatBird — não "consertar"
 * sem falar com o dono do módulo). Vale saber o que se abre mão: o backend só
 * soma ao comissionamento as missões com `afast >= data_ab` e
 * `regres <= data_fc` (`filtro_missoes_periodo`), e `verificar_usrs_comiss`
 * recusa com 400 o cadastro como comissionado fora disso. Ou seja, para datas
 * fora da janela o impacto real é **zero** e a projeção exibida é otimista.
 */
export function useImpactoComissoes({
   pnts,
   acrecDesloc,
}: UseImpactoComissoesOptions) {
   const [selecionados, setSelecionados] = useState<ComissList[]>([]);

   const { data: abertos = [], isLoading: carregandoAbertos } = useComissList({
      status: "aberto",
   });

   const acoplar = useCallback((comiss: ComissList) => {
      setSelecionados((prev) =>
         prev.some((c) => c.id === comiss.id) ? prev : [...prev, comiss]
      );
   }, []);

   const desacoplar = useCallback((id: number) => {
      setSelecionados((prev) => prev.filter((c) => c.id !== id));
   }, []);

   // Ordem de leitura é a militar: do mais antigo para o mais moderno,
   // independente da ordem em que foram acoplados.
   const acoplados = useMemo(
      () =>
         [...selecionados].sort((a, b) =>
            a.user && b.user ? compareByAntiguidade(a.user, b.user) : 0
         ),
      [selecionados]
   );

   const jaAcoplados = useMemo(
      () => new Set(selecionados.map((c) => c.id)),
      [selecionados]
   );

   const disponiveis = useMemo(
      () => abertos.filter((c) => !jaAcoplados.has(c.id!)),
      [abertos, jaAcoplados]
   );

   const pernoites = useMemo(
      () =>
         pnts.filter(pernoiteCompleto).map((p) => ({
            data_ini: p.data_ini,
            data_fim: p.data_fim,
            cidade_id: p.cidade_id,
            meia_diaria: p.meia_diaria,
            acrec_desloc: p.acrec_desloc,
         })),
      [pnts]
   );

   // Um P/G basta para todos os comissionados daquele posto.
   const pgs = useMemo(() => {
      const distintos = new Set(
         selecionados.map((c) => c.user?.p_g).filter(Boolean) as string[]
      );
      return [...distintos].sort();
   }, [selecionados]);

   const entrada = useMemo(
      () => ({ pernoites, pgs, acrecDesloc }),
      [pernoites, pgs, acrecDesloc]
   );
   const debounced = useDebounced(entrada, DEBOUNCE_MS);

   const habilitada =
      debounced.pgs.length > 0 && debounced.pernoites.length > 0;

   const query = useQuery({
      queryKey: ["calculadora", "impacto-comiss", debounced],
      queryFn: async ({ signal }) => {
         const result = await simularMissao(
            {
               acrec_desloc: debounced.acrecDesloc,
               pernoites: debounced.pernoites,
               combinacoes: debounced.pgs.map((p_g) => ({
                  p_g,
                  sit: "c" as const,
                  qtd: 1,
               })),
            },
            signal
         );
         if (!result.ok) {
            throw new Error(result.message ?? "Não foi possível projetar");
         }
         return result.data as SimulacaoResultado;
      },
      enabled: habilitada,
      placeholderData: keepPreviousData,
   });

   const resultado = habilitada ? (query.data ?? null) : null;

   const impactos = useMemo<ImpactoComiss[]>(() => {
      if (!resultado) return [];

      const valorPorPg = new Map(
         resultado.combinacoes
            .filter((c) => c.sit === "c")
            .map((c) => [c.p_g, c.valor_unitario])
      );

      // Janela ocupada pela missão: menor data_ini, maior data_fim. Strings
      // ISO "YYYY-MM-DD" comparam cronologicamente na ordem lexicográfica —
      // não passar por `Date` aqui (o projeto já teve bug de fuso nisso).
      const dias = debounced.pernoites;
      const ini = dias.reduce(
         (min, p) => (p.data_ini < min ? p.data_ini : min),
         dias[0].data_ini
      );
      const fim = dias.reduce(
         (max, p) => (p.data_fim > max ? p.data_fim : max),
         dias[0].data_fim
      );
      const diasCorridos =
         Math.round(
            (Date.parse(`${fim}T00:00:00`) - Date.parse(`${ini}T00:00:00`)) /
               86400000
         ) + 1;

      return acoplados.map((comiss) => {
         // Truthiness (não `!= null`) para casar com o `if comiss.dias_cumprir`
         // do backend: 0 dias a cumprir também cai no modo comparativo.
         const isPeriodo = !!comiss.dias_cumprir;

         const deltaDias = resultado.total_dias;
         const deltaValor = valorPorPg.get(comiss.user?.p_g ?? "") ?? 0;

         // Base e projeção saem da MESMA fórmula, as duas sem teto — só assim
         // a diferença entre elas é o ganho de fato da missão.
         const cumprido = isPeriodo ? comiss.dias_comp : comiss.vals_comp;
         const aCumprir = isPeriodo
            ? comiss.dias_cumprir!
            : comiss.valor_aj_ab + comiss.valor_aj_fc;
         const delta = isPeriodo ? deltaDias : deltaValor;

         const atualBruta = percentual(cumprido, aCumprir);
         const projetadaBruta = percentual(cumprido + delta, aCumprir);

         return {
            comiss,
            isPeriodo,
            atual: comiss.completude,
            atualBruta,
            projetada: Math.min(projetadaBruta, 100),
            projetadaBruta,
            ganho: Math.round((projetadaBruta - atualBruta) * 10) / 10,
            deltaDias: isPeriodo ? deltaDias : 0,
            deltaValor: isPeriodo ? 0 : deltaValor,
            // Uma única missão de 16+ dias corridos fecha o módulo sozinha —
            // não depende das demais missões já vinculadas.
            fechaModulo: !comiss.modulo && diasCorridos >= DIAS_MODULO,
         };
      });
   }, [acoplados, resultado, debounced.pernoites]);

   return {
      /** Comissionamentos abertos ainda não acoplados — a fonte da busca. */
      disponiveis,
      carregandoAbertos,
      /** Acoplados na ordem de antiguidade, com ou sem projeção pronta. */
      acoplados,
      acoplar,
      desacoplar,
      /** Projeções prontas; vazio enquanto faltar pernoite válido. */
      impactos,
      projetando: query.isFetching && habilitada,
      erro: query.isError
         ? ((query.error as Error).message ?? "Não foi possível projetar")
         : null,
      /** Falta pernoite completo para projetar o que já foi acoplado. */
      aguardandoPernoite: pgs.length > 0 && pernoites.length === 0,
   };
}
