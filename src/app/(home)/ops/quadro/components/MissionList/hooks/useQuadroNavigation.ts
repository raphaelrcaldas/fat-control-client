"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { addDays, dateToIso, isoStrToDate, todayIso } from "utils/dateHandler";

// O viewport começa um dia antes da data de referência, para dar contexto
// do que acabou de passar (mesma escolha de `ops/indisp`).
const VIEW_OFFSET = -1;

// Janela de dados carregada de uma vez: a navegação fica clampada dentro
// dela, então todo dia visível tem dado buscado. Estável durante a sessão,
// o que mantém a queryKey estável — navegar não refaz a busca.
const WINDOW_BACK_DAYS = 30;
const WINDOW_FWD_DAYS = 90;

function clampDate(d: Date, min: Date, max: Date): Date {
   if (d.getTime() < min.getTime()) return min;
   if (d.getTime() > max.getTime()) return max;
   return d;
}

/**
 * Lê o `?inicio=` da URL, ou hoje quando ele falta ou não presta.
 *
 * O round-trip por `dateToIso` descarta data com overflow: `isoStrToDate`
 * normaliza "2026-13-99" para abril de 2027 em vez de devolver Invalid
 * Date, e só o ida-e-volta denuncia que a string não era aquele dia.
 */
function lerInicio(raw: string | null): Date {
   if (raw) {
      const parsed = isoStrToDate(raw);
      if (!isNaN(parsed.getTime()) && dateToIso(parsed) === raw) return parsed;
   }
   return new Date();
}

/**
 * Janela de datas visível do quadro.
 *
 * Espelha `ops/indisp/components/board/hooks/useDateNavigation`, com uma
 * diferença deliberada: a posição também vai para a URL (`?inicio=`), para
 * o link continuar compartilhável e sobreviver ao F5 — é assim que a semana
 * é mandada a outro militar.
 *
 * A fonte de verdade, porém, é o `useState`, e não a URL. O arrasto emite
 * um passo por frame (~16ms), enquanto a navegação do Next só reflete o
 * `searchParams` depois do commit da rota: derivar a referência da URL faria
 * dois passos seguidos lerem a mesma data e o segundo sobrescrever o
 * primeiro — o gesto perdia passos e a grade andava menos que o dedo
 * (medido: arrasto de 5 colunas andava 1 dia). Por isso o deslocamento usa
 * updater funcional, igual ao `indisp`, e a URL é só espelho.
 *
 * O espelho usa `replace`, não `push`: com `push`, um arrasto de dez dias
 * empilhava dez entradas de histórico e prendia o usuário na tela — no
 * celular, onde voltar é gesto primário, isso é uma armadilha.
 *
 * O passo é o **dia**, não a janela: com o passo amarrado a quantos dias
 * cabem na tela, três cliques no mobile deixavam a janela começando numa
 * quinta e girar o aparelho herdava o desalinhamento. Deslizando por dia,
 * as duas larguras navegam igual e nenhum dia fica inacessível.
 */
export function useQuadroNavigation(dayCount: number) {
   const searchParams = useSearchParams();
   const router = useRouter();

   const { windowStart, windowEnd } = useMemo(() => {
      const today = new Date();
      return {
         windowStart: addDays(today, -WINDOW_BACK_DAYS),
         windowEnd: addDays(today, WINDOW_FWD_DAYS),
      };
   }, []);

   // Limites de `dateRef` que mantêm o viewport inteiro dentro da janela
   // buscada — recalculados junto com `dayCount`, que muda com a largura.
   const { minRef, maxRef } = useMemo(
      () => ({
         minRef: addDays(windowStart, -VIEW_OFFSET),
         maxRef: addDays(windowEnd, -(dayCount - 1 + VIEW_OFFSET)),
      }),
      [windowStart, windowEnd, dayCount]
   );

   // A URL semeia o estado uma vez, na montagem. Depois disso ela é espelho:
   // relê-la a cada render devolveria o problema que o `useState` resolve.
   const [dateRef, setDateRef] = useState<Date>(() =>
      lerInicio(searchParams.get("inicio"))
   );
   const refAtual = clampDate(dateRef, minRef, maxRef);
   const refIso = dateToIso(refAtual);

   // Espelha a posição na URL sem empilhar histórico. O `scroll: false`
   // evita que cada passo do arrasto jogue a página para o topo.
   const ultimaUrl = useRef<string | null>(null);
   useEffect(() => {
      if (ultimaUrl.current === refIso) return;
      ultimaUrl.current = refIso;
      const params = new URLSearchParams(searchParams);
      if (params.get("inicio") === refIso) return;
      params.set("inicio", refIso);
      router.replace(`?${params.toString()}`, { scroll: false });
      // `searchParams` fora das dependências de propósito: ele muda como
      // consequência deste próprio efeito, e incluí-lo o reexecutaria em
      // cascata. O que deve disparar o espelho é a posição mudar.
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [refIso, router]);

   const dates = useMemo(
      () =>
         Array.from({ length: dayCount }, (_, i) =>
            addDays(refAtual, i + VIEW_OFFSET)
         ),
      // `refAtual` é derivado; a identidade muda a cada render, então a
      // dependência é o valor em ms.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [refAtual.getTime(), dayCount]
   );

   // Updater funcional: dois passos do arrasto no mesmo frame somam, em vez
   // de um sobrescrever o outro.
   const shift = useCallback(
      (days: number) =>
         setDateRef((prev) => clampDate(addDays(prev, days), minRef, maxRef)),
      [minRef, maxRef]
   );

   const goToday = useCallback(
      () => setDateRef(clampDate(new Date(), minRef, maxRef)),
      [minRef, maxRef]
   );

   return {
      dates,
      shift,
      goToday,
      canBack: refAtual.getTime() > minRef.getTime(),
      canForward: refAtual.getTime() < maxRef.getTime(),
      isToday: refIso === todayIso(),
      windowFrom: dateToIso(windowStart),
      windowTo: dateToIso(windowEnd),
   };
}
