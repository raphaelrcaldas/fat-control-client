import { useQuery } from "@tanstack/react-query";
import { getMet } from "services/aisweb/metar";

export const metarKeys = {
   all: ["metar"] as const,
   detail: () => [...metarKeys.all, "detail"] as const,
};

export function useMetar() {
   return useQuery({
      queryKey: metarKeys.detail(),
      queryFn: ({ signal }) => getMet(signal),
      staleTime: 30 * 60_000,
      refetchInterval: 30 * 60_000,
      retry: 2,
   });
}
