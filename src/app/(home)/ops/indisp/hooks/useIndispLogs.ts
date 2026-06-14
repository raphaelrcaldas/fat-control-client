import { useUserActionLogs } from "@/hooks/queries";

/**
 * Logs de alteração de uma indisponibilidade (histórico do form).
 * Substitui o fetch imperativo por TanStack Query (cache/dedupe).
 */
export function useIndispLogs(
   indispId: number | null | undefined,
   enabled: boolean
) {
   const { data, isLoading } = useUserActionLogs(
      { resource: "indisp", resource_id: indispId ?? undefined },
      enabled && !!indispId
   );

   return { logs: data ?? [], isLoading };
}
