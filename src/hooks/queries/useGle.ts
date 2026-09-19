import {
   keepPreviousData,
   useMutation,
   useQuery,
   useQueryClient,
} from "@tanstack/react-query";

import { ApiError } from "services/Api";
import {
   createLocalidade,
   deleteLocalidade,
   getLocalidades,
   updateLocalidade,
   type GetLocEspParams,
   type LocEspCreate,
   type LocEspUpdate,
} from "services/routes/cegep/gle";
import {
   pesquisarMissoes,
   type PesquisaLocEspParams,
} from "services/routes/cegep/glePesquisa";
import {
   createMissao,
   deleteMissao,
   getMissao,
   getMissoes,
   updateMissao,
   type MissaoGleInput,
} from "services/routes/cegep/gleMissoes";

export const gleKeys = {
   all: ["gle"] as const,
   lists: () => [...gleKeys.all, "list"] as const,
   list: (filters?: GetLocEspParams) => [...gleKeys.lists(), filters] as const,
   pesquisas: () => [...gleKeys.all, "pesquisa"] as const,
   missoes: () => [...gleKeys.all, "missao"] as const,
   missaoLista: () => [...gleKeys.missoes(), "list"] as const,
   missao: (id: number) => [...gleKeys.missoes(), id] as const,
   pesquisa: (filters?: PesquisaLocEspParams) =>
      [...gleKeys.pesquisas(), filters] as const,
};

/**
 * Missões que passaram por localidade especial.
 *
 * `staleTime` menor que o da lista de referência: etapa é lançada todo dia,
 * a classificação da localidade quase nunca muda.
 */
export function usePesquisaLocEsp(
   params?: PesquisaLocEspParams,
   options?: { enabled?: boolean }
) {
   return useQuery({
      queryKey: gleKeys.pesquisa(params),
      queryFn: ({ signal }) => pesquisarMissoes(params, signal),
      placeholderData: keepPreviousData,
      staleTime: 60 * 1000,
      // `enabled` para a tela não chamar um endpoint que sabe que vai
      // receber 403 — o motivo é mostrado sem ida à rede.
      enabled: options?.enabled ?? true,
   });
}

/**
 * Lista as localidades especiais.
 *
 * `staleTime` alto de propósito: é tabela de referência nacional, que muda
 * quando alguém edita — e nesse caso a mutation invalida. Refetch a cada
 * foco de janela só gastaria rede.
 */
export function useLocalidades(params?: GetLocEspParams) {
   return useQuery({
      queryKey: gleKeys.list(params),
      queryFn: ({ signal }) => getLocalidades(params, signal),
      placeholderData: keepPreviousData,
      staleTime: 5 * 60 * 1000,
   });
}

export function useCreateLocalidade() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: async (data: LocEspCreate) => {
         const result = await createLocalidade(data);
         if (!result.ok) {
            throw new ApiError(
               result.message || "Erro ao criar localidade",
               result.errors
            );
         }
         return result;
      },
      onSuccess: () => {
         // Raiz, não `lists()`: `pesquisas()` é chave irmã, não
         // descendente, e editar ICAO muda quais etapas a pesquisa casa.
         queryClient.invalidateQueries({ queryKey: gleKeys.all });
      },
   });
}

export function useUpdateLocalidade() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: async ({ id, data }: { id: number; data: LocEspUpdate }) => {
         const result = await updateLocalidade(id, data);
         if (!result.ok) {
            throw new ApiError(
               result.message || "Erro ao atualizar localidade",
               result.errors
            );
         }
         return result;
      },
      onSuccess: () => {
         // Raiz, não `lists()`: `pesquisas()` é chave irmã, não
         // descendente, e editar ICAO muda quais etapas a pesquisa casa.
         queryClient.invalidateQueries({ queryKey: gleKeys.all });
      },
   });
}

export function useDeleteLocalidade() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: async (id: number) => {
         const result = await deleteLocalidade(id);
         if (!result.ok) {
            throw new ApiError(
               result.message || "Erro ao remover localidade",
               result.errors
            );
         }
         return result;
      },
      onSuccess: () => {
         // Raiz, não `lists()`: `pesquisas()` é chave irmã, não
         // descendente, e editar ICAO muda quais etapas a pesquisa casa.
         queryClient.invalidateQueries({ queryKey: gleKeys.all });
      },
   });
}

/** Missões de GLE salvas da organização ativa. */
export function useMissoesGle() {
   return useQuery({
      queryKey: gleKeys.missaoLista(),
      queryFn: ({ signal }) => getMissoes(signal),
      staleTime: 30 * 1000,
   });
}

/**
 * Uma missão salva, já apurada.
 *
 * O valor não vem gravado: o backend recalcula a cada leitura a partir dos
 * trechos e do soldo vigente, então esta query é a fonte do número exibido.
 */
export function useMissaoGle(id: number | null) {
   return useQuery({
      queryKey: gleKeys.missao(id!),
      queryFn: ({ signal }) => getMissao(id!, signal),
      enabled: id !== null,
   });
}

export function useCreateMissaoGle() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: async (data: MissaoGleInput) => {
         const result = await createMissao(data);
         if (!result.ok) {
            throw new ApiError(
               result.message || "Erro ao criar missão",
               result.errors
            );
         }
         return result.data!;
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: gleKeys.missoes() });
      },
   });
}

export function useUpdateMissaoGle() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: async ({
         id,
         data,
      }: {
         id: number;
         data: MissaoGleInput;
      }) => {
         const result = await updateMissao(id, data);
         if (!result.ok) {
            throw new ApiError(
               result.message || "Erro ao salvar missão",
               result.errors
            );
         }
         return result.data!;
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: gleKeys.missoes() });
      },
   });
}

export function useDeleteMissaoGle() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: async (id: number) => {
         const result = await deleteMissao(id);
         if (!result.ok) {
            throw new ApiError(
               result.message || "Erro ao remover missão",
               result.errors
            );
         }
         return result;
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: gleKeys.missoes() });
      },
   });
}
