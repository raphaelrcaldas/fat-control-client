import {
   useQuery,
   useMutation,
   useQueryClient,
   keepPreviousData,
} from "@tanstack/react-query";
import {
   getAeronaves,
   createAeronave,
   updateAeronave,
   getOrgProjetos,
   type GetAeronavesParams,
   type AeronaveCreate,
   type AeronaveUpdate,
} from "services/routes/aeronaves";

export const aeronaveKeys = {
   all: ["aeronaves"] as const,
   lists: () => [...aeronaveKeys.all, "list"] as const,
   list: (filters?: GetAeronavesParams) =>
      [...aeronaveKeys.lists(), filters] as const,
   details: () => [...aeronaveKeys.all, "detail"] as const,
   detail: (matricula: string) =>
      [...aeronaveKeys.details(), matricula] as const,
   projetos: () => [...aeronaveKeys.all, "projetos"] as const,
};

export function useAeronaves(params?: GetAeronavesParams) {
   return useQuery({
      queryKey: aeronaveKeys.list(params),
      queryFn: ({ signal }) => getAeronaves(params, signal),
      placeholderData: keepPreviousData,
      // Lista de aeronaves é dado de referência: raramente muda e
      // quando muda (create/update/delete) as mutations abaixo
      // invalidam aeronaveKeys.lists() explicitamente. Sem isso,
      // toda página que monta o hook dispara um refetch.
      staleTime: Infinity,
   });
}

export function useOrgProjetos() {
   return useQuery({
      queryKey: aeronaveKeys.projetos(),
      queryFn: ({ signal }) => getOrgProjetos(signal),
      // Projetos da org mudam raramente (config de system-admin).
      staleTime: Infinity,
   });
}

export function useCreateAeronave() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: (data: AeronaveCreate) => createAeronave(data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: aeronaveKeys.lists() });
      },
   });
}

export function useUpdateAeronave() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: ({
         matricula,
         data,
      }: {
         matricula: string;
         data: AeronaveUpdate;
      }) => updateAeronave(matricula, data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: aeronaveKeys.lists() });
      },
   });
}
