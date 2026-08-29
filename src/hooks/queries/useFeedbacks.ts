import {
   keepPreviousData,
   useMutation,
   useQuery,
   useQueryClient,
} from "@tanstack/react-query";
import {
   getFeedbacks,
   updateFeedback,
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
