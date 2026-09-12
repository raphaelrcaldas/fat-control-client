"use client";
import { todayIso } from "utils/dateHandler";

import { useMemo, useState } from "react";
import { usePersistedState } from "@/hooks/usePersistedState";
import { useCrewIndisps } from "@/hooks/queries/useIndisps";
import { useFuncoes } from "@/hooks/queries/useFuncoes";
import { IndispModalProvider } from "./context/indispModalContext";
import { IndispFormHost } from "./components/form/IndispFormHost";
import { TripIndispHost } from "./components/trip/TripIndispHost";
import { IndispHeader } from "./components/IndispHeader";
import { IndispContent } from "./components/IndispContent";
import { IndispBoardToolbar } from "./components/board/IndispBoardToolbar";
import { useDateNavigation } from "./components/board/hooks/useDateNavigation";
import { useVisibleDays } from "./components/board/hooks/useVisibleDays";

export default function IndispPage() {
   const [focusedIso, setFocusedIso] = useState<string | null>(null);
   const { principais } = useFuncoes();
   const funcOptions = useMemo(
      () => principais.map((f) => ({ value: f.cod, label: f.nome_curto })),
      [principais]
   );

   const [indispFunc, setIndispFunc] = usePersistedState(
      "indisp.indispFunc",
      "mc"
   );
   // O catálogo de funções é por unidade: o valor guardado pode não existir na
   // org ativa. Sem esta queda, o Select renderizava vazio e a busca rodava
   // com uma função fantasma.
   const func =
      funcOptions.length > 0 && !funcOptions.some((f) => f.value === indispFunc)
         ? funcOptions[0].value
         : indispFunc;

   const dayCount = useVisibleDays();
   const { dates, shift, goToday, canBack, canForward, windowFrom, windowTo } =
      useDateNavigation(dayCount);

   const {
      data: indisps,
      isLoading,
      isError,
      isFetching,
      refetch,
   } = useCrewIndisps(func, windowFrom, windowTo);

   return (
      <IndispModalProvider>
         <div className="flex h-[calc(100dvh-4.5rem)] min-h-0 flex-col space-y-2 overflow-hidden md:h-[calc(100dvh-5rem)]">
            <IndispHeader />

            <IndispContent
               isLoading={isLoading}
               isError={isError}
               isFetching={isFetching}
               indisps={indisps}
               dates={dates}
               focusedIso={focusedIso}
               onFocusDay={setFocusedIso}
               onRetry={refetch}
               onShiftDays={shift}
               toolbar={
                  <IndispBoardToolbar
                     func={func}
                     funcOptions={funcOptions}
                     onFuncChange={setIndispFunc}
                     onToday={() => {
                        goToday();
                        setFocusedIso(todayIso());
                     }}
                     onShiftDays={shift}
                     canBack={canBack}
                     canForward={canForward}
                  />
               }
            />
         </div>
         <IndispFormHost />
         <TripIndispHost />
      </IndispModalProvider>
   );
}
