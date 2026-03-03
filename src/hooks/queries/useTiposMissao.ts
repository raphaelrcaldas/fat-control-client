import { useQuery } from "@tanstack/react-query";
import { getTiposMissao } from "services/routes/estatistica/tiposMissao";

export const tipoMissaoKeys = {
   all: ["tiposMissao"] as const,
   list: () => [...tipoMissaoKeys.all, "list"] as const,
};

export function useTiposMissao() {
   return useQuery({
      queryKey: tipoMissaoKeys.list(),
      queryFn: ({ signal }) => getTiposMissao(signal),
      staleTime: 5 * 60 * 1000,
   });
}
