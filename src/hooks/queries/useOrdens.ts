import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
   listOrdens,
   getOrdem,
   createOrdem,
   updateOrdem,
   deleteOrdem,
   getRouteSuggestion,
   OrdemFilters,
   OrdemMissaoCreate,
   OrdemMissaoUpdate,
} from "services/routes/om/ordens";
import {
   listEtiquetas,
   createEtiqueta,
   updateEtiqueta,
   deleteEtiqueta,
   EtiquetaCreate,
   EtiquetaUpdate,
} from "services/routes/om/etiquetas";

// ========================================
// Query Keys - Centralizadas
// ========================================

export const ordemKeys = {
   all: ["ordens"] as const,
   lists: () => [...ordemKeys.all, "list"] as const,
   list: (filters?: OrdemFilters) => [...ordemKeys.lists(), filters] as const,
   details: () => [...ordemKeys.all, "detail"] as const,
   detail: (id: number) => [...ordemKeys.details(), id] as const,
   routeSuggestion: (origem: string, dest: string) =>
      [...ordemKeys.all, "route-suggestion", origem, dest] as const,
};

// ========================================
// Queries
// ========================================

/**
 * Lista paginada de ordens de missao com filtros
 */
export function useOrdens(filters?: OrdemFilters) {
   return useQuery({
      queryKey: ordemKeys.list(filters),
      queryFn: ({ signal }) => listOrdens(filters, signal),
   });
}

/**
 * Detalhes completos de uma ordem de missao
 * gcTime: 0 remove cache ao fechar, forcando novo fetch ao reabrir
 * Ideal para trabalho colaborativo
 */
export function useOrdem(id: number | null | undefined) {
   return useQuery({
      queryKey: ordemKeys.detail(id!),
      queryFn: () => getOrdem(id!),
      enabled: !!id,
      gcTime: 0,
   });
}

/**
 * Busca sugestao de rota baseada em missoes anteriores
 * Ativado apenas quando origem e destino tem 4 caracteres
 */
export function useRouteSuggestion(origem: string, dest: string) {
   const isValid = origem.length === 4 && dest.length === 4;

   return useQuery({
      queryKey: ordemKeys.routeSuggestion(origem, dest),
      queryFn: ({ signal }) => getRouteSuggestion(origem, dest, signal),
      enabled: isValid,
      staleTime: 5 * 60 * 1000, // 5 minutos - rotas nao mudam frequentemente
      gcTime: 10 * 60 * 1000, // 10 minutos
   });
}

// ========================================
// Mutations
// ========================================

/**
 * Criar nova ordem de missao
 */
export function useCreateOrdem() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (data: OrdemMissaoCreate) => createOrdem(data),
      onSuccess: () => {
         // Invalida todas as listas de ordens
         queryClient.invalidateQueries({ queryKey: ordemKeys.lists() });
      },
   });
}

/**
 * Atualizar ordem de missao existente
 */
export function useUpdateOrdem() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: ({ id, data }: { id: number; data: OrdemMissaoUpdate }) =>
         updateOrdem(id, data),
      onSuccess: (_, { id }) => {
         // Invalida o detalhe especifico e todas as listas
         queryClient.invalidateQueries({ queryKey: ordemKeys.detail(id) });
         queryClient.invalidateQueries({ queryKey: ordemKeys.lists() });
      },
   });
}

/**
 * Excluir ordem de missao
 */
export function useDeleteOrdem() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (id: number) => deleteOrdem(id),
      onSuccess: () => {
         // Invalida todas as listas de ordens
         queryClient.invalidateQueries({ queryKey: ordemKeys.lists() });
      },
   });
}

// ========================================
// Etiquetas - Query Keys
// ========================================

export const etiquetaKeys = {
   all: ["etiquetas"] as const,
   list: () => [...etiquetaKeys.all, "list"] as const,
};

// ========================================
// Etiquetas - Queries
// ========================================

/**
 * Lista de etiquetas disponiveis
 * Sem staleTime para suportar trabalho colaborativo
 */
export function useEtiquetas() {
   return useQuery({
      queryKey: etiquetaKeys.list(),
      queryFn: listEtiquetas,
   });
}

// ========================================
// Etiquetas - Mutations
// ========================================

/**
 * Criar nova etiqueta
 */
export function useCreateEtiqueta() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (data: EtiquetaCreate) => createEtiqueta(data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: etiquetaKeys.list() });
      },
   });
}

/**
 * Atualizar etiqueta existente
 */
export function useUpdateEtiqueta() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: ({ id, data }: { id: number; data: EtiquetaUpdate }) =>
         updateEtiqueta(id, data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: etiquetaKeys.list() });
      },
   });
}

/**
 * Excluir etiqueta de ordem de missão
 */
export function useDeleteEtiquetaOrdem() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (id: number) => deleteEtiqueta(id),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: etiquetaKeys.list() });
      },
   });
}
