import { useMemo, useState } from "react";
import { todayIso, dateToIso } from "utils/dateHandler";
import type { IndispFilters } from "services/routes/indisps";

// Padrão: dos últimos 7 dias até hoje (em fuso local — sem toISOString).
function getDefaultDates() {
   const d = new Date();
   d.setDate(d.getDate() - 7);
   return { dateFrom: dateToIso(d), dateTo: todayIso() };
}

export interface UseIndispFilters {
   dateFrom: string;
   dateTo: string;
   mtv: string;
   showFuture: boolean;
   setDateFrom: (v: string) => void;
   setDateTo: (v: string) => void;
   setMtv: (v: string) => void;
   setShowFuture: (v: boolean) => void;
   filters: IndispFilters;
   hasCustomFilters: boolean;
   reset: () => void;
}

export function useIndispFilters(): UseIndispFilters {
   const defaults = useMemo(getDefaultDates, []);

   const [dateFrom, setDateFromRaw] = useState(defaults.dateFrom);
   const [dateTo, setDateTo] = useState(defaults.dateTo);
   const [mtv, setMtv] = useState("");
   const [showFuture, setShowFuture] = useState(true);

   // Ajuste no handler (não em useEffect): fim nunca antes do início.
   const setDateFrom = (v: string) => {
      setDateFromRaw(v);
      if (dateTo && v > dateTo) setDateTo(v);
   };

   const filters = useMemo<IndispFilters>(
      () => ({
         date_from: dateFrom,
         date_to: showFuture ? undefined : dateTo,
         mtv: mtv || undefined,
      }),
      [dateFrom, dateTo, showFuture, mtv]
   );

   const hasCustomFilters =
      mtv !== "" || dateFrom !== defaults.dateFrom || !showFuture;

   const reset = () => {
      setDateFromRaw(defaults.dateFrom);
      setDateTo(defaults.dateTo);
      setMtv("");
      setShowFuture(true);
   };

   return {
      dateFrom,
      dateTo,
      mtv,
      showFuture,
      setDateFrom,
      setDateTo,
      setMtv,
      setShowFuture,
      filters,
      hasCustomFilters,
      reset,
   };
}
