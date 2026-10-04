import { useQuery } from "@tanstack/react-query";
import { getRelatorioMensal } from "services/routes/estatistica/relatorioMensal";
import { useAuth } from "@/app/context/auth";

export const relatorioMensalKeys = {
   all: ["relatorio-mensal"] as const,
   detalhe: (
      org: string | null,
      tripId: number | null,
      ano: number,
      mes: number
   ) => [...relatorioMensalKeys.all, org, tripId, ano, mes] as const,
};

export function useRelatorioMensal(
   tripId: number | null,
   ano: number,
   mes: number
) {
   const { activeOrg } = useAuth();
   return useQuery({
      queryKey: relatorioMensalKeys.detalhe(activeOrg, tripId, ano, mes),
      queryFn: ({ signal }) => getRelatorioMensal(tripId!, ano, mes, signal),
      enabled: Number.isInteger(tripId) && Number(tripId) > 0 && !!activeOrg,
      // Outra pessoa/mês recebe skeleton, nunca o relatório anterior.
      staleTime: 60_000,
   });
}
