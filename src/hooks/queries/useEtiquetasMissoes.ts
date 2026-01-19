import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
   getEtiquetas,
   createUpdateEtiqueta,
   deleteEtiquetaApi,
   Etiqueta,
} from "services/routes/cegep/missoes";
import { missaoKeys } from "./useMissoes";

// ========================================
// Query Keys - Centralizadas
// ========================================

export const etiquetaMissaoKeys = {
   all: ["etiquetas-missoes"] as const,
   list: () => [...etiquetaMissaoKeys.all, "list"] as const,
};

// ========================================
// Queries
// ========================================

/**
 * Lista de etiquetas de missoes
 * staleTime de 5 minutos pois etiquetas mudam pouco
 */
export function useEtiquetasMissoes() {
   return useQuery({
      queryKey: etiquetaMissaoKeys.list(),
      queryFn: ({ signal }) => getEtiquetas(signal),
      staleTime: 5 * 60 * 1000,
   });
}

// ========================================
// Mutations
// ========================================

/**
 * Criar ou atualizar etiqueta (unificado conforme API backend)
 */
export function useCreateUpdateEtiqueta() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (data: Etiqueta) => createUpdateEtiqueta(data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: etiquetaMissaoKeys.list() });
      },
   });
}

/**
 * Excluir etiqueta
 */
export function useDeleteEtiqueta() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (id: number) => deleteEtiquetaApi(id),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: etiquetaMissaoKeys.list() });
         // Invalida listas de missoes tambem (etiquetas podem aparecer la)
         queryClient.invalidateQueries({ queryKey: missaoKeys.lists() });
      },
   });
}
