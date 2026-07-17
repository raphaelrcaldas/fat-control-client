import {
   useQuery,
   useMutation,
   useQueryClient,
   keepPreviousData,
} from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import {
   getPassaportes,
   upsertPassaporte,
   deletePassaporte,
   uploadPassaporteImagem,
   deletePassaporteImagem,
   getPassaportesOrfaos,
   deletePassaportesOrfaos,
   PassaporteUpsert,
   GetPassaportesParams,
   PassaportePublic,
   TripPassaporteOut,
} from "services/routes/inteligencia/passaportes";
import { storageKeys } from "./useStorage";

type TipoImagem = "passaporte" | "visa";

export const passaportesKeys = {
   all: ["passaportes"] as const,
   lists: () => [...passaportesKeys.all, "list"] as const,
   list: (params?: GetPassaportesParams) =>
      [...passaportesKeys.lists(), params] as const,
   orfaos: () => [...passaportesKeys.all, "orfaos"] as const,
};

/**
 * Atualização cirúrgica do cache: as operações de imagem afetam apenas um
 * tripulante e a lista nem exibe imagens, então em vez de invalidar (refetch
 * da lista inteira) só substituímos o `passaporte` daquela linha em todas as
 * listas em cache, com o registro atualizado que o backend devolve.
 */
function patchPassaporteInLists(
   queryClient: QueryClient,
   tripId: number,
   passaporte: PassaportePublic
) {
   queryClient.setQueriesData<TripPassaporteOut[]>(
      { queryKey: passaportesKeys.lists() },
      (old) =>
         old?.map((item) =>
            item.trip_id === tripId ? { ...item, passaporte } : item
         )
   );
}

export function usePassaportes(params?: GetPassaportesParams) {
   return useQuery({
      queryKey: passaportesKeys.list(params),
      queryFn: ({ signal }) => getPassaportes(params, signal),
      placeholderData: keepPreviousData,
      staleTime: 5 * 60_000,
   });
}

export function useUpsertPassaporte() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async ({
         trip_id,
         data,
      }: {
         trip_id: number;
         data: PassaporteUpsert;
      }) => {
         const result = await upsertPassaporte(trip_id, data);
         if (!result.ok) {
            throw new Error(result.message || "Erro ao salvar passaporte");
         }
         return result;
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: passaportesKeys.lists() });
      },
   });
}

export function useDeletePassaporte() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async (trip_id: number) => {
         const result = await deletePassaporte(trip_id);
         if (!result.ok) {
            throw new Error(result.message || "Erro ao remover passaporte");
         }
         return result;
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: passaportesKeys.lists() });
      },
   });
}

export function useUploadPassaporteImagem() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: ({
         trip_id,
         tipo,
         file,
      }: {
         trip_id: number;
         tipo: TipoImagem;
         file: File;
      }) => uploadPassaporteImagem(trip_id, tipo, file),
      onSuccess: (passaporte, { trip_id }) => {
         patchPassaporteInLists(queryClient, trip_id, passaporte);
      },
   });
}

export function useDeletePassaporteImagem() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: ({ trip_id, tipo }: { trip_id: number; tipo: TipoImagem }) =>
         deletePassaporteImagem(trip_id, tipo),
      onSuccess: (passaporte, { trip_id }) => {
         patchPassaporteInLists(queryClient, trip_id, passaporte);
      },
   });
}

export function usePassaportesOrfaos(enabled = true) {
   return useQuery({
      queryKey: passaportesKeys.orfaos(),
      queryFn: ({ signal }) => getPassaportesOrfaos(signal),
      staleTime: 60_000,
      enabled,
   });
}

export function useDeletePassaportesOrfaos() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (user_ids: number[]) => deletePassaportesOrfaos(user_ids),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: passaportesKeys.orfaos() });
         queryClient.invalidateQueries({ queryKey: passaportesKeys.lists() });
         queryClient.invalidateQueries({ queryKey: storageKeys.all });
      },
   });
}
