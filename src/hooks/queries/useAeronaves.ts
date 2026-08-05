import {
   useQuery,
   useMutation,
   useQueryClient,
   keepPreviousData,
} from "@tanstack/react-query";
import { ApiError } from "services/Api";
import {
   getAeronaves,
   getAllAeronaves,
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
   // Nasce sob o prefixo de aeronaveKeys.lists() (não de aeronaveKeys.list())
   // de propósito: garante que a invalidação de aeronaveKeys.lists() nas
   // mutations abaixo alcance também esta key, sem precisar tocar nelas. O
   // literal "all" evita colisão com list(undefined) (== [...lists(), undefined]).
   allList: (filters?: Omit<GetAeronavesParams, "page" | "per_page">) =>
      [...aeronaveKeys.lists(), "all", filters] as const,
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

/**
 * Frota inteira (esgota a paginação — ver getAllAeronaves), para telas que
 * precisam agregar sobre todas as aeronaves da org (ex.: resumo por
 * situação) sem se sujeitar ao teto de 100 por página do backend.
 */
export function useAllAeronaves(
   params?: Omit<GetAeronavesParams, "page" | "per_page">
) {
   return useQuery({
      queryKey: aeronaveKeys.allList(params),
      queryFn: ({ signal }) => getAllAeronaves(params, signal),
      // Mesma política de useAeronaves: dado de referência, raramente muda;
      // as mutations abaixo invalidam aeronaveKeys.lists(), prefixo de
      // aeronaveKeys.allList(), então esta query é invalidada junto.
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
      mutationFn: async (data: AeronaveCreate) => {
         const result = await createAeronave(data);
         if (!result.ok) {
            throw new ApiError(
               result.message ?? "Erro ao cadastrar aeronave",
               result.errors
            );
         }
         return result;
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: aeronaveKeys.lists() });
      },
   });
}

export function useUpdateAeronave() {
   const queryClient = useQueryClient();
   return useMutation({
      mutationFn: async ({
         matricula,
         data,
      }: {
         matricula: string;
         data: AeronaveUpdate;
      }) => {
         const result = await updateAeronave(matricula, data);
         if (!result.ok) {
            throw new ApiError(
               result.message ?? "Erro ao atualizar aeronave",
               result.errors
            );
         }
         return result;
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: aeronaveKeys.lists() });
      },
   });
}
