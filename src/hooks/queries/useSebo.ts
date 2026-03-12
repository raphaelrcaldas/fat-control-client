import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getSebo, type GetSeboParams } from "services/routes/estatistica/sebo";

export const seboKeys = {
   all: ["sebo"] as const,
   lists: () => [...seboKeys.all, "list"] as const,
   list: (params?: GetSeboParams) => [...seboKeys.lists(), params] as const,
};

export function useSebo(params: GetSeboParams) {
   return useQuery({
      queryKey: seboKeys.list(params),
      queryFn: ({ signal }) => getSebo(params, signal),
      placeholderData: keepPreviousData,
   });
}
