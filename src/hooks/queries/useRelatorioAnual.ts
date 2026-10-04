import { useQuery } from "@tanstack/react-query";
import { getRelatorioAnual } from "services/routes/estatistica/relatorioAnual";
import { useAuth } from "@/app/context/auth";

export const relatorioAnualKeys = {
   all: ["relatorio-anual"] as const,
   detalhe: (org: string | null, tripId: number | null, ano: number) =>
      [...relatorioAnualKeys.all, org, tripId, ano] as const,
};

export function useRelatorioAnual(tripId: number | null, ano: number) {
   const { activeOrg } = useAuth();
   return useQuery({
      queryKey: relatorioAnualKeys.detalhe(activeOrg, tripId, ano),
      queryFn: ({ signal }) => getRelatorioAnual(tripId!, ano, signal),
      enabled: !!tripId && !!activeOrg,
      // Outra pessoa/ano recebe skeleton, nunca o relatorio anterior.
      staleTime: 60_000,
   });
}
