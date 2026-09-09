"use client";

/**
 * Esqueleto das trilhas de auditoria: linha vertical, bolinha por evento e, à
 * direita, carimbo, título e linhas de mudança.
 *
 * As medidas repetem as do tema compartilhado (`timelineTheme.ts`): `border-l`
 * na lista, `mb-4 ml-4` por item e a bolinha `h-3 w-3` em `-left-1.5`. **Ao
 * mexer no tema, mexa aqui junto** — senão o esqueleto passa a mentir sobre a
 * altura e volta o salto que ele existe para evitar.
 *
 * Mora em `components/audit/` porque as quatro trilhas carregam do mesmo jeito;
 * cada tela só escolhe quantos eventos finge enquanto espera.
 */
export interface AuditTimelineSkeletonProps {
   /**
    * Linhas de mudança por evento fingido. Padrão **fixo**, nunca aleatório:
    * aleatório causa flicker e divergência de hidratação. O comprimento do
    * array é o número de eventos.
    */
   linhasPorEvento?: number[];
   /** Anunciado a quem usa leitor de tela. */
   label?: string;
}

export function AuditTimelineSkeleton({
   linhasPorEvento = [2, 4, 2],
   label = "Carregando histórico",
}: AuditTimelineSkeletonProps) {
   return (
      <div role="status" aria-live="polite" className="animate-pulse">
         <span className="sr-only">{label}…</span>
         <ol aria-hidden className="relative border-l border-slate-300">
            {linhasPorEvento.map((linhas, index) => (
               <li key={index} className="mb-4 ml-4">
                  <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-slate-200" />
                  <div className="mb-0.5 h-3 w-28 rounded bg-slate-100" />
                  <div className="h-3.5 w-44 rounded bg-slate-200" />
                  <div className="mt-2 space-y-1">
                     {Array.from({ length: linhas }).map((_, linha) => (
                        <div
                           key={linha}
                           className="h-3.5 w-full max-w-sm rounded bg-slate-100"
                        />
                     ))}
                  </div>
               </li>
            ))}
         </ol>
      </div>
   );
}
