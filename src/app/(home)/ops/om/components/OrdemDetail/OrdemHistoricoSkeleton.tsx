"use client";

import { AuditTimelineSkeleton } from "@/components/audit/AuditTimelineSkeleton";

/**
 * Espelha a trilha do OrdemHistorico. A contagem de linhas é calibrada contra
 * a altura real medida: blocos de lista trazem a legenda e o respiro do
 * `space-y-1` além das linhas de mudança.
 */
export function OrdemHistoricoSkeleton() {
   return <AuditTimelineSkeleton linhasPorEvento={[2, 4, 2]} />;
}
