import {
   keepPreviousData,
   useMutation,
   useQuery,
   useQueryClient,
} from "@tanstack/react-query";
import {
   addFeedback,
   deleteFeedback,
   getFeedbacks,
   updateFeedback,
   type FeedbackCreate,
   type FeedbackUpdate,
   type GetFeedbacksParams,
} from "services/routes/feedbacks";

export const feedbackKeys = {
   all: ["feedbacks"] as const,
   lists: () => [...feedbackKeys.all, "list"] as const,
   list: (params?: GetFeedbacksParams) =>
      [...feedbackKeys.lists(), params] as const,
};

export function useFeedbacks(params?: GetFeedbacksParams) {
   return useQuery({
      queryKey: feedbackKeys.list(params),
      queryFn: ({ signal }) => getFeedbacks(params, signal),
      placeholderData: keepPreviousData,
      staleTime: 60_000,
   });
}

export function useAddFeedback() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async (data: FeedbackCreate) => {
         const result = await addFeedback(data);
         if (!result.ok) {
            throw new Error(result.message || "Erro ao enviar feedback");
         }
         return result;
      },
      // Invalida a caixa do admin: quem trata pode estar com a lista aberta
      // noutra aba, e o envio do próprio admin apareceria só no refetch.
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: feedbackKeys.lists() });
      },
   });
}

export function useUpdateFeedback() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async ({
         id,
         data,
      }: {
         id: number;
         data: FeedbackUpdate;
      }) => {
         const result = await updateFeedback(id, data);
         if (!result.ok) {
            throw new Error(result.message || "Erro ao atualizar feedback");
         }
         return result;
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: feedbackKeys.lists() });
      },
   });
}

export function useDeleteFeedback() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async (id: number) => {
         const result = await deleteFeedback(id);
         if (!result.ok) {
            throw new Error(result.message || "Erro ao excluir feedback");
         }
         return result;
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: feedbackKeys.lists() });
      },
   });
}
