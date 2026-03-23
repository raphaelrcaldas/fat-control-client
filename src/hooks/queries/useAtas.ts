import {
   useQuery,
   useMutation,
   useQueryClient,
} from "@tanstack/react-query";
import {
   extrairAta,
   uploadAta,
   getAtasByUser,
   updateAta,
   deleteAta,
   getStorageStats,
   getAllBucketsStats,
   getAtasOrfas,
   deleteAtasOrfas,
} from "services/routes/aeromedica/atas";
import type { AtaUpdateData, DadosConfirmados } from "services/routes/aeromedica/atas";
import { cartoesSaudeKeys } from "./useCartoesSaude";

// ========================================
// Query Keys
// ========================================

export const atasKeys = {
   all: ["atas"] as const,
   byUser: (userId: number) => [...atasKeys.all, "user", userId] as const,
   storageStats: () => [...atasKeys.all, "storage-stats"] as const,
   allBucketsStats: () => [...atasKeys.all, "all-buckets-stats"] as const,
   orfas: () => [...atasKeys.all, "orfas"] as const,
};

// ========================================
// Queries
// ========================================

export function useAtasByUser(userId: number | undefined) {
   return useQuery({
      queryKey: atasKeys.byUser(userId ?? 0),
      queryFn: async ({ signal }) => {
         return getAtasByUser(userId!, signal);
      },
      enabled: !!userId,
      staleTime: 5 * 60_000,
   });
}

export function useStorageStats() {
   return useQuery({
      queryKey: atasKeys.storageStats(),
      queryFn: async ({ signal }) => {
         return getStorageStats(signal);
      },
      staleTime: 60_000,
   });
}

export function useAllBucketsStats() {
   return useQuery({
      queryKey: atasKeys.allBucketsStats(),
      queryFn: async ({ signal }) => {
         return getAllBucketsStats(signal);
      },
      staleTime: 60_000,
   });
}

export function useAtasOrfas() {
   return useQuery({
      queryKey: atasKeys.orfas(),
      queryFn: async ({ signal }) => {
         return getAtasOrfas(signal);
      },
      staleTime: 60_000,
   });
}

// ========================================
// Mutations
// ========================================

export function useExtrairAta() {
   return useMutation({
      mutationFn: async ({
         userId,
         file,
      }: {
         userId: number;
         file: File;
      }) => {
         return extrairAta(userId, file);
      },
   });
}

export function useUploadAta() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async ({
         userId,
         file,
         dados,
      }: {
         userId: number;
         file: File;
         dados: DadosConfirmados;
      }) => {
         return uploadAta(userId, file, dados);
      },
      onSuccess: (_data, variables) => {
         queryClient.invalidateQueries({
            queryKey: atasKeys.byUser(variables.userId),
         });
         // Invalida cartões pois cemal pode ter sido atualizado
         queryClient.invalidateQueries({
            queryKey: cartoesSaudeKeys.lists(),
         });
      },
   });
}

export function useUpdateAta() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async ({
         ataId,
         data,
      }: {
         ataId: number;
         data: AtaUpdateData;
      }) => {
         return updateAta(ataId, data);
      },
      onSuccess: () => {
         queryClient.invalidateQueries({
            queryKey: atasKeys.all,
         });
         queryClient.invalidateQueries({
            queryKey: cartoesSaudeKeys.lists(),
         });
      },
   });
}

export function useDeleteAta() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async (ataId: number) => {
         await deleteAta(ataId);
      },
      onSuccess: () => {
         queryClient.invalidateQueries({
            queryKey: atasKeys.all,
         });
         queryClient.invalidateQueries({
            queryKey: atasKeys.storageStats(),
         });
         // cemal_tem_ata e total_atas podem mudar
         queryClient.invalidateQueries({
            queryKey: cartoesSaudeKeys.lists(),
         });
      },
   });
}

export function useDeleteAtasOrfas() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async () => {
         await deleteAtasOrfas();
      },
      onSuccess: () => {
         queryClient.invalidateQueries({
            queryKey: atasKeys.orfas(),
         });
         queryClient.invalidateQueries({
            queryKey: atasKeys.allBucketsStats(),
         });
      },
   });
}
