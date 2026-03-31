import { useQuery } from "@tanstack/react-query";
import { getRotaer } from "services/aisweb/rotaer";

export const rotaerKeys = {
   all: ["rotaer"] as const,
   detail: (icao: string) => [...rotaerKeys.all, icao] as const,
};

export function useRotaer(icao: string) {
   return useQuery({
      queryKey: rotaerKeys.detail(icao),
      queryFn: ({ signal }) => getRotaer(icao, signal),
      enabled: icao.length > 0,
      staleTime: 24 * 60 * 60_000, // 24h — dados do aeródromo mudam raramente
      retry: 1,
   });
}
