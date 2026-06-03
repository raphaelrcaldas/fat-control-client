import {
   useQuery,
   useMutation,
   useQueryClient,
   keepPreviousData,
} from "@tanstack/react-query";
import {
   getQuads,
   getQuadById,
   getQuadsType,
   getQuadsOrfaos,
   deleteQuadsOrfaos,
   addQuad,
   updateQuad,
   deleteQuad,
   createQuadsGroup,
   updateQuadsGroup,
   deleteQuadsGroup,
   createQuadsType,
   updateQuadsType,
   deleteQuadsType,
   setQuadsTypeFuncs,
   QuadParams,
   Quad,
   QuadGroupPayload,
   QuadTypePayload,
} from "services/routes/quads";

// ========================================
// Query Keys - Centralizadas
// ========================================

export const quadKeys = {
   all: ["quads"] as const,
   lists: () => [...quadKeys.all, "list"] as const,
   list: (filters?: QuadParams) => [...quadKeys.lists(), filters] as const,
   types: () => [...quadKeys.all, "types"] as const,
   details: () => [...quadKeys.all, "detail"] as const,
   detail: (tripId: number, typeId: number) =>
      [...quadKeys.details(), tripId, typeId] as const,
   orfaos: () => [...quadKeys.all, "orfaos"] as const,
};

// ========================================
// Queries
// ========================================

/**
 * Lista de quads com filtros (função + tipo + uae + proj)
 */
export function useQuads(params?: QuadParams) {
   return useQuery({
      queryKey: quadKeys.list(params),
      queryFn: () => getQuads(params!),
      placeholderData: keepPreviousData,
      enabled: !!(params?.funcao && params?.tipo_quad),
      staleTime: 0,
   });
}

/**
 * Quads de um tripulante específico por tipo
 */
export function useQuadsByTrip(
   tripId: number | undefined,
   typeId: number | undefined,
   enabled: boolean = true
) {
   return useQuery({
      queryKey: quadKeys.detail(tripId!, typeId!),
      queryFn: () => getQuadById(tripId!, typeId!),
      enabled: enabled && !!tripId && !!typeId,
      staleTime: 0,
   });
}

/**
 * Tipos de quadrinhos disponíveis na org ativa (do token)
 */
export function useQuadsTypes() {
   return useQuery({
      queryKey: quadKeys.types(),
      queryFn: () => getQuadsType(),
      staleTime: 0,
   });
}

/**
 * Lista de quadrinhos órfãos (de tripulantes desativados da org ativa).
 * A query roda sempre que o componente monta — o componente só deve ser
 * montado para quem tem permissão de gerenciamento (quad_ops.create).
 */
export function useQuadsOrfaos() {
   return useQuery({
      queryKey: quadKeys.orfaos(),
      queryFn: ({ signal }) => getQuadsOrfaos(signal),
      staleTime: 0,
   });
}

// ========================================
// Mutations
// ========================================

/**
 * Criar novo(s) quad(s)
 */
export function useCreateQuad() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (data: Quad[]) => addQuad(data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: quadKeys.lists() });
         queryClient.invalidateQueries({ queryKey: quadKeys.details() });
      },
   });
}

/**
 * Atualizar quad existente
 */
export function useUpdateQuad() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (data: Quad) => updateQuad(data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: quadKeys.lists() });
         queryClient.invalidateQueries({ queryKey: quadKeys.details() });
      },
   });
}

/**
 * Deletar quad(s) - aceita array de IDs para delete em lote
 */
export function useDeleteQuad() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (ids: number[]) => deleteQuad(ids),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: quadKeys.lists() });
         queryClient.invalidateQueries({ queryKey: quadKeys.details() });
      },
   });
}

/**
 * Limpar quadrinhos órfãos (de tripulantes desativados) por seleção parcial.
 * Recebe os IDs dos tripulantes a serem limpos.
 */
export function useDeleteQuadsOrfaos() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async (trip_ids: number[]) => {
         const result = await deleteQuadsOrfaos(trip_ids);
         if (!result.ok) {
            throw new Error(
               result.message || "Erro ao limpar quadrinhos órfãos"
            );
         }
         return result;
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: quadKeys.orfaos() });
         queryClient.invalidateQueries({ queryKey: quadKeys.lists() });
      },
   });
}

// ========================================
// Mutations - Gerenciamento da estrutura (Grupo / Tipo / Função)
// ========================================

/**
 * Invalida a estrutura de quadrinhos (tipos) e as listas que dependem dela.
 */
function useInvalidateQuadsStructure() {
   const queryClient = useQueryClient();
   return () => {
      queryClient.invalidateQueries({ queryKey: quadKeys.types() });
      queryClient.invalidateQueries({ queryKey: quadKeys.lists() });
   };
}

export function useCreateQuadsGroup() {
   const invalidate = useInvalidateQuadsStructure();
   return useMutation({
      mutationFn: (data: QuadGroupPayload) => createQuadsGroup(data),
      onSuccess: invalidate,
   });
}

export function useUpdateQuadsGroup() {
   const invalidate = useInvalidateQuadsStructure();
   return useMutation({
      mutationFn: ({
         groupId,
         data,
      }: {
         groupId: number;
         data: Partial<QuadGroupPayload>;
      }) => updateQuadsGroup(groupId, data),
      onSuccess: invalidate,
   });
}

export function useDeleteQuadsGroup() {
   const invalidate = useInvalidateQuadsStructure();
   return useMutation({
      mutationFn: (groupId: number) => deleteQuadsGroup(groupId),
      onSuccess: invalidate,
   });
}

export function useCreateQuadsType() {
   const invalidate = useInvalidateQuadsStructure();
   return useMutation({
      mutationFn: ({
         groupId,
         data,
      }: {
         groupId: number;
         data: QuadTypePayload;
      }) => createQuadsType(groupId, data),
      onSuccess: invalidate,
   });
}

export function useUpdateQuadsType() {
   const invalidate = useInvalidateQuadsStructure();
   return useMutation({
      mutationFn: ({
         typeId,
         data,
      }: {
         typeId: number;
         data: Partial<QuadTypePayload>;
      }) => updateQuadsType(typeId, data),
      onSuccess: invalidate,
   });
}

export function useDeleteQuadsType() {
   const invalidate = useInvalidateQuadsStructure();
   return useMutation({
      mutationFn: (typeId: number) => deleteQuadsType(typeId),
      onSuccess: invalidate,
   });
}

export function useSetQuadsTypeFuncs() {
   const invalidate = useInvalidateQuadsStructure();
   return useMutation({
      mutationFn: ({ typeId, funcs }: { typeId: number; funcs: string[] }) =>
         setQuadsTypeFuncs(typeId, funcs),
      onSuccess: invalidate,
   });
}
