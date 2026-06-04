import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCleanupPreview, runCleanup } from "services/routes/cleanup";

// ========================================
// Query Keys
// ========================================

export const cleanupKeys = {
   all: ["cleanup"] as const,
   preview: () => [...cleanupKeys.all, "preview"] as const,
};

// ========================================
// Queries
// ========================================

export function useCleanupPreview() {
   return useQuery({
      queryKey: cleanupKeys.preview(),
      queryFn: async ({ signal }) => {
         return getCleanupPreview(signal);
      },
      staleTime: 60_000,
   });
}

// ========================================
// Mutations
// ========================================

export function useRunCleanup() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async () => runCleanup(),
      onSuccess: () => {
         queryClient.invalidateQueries({
            queryKey: cleanupKeys.preview(),
         });
      },
   });
}
