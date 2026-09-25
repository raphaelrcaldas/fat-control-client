"use client";

import { useCallback, useEffect } from "react";
import { useSearchParamsUpdater } from "@/hooks/useSearchParamsState";
import {
   periodoPadrao,
   dataIsoValida,
   ajustarPeriodo,
   periodoSeValido,
   type CampoPeriodo,
} from "../utils/relatorios";

/**
 * Filtros e seleção vivem na URL (`?data_ini=&data_fim=&anv=&sel=`): o
 * link de um relatório é compartilhável e sobrevive a um reload. As datas
 * ficam sempre na URL — se faltarem, forem inválidas ou `data_ini` vier
 * depois de `data_fim`, o padrão (últimos 15 dias) é gravado nela.
 */
export function useRelatoriosParams() {
   const { searchParams, setParams } = useSearchParamsUpdater();
   const dataIniUrl = searchParams.get("data_ini");
   const dataFimUrl = searchParams.get("data_fim");
   const selUrl = Number(searchParams.get("sel"));

   const datasValidas =
      dataIsoValida(dataIniUrl) &&
      dataIsoValida(dataFimUrl) &&
      dataIniUrl! <= dataFimUrl!;
   const padrao = periodoPadrao();
   const data_ini = datasValidas ? dataIniUrl! : padrao.data_ini;
   const data_fim = datasValidas ? dataFimUrl! : padrao.data_fim;

   // Corrige a URL sempre que ela ficar com um par diferente do exibido —
   // não só na montagem: um `confirmarPeriodo` gravado por outra aba, ou uma
   // navegação direta a um link com data inválida, também precisa cair no
   // padrão em vez de deixar a URL divergente do que a tela mostra.
   useEffect(() => {
      if (!datasValidas) setParams({ data_ini, data_fim });
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [dataIniUrl, dataFimUrl]);

   // --- Gravação otimista (a cada tecla) ---
   // Só grava quando o valor digitado já forma, sozinho, um par válido,
   // não invertido e não futuro (`periodoSeValido`) — nunca puxa a outra
   // ponta aqui. Um dígito de dia/mês sozinho formando uma data "pequena"
   // (ex.: digitar "2" no dia da final, virando `09-02` antes de completar
   // "20") ficaria abaixo da inicial e seria descartado (`null`) em vez de
   // arrastar a inicial: só a confirmação tem essa permissão. Devolve
   // `true` quando gravou, para o campo saber que não precisa mais fazer
   // nada (`false` deixa o valor só no estado local do input).
   const setPeriodoOtimista = useCallback(
      (campo: CampoPeriodo, valor: string): boolean => {
         const proximo = periodoSeValido({ data_ini, data_fim }, campo, valor);
         if (!proximo) return false;
         if (proximo.data_ini === data_ini && proximo.data_fim === data_fim)
            return true;
         setParams({ ...proximo, sel: undefined });
         return true;
      },
      [data_ini, data_fim, setParams]
   );

   // --- Confirmação (blur do campo, ou seleção via calendário) ---
   // Aplica `ajustarPeriodo`: puxa a outra ponta se o valor confirmado
   // inverteria o intervalo, e limita a hoje. Valor vazio/inválido devolve
   // o período inalterado — o campo volta a exibir o valor efetivo (quem
   // chama decide, comparando o retorno com o valor que tentou confirmar).
   const confirmarPeriodo = useCallback(
      (campo: CampoPeriodo, valor: string) => {
         const proximo = ajustarPeriodo({ data_ini, data_fim }, campo, valor);
         if (proximo.data_ini !== data_ini || proximo.data_fim !== data_fim)
            setParams({ ...proximo, sel: undefined });
         return proximo;
      },
      [data_ini, data_fim, setParams]
   );

   return {
      data_ini,
      data_fim,
      // Chave de ressincronização do campo local: a string COMPLETA da URL,
      // não `${data_ini}|${data_fim}`. Com URL válida, `data_ini`/`data_fim`
      // JÁ SÃO a própria data efetiva lida dela — reescrever a URL com o
      // mesmo período (ex.: "Limpar filtros" quando `anv` muda mas as datas
      // já estavam no padrão) não mudaria essa chave por string, e o efeito
      // de ressincronização do campo local não dispararia. Bug reproduzido:
      // período padrão 09-10..09-24 com `anv=2858`; digitar "01" no dia da
      // final grava só localmente (inverteria); "Limpar filtros" dispara um
      // blur (mousedown) que grava 09-01..09-01 seguido do clique que grava
      // o padrão a partir do MESMO `searchParams` (fechado sobre o estado
      // antigo) — os dois `router.replace` se fundem, e com a chave antiga
      // (`09-10|09-24` → `09-10|09-24`) o campo ficava preso em 09-01/09-01
      // enquanto URL e lista já mostravam 09-10..09-24. `searchParams`
      // inteiro muda sempre que qualquer parâmetro muda (inclusive `anv`,
      // que "Limpar filtros" sempre grava junto), então cobre esse caso.
      periodoKey: searchParams.toString(),
      anv: searchParams.get("anv") ?? undefined,
      sel: Number.isInteger(selUrl) && selUrl > 0 ? selUrl : null,
      setParams,
      setPeriodoOtimista,
      confirmarPeriodo,
   };
}
