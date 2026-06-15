interface DesadaptadoBadgeProps {
   dsvDias: number | null;
}

export function DesadaptadoBadge({ dsvDias }: DesadaptadoBadgeProps) {
   const stripes =
      "bg-[repeating-linear-gradient(135deg,var(--color-amber-400)_0_6px,var(--color-amber-500)_6px_12px)]";

   return (
      <div
         className="relative inline-flex items-center gap-1.5 overflow-hidden rounded-md border border-amber-600/40 px-2 py-0.5 text-[10px] font-bold tracking-widest text-amber-900 uppercase shadow-sm"
         title="Tripulante desadaptado (45+ dias sem voo operacional)"
      >
         <span
            className={`absolute inset-y-0 left-0 w-1.5 ${stripes}`}
            aria-hidden="true"
         />
         <span className="ml-2 inline-flex h-1.5 w-1.5 rounded-full bg-amber-700" />
         <span>Desadaptado</span>
         {dsvDias !== null && (
            <span className="ml-0.5 font-mono text-[9px] font-medium tabular-nums opacity-80">
               {dsvDias} dsv
            </span>
         )}
      </div>
   );
}
