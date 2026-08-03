import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
   getIndicadores,
   type IndicadoresResponse,
} from "services/routes/estatistica/indicadores";

export const indicadoresKeys = {
   all: ["indicadores"] as const,
   painel: (anoRef: number, projeto?: string) =>
      [...indicadoresKeys.all, "painel", anoRef, projeto ?? "todos"] as const,
};

export function useIndicadores(anoRef: number, projeto?: string) {
   return useQuery<IndicadoresResponse>({
      queryKey: indicadoresKeys.painel(anoRef, projeto),
      queryFn: ({ signal }) =>
         getIndicadores({ ano_ref: anoRef, projeto }, signal),
      // Troca de ano/projeto mantém o painel anterior em tela.
      placeholderData: keepPreviousData,
      // Consulta cara: 7 agregações no backend, 7 round trips até o
      // Supabase. Os 60s do default global fariam a ida-e-volta a outra
      // página recarregar tudo. As edições da própria sessão continuam
      // imediatas porque as mutations de etapa invalidam `indicadoresKeys`
      // (useEtapas.ts, useMissaoActions.ts) — os 5 min só limitam o
      // atraso para edições feitas por OUTRA pessoa.
      staleTime: 5 * 60 * 1000,
      // Precisa ser maior que o staleTime: com o gcTime global de 5 min o
      // cache seria descartado ao desmontar e o staleTime não valeria nada.
      gcTime: 30 * 60 * 1000,
   });
}
