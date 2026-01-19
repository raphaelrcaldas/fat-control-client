import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getPgts, PagamentosFilters } from "services/routes/cegep/financeiro";

// ========================================
// Query Keys - Centralizadas
// ========================================

export const pagamentoKeys = {
   all: ["pagamentos"] as const,
   lists: () => [...pagamentoKeys.all, "list"] as const,
   list: (filters?: PagamentosFilters) =>
      [...pagamentoKeys.lists(), filters] as const,
};

// ========================================
// Queries
// ========================================

/**
 * Lista paginada de pagamentos com filtros
 * Usa keepPreviousData para paginacao suave
 */
export function usePagamentos(
   filters?: PagamentosFilters,
   options?: { enabled?: boolean }
) {
   return useQuery({
      queryKey: pagamentoKeys.list(filters),
      queryFn: ({ signal }) => getPgts(filters, signal),
      placeholderData: keepPreviousData,
      enabled: options?.enabled ?? true,
   });
}
