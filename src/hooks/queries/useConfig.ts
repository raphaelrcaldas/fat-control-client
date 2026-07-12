import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
   getCargos,
   setCargo,
   deleteCargo,
   type Cargo,
} from "services/routes/config";

// ========================================
// Query Keys
// ========================================

// A org é implícita (org ativa do token), mas entra na key: trocar de org no
// OrgSwitcher tem de trocar o cache, não reaproveitar os cargos da anterior.
export const configKeys = {
   all: ["config"] as const,
   cargos: (activeOrg: string | null) =>
      [...configKeys.all, "cargos", activeOrg ?? "sistema"] as const,
};

// ========================================
// Queries
// ========================================

export function useCargos(activeOrg: string | null) {
   return useQuery({
      queryKey: configKeys.cargos(activeOrg),
      queryFn: getCargos,
      // Contexto Sistema não tem org ativa — o backend responde 400.
      enabled: !!activeOrg,
   });
}

// ========================================
// Mutations
// ========================================

export function useSetCargo(activeOrg: string | null) {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: ({ cargo, userId }: { cargo: Cargo; userId: number }) =>
         setCargo(cargo, userId),
      onSuccess: () => {
         queryClient.invalidateQueries({
            queryKey: configKeys.cargos(activeOrg),
         });
      },
   });
}

export function useDeleteCargo(activeOrg: string | null) {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (cargo: Cargo) => deleteCargo(cargo),
      onSuccess: () => {
         queryClient.invalidateQueries({
            queryKey: configKeys.cargos(activeOrg),
         });
      },
   });
}
