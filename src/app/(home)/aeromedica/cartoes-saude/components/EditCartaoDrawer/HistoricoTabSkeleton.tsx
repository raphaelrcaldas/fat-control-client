"use client";

import { AuditTimelineSkeleton } from "@/components/audit/AuditTimelineSkeleton";

/** Espelha a trilha do HistoricoTab enquanto os logs carregam. */
export default function HistoricoTabSkeleton() {
   return <AuditTimelineSkeleton linhasPorEvento={[2, 2, 3]} />;
}
