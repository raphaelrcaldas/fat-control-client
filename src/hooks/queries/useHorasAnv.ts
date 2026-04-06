import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
   getHorasAnv,
   type AnvHorasResponse,
} from "services/routes/estatistica/horasAnv";

export const horasAnvKeys = {
   all: ["horasAnv"] as const,
   resumo: (anoRef: number) => [...horasAnvKeys.all, "resumo", anoRef] as const,
};

export function useHorasAnv(anoRef: number) {
   return useQuery<AnvHorasResponse>({
      queryKey: horasAnvKeys.resumo(anoRef),
      queryFn: ({ signal }) => getHorasAnv(anoRef, signal),
      placeholderData: keepPreviousData,
   });
}
