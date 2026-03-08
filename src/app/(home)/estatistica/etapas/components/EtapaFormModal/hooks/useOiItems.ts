import { useMemo, useState } from "react";
import type { OIItem } from "../types";
import { newOiItem } from "../helpers";

interface UseOiItemsParams {
   tvoo: number;
}

export function useOiItems(params: UseOiItemsParams) {
   const { tvoo } = params;

   const [oiItems, setOiItems] = useState<OIItem[]>([]);

   const oiTotalTvoo = useMemo(
      () => oiItems.reduce((s, oi) => s + (oi.tvoo || 0), 0),
      [oiItems]
   );

   const oiValid =
      oiItems.length === 0 ||
      (oiTotalTvoo === tvoo &&
         oiItems.every(
            (oi) => oi.esf_aer_id && oi.tipo_missao_id && oi.tvoo > 0
         ));

   function addOiItem() {
      setOiItems((prev) => {
         const last = prev.length > 0 ? prev[prev.length - 1] : null;
         const item = newOiItem();
         if (last?.esf_aer_id) {
            item.esf_aer_id = last.esf_aer_id;
         }
         return [...prev, item];
      });
   }

   function removeOiItem(uid: string) {
      setOiItems((prev) => prev.filter((oi) => oi.uid !== uid));
   }

   function updateOiItem(uid: string, patch: Partial<OIItem>) {
      setOiItems((prev) =>
         prev.map((oi) => (oi.uid === uid ? { ...oi, ...patch } : oi))
      );
   }

   return {
      oiItems,
      setOiItems,
      addOiItem,
      removeOiItem,
      updateOiItem,
      oiTotalTvoo,
      oiValid,
   };
}
