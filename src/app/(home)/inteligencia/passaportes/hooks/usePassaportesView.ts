import { useMemo } from "react";
import type { TripPassaporteOut } from "services/routes/inteligencia/passaportes";
import { getDateStatus, getWorstStatus } from "../utils/dateStatus";
import type { PassaporteStats, StatusCounts } from "../types";
import type { PassaportesFiltersApi } from "./usePassaportesFilters";

function emptyCounts(): StatusCounts {
   return { valid: 0, warning: 0, critical: 0, expired: 0 };
}

/**
 * Derivações de UI sobre a lista de passaportes:
 * - `sortedData`: aplica busca textual, filtro de status (pior caso entre
 *   passaporte e visa) e ordenação, todos client-side.
 * - `passaporteStats`/`visaStats`: contagens por status, calculadas sobre a
 *   lista completa (não afetadas pela busca/filtro/sort).
 */
export function usePassaportesView(
   data: TripPassaporteOut[],
   filters: PassaportesFiltersApi
) {
   const { debouncedSearch, statusFilter, sortField, sortDirection } = filters;

   const sortedData = useMemo(() => {
      const q = debouncedSearch.trim().toLowerCase();

      const filtered = data.filter((item) => {
         if (q) {
            const matches =
               item.nome_guerra.toLowerCase().includes(q) ||
               (item.nome_completo?.toLowerCase().includes(q) ?? false);
            if (!matches) return false;
         }
         if (statusFilter !== "all") {
            const worst = getWorstStatus(
               item.passaporte?.validade_passaporte,
               item.passaporte?.validade_visa
            );
            if (worst !== statusFilter) return false;
         }
         return true;
      });

      if (!sortField) return filtered;

      const sorted = [...filtered];
      sorted.sort((a, b) => {
         let comparison = 0;
         switch (sortField) {
            case "militar":
               comparison = `${a.p_g} ${a.nome_guerra}`.localeCompare(
                  `${b.p_g} ${b.nome_guerra}`
               );
               break;
            case "validade_passaporte":
            case "validade_visa": {
               const dateA = a.passaporte?.[sortField] || "";
               const dateB = b.passaporte?.[sortField] || "";
               if (!dateA && !dateB) return 0;
               if (!dateA) return 1; // vazios por último
               if (!dateB) return -1;
               comparison = dateA.localeCompare(dateB);
               break;
            }
         }
         return sortDirection === "asc" ? comparison : -comparison;
      });
      return sorted;
   }, [data, debouncedSearch, statusFilter, sortField, sortDirection]);

   const { passaporteStats, visaStats } = useMemo(() => {
      const passaporte = emptyCounts();
      const visa = emptyCounts();
      let passaporteTotal = 0;
      let visaTotal = 0;

      for (const item of data) {
         const pStatus = getDateStatus(item.passaporte?.validade_passaporte);
         if (pStatus !== "empty") {
            passaporte[pStatus]++;
            passaporteTotal++;
         }
         const vStatus = getDateStatus(item.passaporte?.validade_visa);
         if (vStatus !== "empty") {
            visa[vStatus]++;
            visaTotal++;
         }
      }

      return {
         passaporteStats: {
            total: passaporteTotal,
            counts: passaporte,
         } satisfies PassaporteStats,
         visaStats: {
            total: visaTotal,
            counts: visa,
         } satisfies PassaporteStats,
      };
   }, [data]);

   return { sortedData, passaporteStats, visaStats };
}
