import { useUserActionLogs } from "@/hooks/queries";

/**
 * Logs de alteração de uma indisponibilidade (histórico do form).
 * Substitui o fetch imperativo por TanStack Query (cache/dedupe).
 */
export function useIndispLogs(
   indispId: number | null | undefined,
   enabled: boolean
) {
   const { data, isLoading, isError, refetch } = useUserActionLogs(
      { resource: "ops.indisp", resource_id: indispId ?? undefined },
      enabled && !!indispId
   );

   // `isError` sobe junto: sem ele, a falha de carga caía em `logs: []` e o
   // histórico se escondia como se o registro nunca tivesse sido alterado —
   // exatamente o que não pode acontecer numa trilha de auditoria.
   return { logs: data ?? [], isLoading, isError, refetch };
}
