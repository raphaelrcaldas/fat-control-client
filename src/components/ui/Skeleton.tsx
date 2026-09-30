"use client";

import clsx from "clsx";

interface SkeletonProps {
   className?: string;
}

// Primitive de BLOCO: não leva `role="status"` (o anúncio se repetiria a cada
// bloco). Quem monta a área carregando põe `role="status"` + texto `sr-only`
// no container e `aria-hidden` nos blocos.
export function Skeleton({ className }: SkeletonProps) {
   return (
      <div
         className={clsx(
            "animate-pulse rounded bg-slate-200 dark:bg-slate-700",
            className
         )}
      />
   );
}
