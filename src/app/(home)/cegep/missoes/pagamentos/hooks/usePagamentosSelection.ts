"use client";

import { useEffect, useMemo, useState } from "react";
import { PagamentoRecord } from "services/routes/cegep/financeiro";

/**
 * Seleção de registros da página, com os totais acumulados.
 *
 * As somas são mantidas incrementalmente (e não derivadas dos ids a cada
 * render) porque o valor de cada linha chega junto do evento de marcar —
 * só o "selecionar todos" precisa varrer a lista.
 */
export function usePagamentosSelection(misRecords: PagamentoRecord[] | null) {
   const [selectedAll, setSelectedAll] = useState(false);
   const [selectedIds, setSelectedIds] = useState<number[]>([]);
   const [valorSoma, setValorSoma] = useState(0);
   const [diariasSoma, setDiariasSoma] = useState(0);
   const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

   useEffect(() => {
      if (misRecords && selectedAll) {
         setSelectedIds(misRecords.map((r) => r.user_mis.id));
         setValorSoma(
            misRecords.reduce((acc, r) => acc + Number(r.missao.valor_total), 0)
         );
         setDiariasSoma(
            misRecords.reduce(
               (acc, r) => acc + Number(r.missao.diarias ?? 0),
               0
            )
         );
      } else if (misRecords && !selectedAll) {
         setSelectedIds([]);
         setValorSoma(0);
         setDiariasSoma(0);
      }
   }, [selectedAll, misRecords]);

   function handleSelect(
      id: number,
      valor: number,
      diarias: number,
      checked: boolean
   ) {
      if (checked) {
         setSelectedIds((prev) => [...prev, id]);
         setValorSoma((prev) => prev + Number(valor));
         setDiariasSoma((prev) => prev + Number(diarias));
      } else {
         setSelectedIds((prev) => prev.filter((item) => item !== id));
         setValorSoma((prev) => prev - Number(valor));
         setDiariasSoma((prev) => prev - Number(diarias));
      }
   }

   return {
      selectedAll,
      setSelectedAll,
      selectedIds,
      selectedIdSet,
      valorSoma,
      diariasSoma,
      handleSelect,
   };
}
