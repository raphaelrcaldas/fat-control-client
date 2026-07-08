import { useMemo } from "react";
import type { TripCrmOut } from "services/routes/seg-voo/crm";
import { getDateStatus } from "@/utils/dateStatus";
import type { CrmStats, StatusCounts } from "../types";
import type { CrmFiltersApi } from "./useCrmFilters";

function emptyCounts(): StatusCounts {
   return { valid: 0, warning: 0, critical: 0, expired: 0, empty: 0 };
}

/**
 * Derivações de UI sobre a lista de CRM:
 * - `sortedData`: aplica busca textual, filtro de status e ordenação,
 *   todos client-side.
 * - `stats`: contagens por status (inclui "empty") sobre a lista recebida
 *   (já filtrada por P/G e Função no servidor), não afetadas pela busca,
 *   filtro de status ou ordenação client-side.
 */
export function useCrmView(data: TripCrmOut[], filters: CrmFiltersApi) {
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
            if (getDateStatus(item.crm?.data_validade) !== statusFilter)
               return false;
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
            case "validade": {
               const dateA = a.crm?.data_validade || "";
               const dateB = b.crm?.data_validade || "";
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

   const stats = useMemo<CrmStats>(() => {
      const counts = emptyCounts();
      for (const item of data) {
         counts[getDateStatus(item.crm?.data_validade)]++;
      }
      return { total: data.length, counts };
   }, [data]);

   return { sortedData, stats };
}
