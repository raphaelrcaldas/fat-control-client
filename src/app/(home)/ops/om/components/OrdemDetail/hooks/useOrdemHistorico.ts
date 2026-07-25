"use client";

import { useMemo } from "react";
import { useUserActionLogs } from "@/hooks/queries/useLogs";
import {
   buildOrdemHistoricoEvents,
   type OrdemHistoricoEvent,
} from "../utils/ordemHistorico";

/** Nome do recurso gravado nos logs pelo router de OM (`routers/ops/om.py`). */
export const ORDEM_MISSAO_LOG_RESOURCE = "ordem_missao";

interface UseOrdemHistoricoResult {
   events: OrdemHistoricoEvent[];
   isLoading: boolean;
   isError: boolean;
   /** Em erro o TanStack Query não retenta sozinho: a UI precisa oferecer saída. */
   refetch: () => void;
}

/**
 * Histórico de auditoria de uma OM: busca os logs do recurso e os converte em
 * eventos com diff item a item. Só consulta quando há OM salva — na tela de
 * criação não existe `resource_id` para filtrar.
 */
export function useOrdemHistorico(
   ordemId: number | null | undefined
): UseOrdemHistoricoResult {
   const enabled = typeof ordemId === "number" && ordemId > 0;

   const { data, isLoading, isError, refetch } = useUserActionLogs(
      {
         resource: ORDEM_MISSAO_LOG_RESOURCE,
         resource_id: enabled ? ordemId : undefined,
      },
      enabled
   );

   const events = useMemo(() => buildOrdemHistoricoEvents(data ?? []), [data]);

   return { events, isLoading: enabled && isLoading, isError, refetch };
}
