"use client";

import { useCallback, useMemo, useState } from "react";

/**
 * Carrinho de selecao que sobrevive a paginacao e a troca de filtro.
 *
 * Guarda o OBJETO inteiro, nao so o id. E isso que dispensa endpoint de
 * export e varredura de paginas: quando o usuario manda exportar, todas as
 * linhas escolhidas ja estao em memoria, mesmo as que sairam da tela ha
 * cinco paginas.
 */
export interface ExportCart<T> {
   /** Selecionados, na ordem em que foram adicionados. */
   items: T[];
   count: number;
   isEmpty: boolean;
   has: (id: number) => boolean;
   /** Marca/desmarca uma linha. */
   toggle: (item: T) => void;
   /** Adiciona sem duplicar (usado no "selecionar esta pagina"). */
   addMany: (items: T[]) => void;
   removeMany: (ids: number[]) => void;
   remove: (id: number) => void;
   /**
    * Esvazia o carrinho. Nao ha desfazer: quem chama pede confirmacao antes,
    * porque isto destroi uma selecao que pode ter levado varias paginas para
    * ser montada.
    */
   clear: () => void;
}

export function useExportCart<T>(getId: (item: T) => number): ExportCart<T> {
   const [selected, setSelected] = useState<Map<number, T>>(() => new Map());

   const has = useCallback((id: number) => selected.has(id), [selected]);

   const toggle = useCallback(
      (item: T) => {
         const id = getId(item);
         setSelected((prev) => {
            const next = new Map(prev);
            if (next.has(id)) {
               next.delete(id);
            } else {
               next.set(id, item);
            }
            return next;
         });
      },
      [getId]
   );

   const addMany = useCallback(
      (items: T[]) => {
         if (items.length === 0) return;
         setSelected((prev) => {
            const next = new Map(prev);
            for (const item of items) next.set(getId(item), item);
            return next;
         });
      },
      [getId]
   );

   const removeMany = useCallback((ids: number[]) => {
      if (ids.length === 0) return;
      setSelected((prev) => {
         const next = new Map(prev);
         for (const id of ids) next.delete(id);
         return next;
      });
   }, []);

   const remove = useCallback((id: number) => {
      setSelected((prev) => {
         const next = new Map(prev);
         next.delete(id);
         return next;
      });
   }, []);

   const clear = useCallback(() => setSelected(new Map()), []);

   const items = useMemo(() => [...selected.values()], [selected]);

   return {
      items,
      count: selected.size,
      isEmpty: selected.size === 0,
      has,
      toggle,
      addMany,
      removeMany,
      remove,
      clear,
   };
}
