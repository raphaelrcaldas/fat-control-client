import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
   extrairAta,
   uploadAta,
   getAtasByUser,
   deleteAta,
   getAtasOrfas,
   deleteAtasOrfas,
} from "services/routes/aeromedica/atas";
import type { DadosConfirmados } from "services/routes/aeromedica/atas";
import { cartoesSaudeKeys } from "./useCartoesSaude";
import { storageKeys } from "./useStorage";

// ========================================
// Query Keys
// ========================================

export const atasKeys = {
   all: ["atas"] as const,
   byUser: (userId: number) => [...atasKeys.all, "user", userId] as const,
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
      mutationFn: async ({ userId, file }: { userId: number; file: File }) => {
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
         // O upload adiciona bytes ao bucket: atualiza as stats de storage.
         queryClient.invalidateQueries({
            queryKey: storageKeys.all,
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
            queryKey: storageKeys.all,
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
      mutationFn: async (ids: number[]) => deleteAtasOrfas(ids),
      onSuccess: () => {
         queryClient.invalidateQueries({
            queryKey: atasKeys.orfas(),
         });
         queryClient.invalidateQueries({
            queryKey: storageKeys.allBuckets(),
         });
      },
   });
}
