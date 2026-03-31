import { useQuery } from "@tanstack/react-query";
import { getSolHoje } from "services/aisweb/sol";

export const solKeys = {
   all: ["sol"] as const,
   hoje: () => [...solKeys.all, "hoje"] as const,
};

export function useSolHoje() {
   return useQuery({
      queryKey: solKeys.hoje(),
      queryFn: ({ signal }) => getSolHoje(signal),
      staleTime: 12 * 60 * 60_000, // 12h — muda só uma vez por dia
      retry: 2,
   });
}
