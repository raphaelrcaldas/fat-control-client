interface ScopeBadgeProps {
   organizacaoId: string | null;
}

/** Chip de escopo do vínculo: unidade (sigla) ou "Sistema" (org NULL). */
export function ScopeBadge({ organizacaoId }: ScopeBadgeProps) {
   if (!organizacaoId) {
      return (
         <span className="inline-flex items-center rounded bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-700">
            Sistema
         </span>
      );
   }

   return (
      <span className="inline-flex items-center rounded bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 uppercase">
         {organizacaoId}
      </span>
   );
}
