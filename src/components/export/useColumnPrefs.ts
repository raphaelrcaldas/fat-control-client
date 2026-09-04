"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ExportColumn } from "./exportTypes";

interface StoredPrefs {
   cols: string[];
   order: string[];
}

/**
 * Escolha de colunas do usuario: quais entram e em que ordem, com
 * persistencia por tela.
 *
 * A chave e do browser, sem escopo de usuario nem de org — em estacao
 * compartilhada o proximo militar herda a escolha do anterior. E aceitavel
 * porque so as `key` das colunas sao gravadas: nenhum dado pessoal vai para o
 * localStorage.
 */
export function useColumnPrefs<T>(
   columns: ExportColumn<T>[],
   storageKey: string,
   open: boolean
) {
   const optionalColumns = useMemo(
      () => columns.filter((c) => !c.required),
      [columns]
   );

   const [checked, setChecked] = useState<Set<string>>(() => new Set());
   /** Ordem escolhida; chave que falta aqui vai para o fim, na ordem do
    *  catalogo. */
   const [order, setOrder] = useState<string[]>([]);

   // O catalogo entra por ref, e nao pelas deps do efeito abaixo. Tela que
   // monta as colunas por factory (`/ops/trip` precisa do rotulo da funcao,
   // que vem de hook) devolve um array NOVO a cada render do pai: nas deps,
   // qualquer refetch do react-query reabriria o efeito no meio da
   // interacao, desmarcando a coluna que o usuario acabou de escolher.
   const catalogRef = useRef({ columns, optionalColumns });
   catalogRef.current = { columns, optionalColumns };

   // Preferencia so e lida no cliente: localStorage no primeiro render
   // divergiria do HTML do servidor. Pode falhar (aba anonima, site data
   // bloqueado), e ai simplesmente comeca no padrao.
   useEffect(() => {
      if (!open) return;

      const catalog = catalogRef.current;
      try {
         const saved = localStorage.getItem(storageKey);
         if (saved) {
            const parsed = JSON.parse(saved) as StoredPrefs;
            setChecked(
               new Set(
                  (parsed.cols ?? []).filter((k) =>
                     catalog.optionalColumns.some((c) => c.key === k)
                  )
               )
            );
            setOrder(
               (parsed.order ?? []).filter((k) =>
                  catalog.columns.some((c) => c.key === k)
               )
            );
            return;
         }
      } catch {
         // sem preferencia utilizavel — segue com o padrao
      }
      setChecked(new Set());
      setOrder([]);
   }, [open, storageKey]);

   /** Marca ou desmarca um conjunto de uma vez ("todas" da secao ou geral). */
   const setMany = useCallback((keys: string[], value: boolean) => {
      setChecked((prev) => {
         const next = new Set(prev);
         for (const key of keys) {
            if (value) next.add(key);
            else next.delete(key);
         }
         return next;
      });
   }, []);

   const toggle = useCallback((key: string) => {
      setChecked((prev) => {
         const next = new Set(prev);
         if (next.has(key)) next.delete(key);
         else next.add(key);
         return next;
      });
   }, []);

   /** Colunas efetivas: fixas + marcadas, na ordem que o usuario remanejou. */
   const activeColumns = useMemo(() => {
      const active = columns.filter((c) => c.required || checked.has(c.key));

      // Coluna que a preferencia salva nao conhece herda a vaga logo APOS a
      // sua vizinha de catalogo — nao vai para o fim da fila. Sem isto,
      // acrescentar uma coluna fixa nova joga ela para o fim na tela de quem
      // ja tinha preferencia gravada: foi o que aconteceu quando `quadro` e
      // `esp` viraram obrigatorias e apareceram depois do SARAM.
      const salvo = new Map(order.map((key, i) => [key, i * 1000]));
      const posicao = new Map<string, number>();
      let ultima = -1000;
      for (const column of columns) {
         const p = salvo.get(column.key);
         if (p !== undefined) {
            ultima = p;
         } else {
            ultima += 1;
         }
         posicao.set(column.key, ultima);
      }

      return [...active].sort(
         (a, b) => (posicao.get(a.key) ?? 0) - (posicao.get(b.key) ?? 0)
      );
   }, [columns, checked, order]);

   const persist = useCallback(() => {
      try {
         const prefs: StoredPrefs = {
            cols: [...checked],
            order: activeColumns.map((c) => c.key),
         };
         localStorage.setItem(storageKey, JSON.stringify(prefs));
      } catch {
         // preferencia e conveniencia; nao atrapalha o download
      }
   }, [checked, activeColumns, storageKey]);

   return {
      optionalColumns,
      activeColumns,
      checked,
      toggle,
      setMany,
      setOrder,
      persist,
   };
}
