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
 * - `searched`: a lista recebida (já filtrada por P/G e Função no servidor)
 *   recortada pela busca textual.
 * - `sortedData`: `searched` com o filtro de status e a ordenação aplicados.
 * - `stats`: contagens por status (inclui "empty") sobre `searched`.
 *
 * As contagens saem de `searched`, e não de `data`, porque na faixa de resumo
 * o número É o botão do filtro: contar sobre um conjunto maior que o filtrado
 * faria o contador prometer N e a lista devolver outra coisa. Já o filtro de
 * status fica de fora da conta — senão o número que gerou o clique sumiria ao
 * clicar.
 */
export function useCrmView(data: TripCrmOut[], filters: CrmFiltersApi) {
   const { debouncedSearch, statusFilter, sortField, sortDirection } = filters;

   const searched = useMemo(() => {
      const q = debouncedSearch.trim().toLowerCase();
      if (!q) return data;
      return data.filter(
         (item) =>
            item.nome_guerra.toLowerCase().includes(q) ||
            (item.nome_completo?.toLowerCase().includes(q) ?? false)
      );
   }, [data, debouncedSearch]);

   const sortedData = useMemo(() => {
      const filtered =
         statusFilter === "all"
            ? searched
            : searched.filter(
                 (item) =>
                    getDateStatus(item.crm?.data_validade) === statusFilter
              );

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
   }, [searched, statusFilter, sortField, sortDirection]);

   const stats = useMemo<CrmStats>(() => {
      const counts = emptyCounts();
      for (const item of searched) {
         counts[getDateStatus(item.crm?.data_validade)]++;
      }
      return { total: searched.length, counts };
   }, [searched]);

   return { sortedData, stats };
}
