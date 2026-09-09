"use client";

import { Button, Timeline } from "flowbite-react";
import { HiClock, HiExclamationCircle } from "react-icons/hi";
import { TIMELINE_DENSO } from "@/components/audit/timelineTheme";
import { FormSection } from "./FormSection";
import { OrdemHistoricoItem } from "./OrdemHistoricoItem";
import { OrdemHistoricoSkeleton } from "./OrdemHistoricoSkeleton";
import { useOrdemHistorico } from "./hooks/useOrdemHistorico";

interface OrdemHistoricoProps {
   /** Id da OM já salva — a seção não existe na tela de criação. */
   ordemId: number;
}

/**
 * Seção "Histórico" da OM: eventos de auditoria em ordem cronológica, com
 * diff item a item das listas (tripulação, etapas, ordens especiais e
 * etiquetas). Sempre expandida, ao final do formulário.
 */
export function OrdemHistorico({ ordemId }: OrdemHistoricoProps) {
   const { events, isLoading, isError, refetch } = useOrdemHistorico(ordemId);

   return (
      <FormSection
         title="Histórico"
         accentClass="bg-slate-400"
         action={
            events.length > 0 ? (
               <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                  {events.length}
               </span>
            ) : undefined
         }
      >
         {isLoading ? (
            <OrdemHistoricoSkeleton />
         ) : isError ? (
            <div
               role="alert"
               className="flex flex-wrap items-center gap-3 text-sm text-red-600"
            >
               <span className="flex items-center gap-2">
                  <HiExclamationCircle className="h-5 w-5 shrink-0" />
                  Não foi possível carregar o histórico desta Ordem de Missão.
               </span>
               <Button size="xs" color="light" onClick={() => refetch()}>
                  Tentar novamente
               </Button>
            </div>
         ) : events.length === 0 ? (
            <p className="flex items-center justify-center gap-2 py-4 text-sm text-slate-500">
               <HiClock className="h-4 w-4 shrink-0 text-slate-400" />
               Nenhuma alteração desde a criação desta OM.
            </p>
         ) : (
            /* Sem limite de altura e sem scroll próprio: esta seção é a
               última da página, e o formulário inteiro já vive dentro de um
               `overflow-y-auto`. O `sm:max-h-96` de antes punha uma barra de
               rolagem a 50px da barra da página — a roda do mouse parava no
               histórico em vez de continuar a página, e o cartão ficava
               espremido em 336px com a viewport sobrando embaixo. A rolagem
               natural resolve, e sem região rolável não há mais parada de Tab
               a gerenciar. */
            <div role="region" aria-label="Histórico de alterações">
               <Timeline theme={TIMELINE_DENSO}>
                  {events.map((event, index) => {
                     const anterior = index > 0 ? events[index - 1] : null;
                     const repeatsHeader =
                        !!anterior &&
                        anterior.action === event.action &&
                        anterior.user?.id === event.user?.id &&
                        anterior.timestamp.slice(0, 16) ===
                           event.timestamp.slice(0, 16);

                     return (
                        <OrdemHistoricoItem
                           key={event.id}
                           event={event}
                           repeatsHeader={repeatsHeader}
                        />
                     );
                  })}
               </Timeline>
            </div>
         )}
      </FormSection>
   );
}
