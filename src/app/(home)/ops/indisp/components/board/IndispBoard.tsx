"use client";

import { KeyboardEvent, ReactNode, useCallback, useMemo, useRef } from "react";
import clsx from "clsx";
import { isoStrToDate, todayIso } from "utils/dateHandler";
import { usePermBased } from "@/app/(home)/hooks/usePermBased";
import { CrewIndispList } from "services/routes/indisps";
import {
   useIndispFormTarget,
   useIndispModalActions,
} from "../../context/indispModalContext";
import { useTimelineDrag } from "@/hooks/useTimelineDrag";
import { IndispBar, partitionTrips } from "./utils/indispBars";
import { buildDayColumns, buildMonthSegments } from "./utils/indispDays";
import { LANE_VARS } from "./utils/indispBoardLayout";
import { IndispBoardGrid } from "./IndispBoardGrid";
import { IndispBoardMonths } from "./IndispBoardMonths";
import { IndispBoardRuler } from "./IndispBoardRuler";

interface IndispBoardProps {
   indisps: CrewIndispList[];
   dates: Date[];
   /** Desloca a janela em dias — usado pelo arrasto e pelas setas do teclado. */
   onShiftDays: (days: number) => void;
   toolbar: ReactNode;
   focusedIso: string | null;
   onFocusDay: (iso: string) => void;
   isFetching?: boolean;
}

/**
 * A grade de faixas.
 *
 * Único ponto da GRADE que fala com o contexto dos modais: régua, linha, faixa
 * e vaga são todas burras e recebem callback. (Fora da grade também falam com
 * ele o `LastIndisps` e os dois hosts de modal.) Aqui também moram o gesto de
 * arrastar e a coluna sob leitura, porque ambos atravessam as três partes
 * (mês, régua e linhas).
 */
export function IndispBoard({
   indisps,
   dates,
   onShiftDays,
   toolbar,
   focusedIso,
   onFocusDay,
   isFetching = false,
}: IndispBoardProps) {
   const { openForm, openTrip, openDerivada } = useIndispModalActions();
   const { hasPerm } = usePermBased();
   // A vaga "+" é um caminho de criação como qualquer outro: sem o gate, quem
   // não pode criar via o "+" em toda coluna livre e só descobria no 403.
   const canCreate = hasPerm("ops.indisp", "create");
   const formTarget = useIndispFormTarget();

   const trackRef = useRef<HTMLDivElement>(null);
   const medirTrilha = useCallback(
      () => trackRef.current?.clientWidth ?? 0,
      []
   );
   const { dragHandlers, wasDragged } = useTimelineDrag(
      medirTrilha,
      dates.length,
      onShiftDays
   );

   // "Hoje" é calculado uma vez e propagado (evita new Date() por coluna).
   //
   // Entra como ISO, e não como `Date`, porque precisa ser DEPENDÊNCIA: com
   // `new Date()` dentro do memo, o valor mudava a cada meia-noite mas a
   // chave não, e a aba deixada aberta seguia marcando "hoje" na coluna de
   // ontem. A string só muda quando o dia vira, então o memo continua
   // recalculando pelo mesmo motivo de antes — nunca por causa do relógio.
   const hojeIso = todayIso();
   const days = useMemo(
      () => buildDayColumns(dates, isoStrToDate(hojeIso), focusedIso),
      [dates, hojeIso, focusedIso]
   );
   const months = useMemo(() => buildMonthSegments(dates), [dates]);

   const { principais, alunos } = useMemo(
      () => partitionTrips(indisps),
      [indisps]
   );

   /**
    * Clicar na faixa abre o REGISTRO, direto. A lista por dia que existia antes
    * só fazia sentido quando a célula não dizia nada: era preciso abrir para
    * descobrir o que havia ali. A faixa já mostra, então a etapa sobrava.
    *
    * Estado derivado (operação, CEMAL vencido, desadaptado) não tem registro
    * para editar, então abre a ficha da derivada: ela diz de qual fonte a
    * faixa nasceu e leva até lá (ver `IndispDerivada`).
    */
   const onOpenBar = useCallback(
      (tripData: CrewIndispList, bar: IndispBar) => {
         if (bar.indisp) {
            openForm({ trip: tripData.trip, indisp: bar.indisp });
         } else if (bar.restricao) {
            openDerivada({ trip: tripData.trip, restricao: bar.restricao });
         }
      },
      [openForm, openDerivada]
   );

   // Realce da faixa cuja edição está aberta — derivado, sem estado próprio.
   const selectedBarKey =
      formTarget?.indisp?.id != null
         ? `${formTarget.trip.id}:${formTarget.indisp.id}`
         : null;

   const onAdd = useCallback(
      (tripData: CrewIndispList, dateIso: string) => {
         openForm({ trip: tripData.trip, indisp: null, initialDate: dateIso });
      },
      [openForm]
   );

   const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget) return;
      // O arrasto não alcança quem navega por teclado — as setas fazem o
      // mesmo deslocamento que as quatro setas antigas faziam no clique.
      const passo =
         event.key === "ArrowLeft"
            ? -1
            : event.key === "ArrowRight"
              ? 1
              : event.key === "PageUp"
                ? -7
                : event.key === "PageDown"
                  ? 7
                  : 0;
      if (!passo) return;
      event.preventDefault();
      onShiftDays(passo);
   };

   return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
         {toolbar}

         <div
            role="group"
            tabIndex={0}
            aria-label="Grade de indisponibilidades — setas navegam no tempo"
            onKeyDown={onKeyDown}
            {...dragHandlers}
            className={clsx(
               LANE_VARS,
               "focus-visible:ring-primary-500 flex min-h-0 flex-1 cursor-grab touch-pan-y flex-col transition-opacity select-none focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset active:cursor-grabbing",
               isFetching && "opacity-50"
            )}
         >
            <IndispBoardMonths segments={months} total={dates.length} />
            <IndispBoardRuler
               days={days}
               onFocusDay={onFocusDay}
               shouldIgnoreClick={wasDragged}
               trackRef={trackRef}
            />
            <IndispBoardGrid
               principais={principais}
               alunos={alunos}
               dates={dates}
               days={days}
               selectedBarKey={selectedBarKey}
               onOpenBar={onOpenBar}
               onOpenTrip={openTrip}
               onAdd={onAdd}
               canCreate={canCreate}
               shouldIgnoreClick={wasDragged}
            />
         </div>
      </div>
   );
}
