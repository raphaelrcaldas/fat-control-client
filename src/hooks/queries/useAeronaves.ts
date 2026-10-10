import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "services/Api";
import {
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
   // Sob o prefixo de aeronaveKeys.lists(): a invalidação de lists() nas
   // mutations abaixo alcança esta key.
   allList: (filters?: Omit<GetAeronavesParams, "page" | "per_page">) =>
      [...aeronaveKeys.lists(), "all", filters] as const,
   projetos: () => [...aeronaveKeys.all, "projetos"] as const,
};

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
      // As mutations abaixo invalidam aeronaveKeys.lists(), prefixo de
      // aeronaveKeys.allList(). Mas a situação da aeronave é global e outra
      // org pode alterá-la: com `Infinity` um quadro aberto o dia todo nunca
      // via a mudança. 5 min + refetch ao voltar para a aba (o global
      // desliga o refetch por foco).
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
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
