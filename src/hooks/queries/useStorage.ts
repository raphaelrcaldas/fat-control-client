import { useQuery } from "@tanstack/react-query";
import { getAllBucketsStats } from "services/routes/storage";

// ========================================
// Query Keys
// ========================================

export const storageKeys = {
   all: ["storage"] as const,
   allBuckets: () => [...storageKeys.all, "all-buckets"] as const,
};

// ========================================
// Queries
// ========================================

export function useAllBucketsStats() {
   return useQuery({
      queryKey: storageKeys.allBuckets(),
      queryFn: async ({ signal }) => {
         return getAllBucketsStats(signal);
      },
      staleTime: 60_000,
   });
}
