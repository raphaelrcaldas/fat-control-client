"use client";
import { useMemo } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { listOrdens } from "services/routes/om/ordens";
import { ordemKeys } from "@/hooks/queries/useOrdens";
import { useAeronaves } from "@/hooks/queries/useAeronaves";
import { useVisibleDays } from "./components/MissionList/hooks/useVisibleDays";
import { useQuadroNavigation } from "./components/MissionList/hooks/useQuadroNavigation";
import WeekCalendar from "./components/MissionList/WeekCalendar";
import { WeekCalendarSkeleton } from "./components/MissionList/WeekCalendarSkeleton";

// Teto de `list_ordens` no backend. A janela é ampla (120 dias), então o
// truncamento é plausível aqui e a tela avisa em vez de omitir em silêncio.
const PER_PAGE = 100;

export default function QuadroOperacoes() {
   const dayCount = useVisibleDays();
   const {
      dates,
      shift,
      goToday,
      canBack,
      canForward,
      isToday,
      windowFrom,
      windowTo,
   } = useQuadroNavigation(dayCount);

   // A janela de dados é fixa durante a sessão, e não o recorte visível:
   // navegar de um dia para o outro passa a ser filtro em memória, sem
   // refetch nem troca de queryKey a cada clique.
   const filters = useMemo(
      () => ({
         data_inicio: windowFrom,
         data_fim: windowTo,
         status_ne: "cancelada",
         per_page: PER_PAGE,
      }),
      [windowFrom, windowTo]
   );

   const { data, isLoading, isFetching, isError, refetch } = useQuery({
      queryKey: ordemKeys.list(filters),
      queryFn: ({ signal }) => listOrdens(filters, signal),
      placeholderData: keepPreviousData,
   });

   const { data: aeronaveData } = useAeronaves({
      per_page: 100,
      is_sim: false,
   });

   const ordens = data?.items ?? [];
   const todasAeronaves = aeronaveData?.items ?? [];

   // O backend ordena a janela por decolagem, então o que sobra do corte
   // são as missões do fim do período — omiti-las caladamente faria o
   // quadro afirmar que não há voo onde há.
   const truncado = !!data && data.total > data.items.length;

   const aeronavesFiltradas = useMemo(() => {
      const matriculasComMissao = new Set(ordens.map((om) => om.matricula_anv));
      return todasAeronaves.filter(
         (anv) => anv.active || matriculasComMissao.has(anv.matricula)
      );
   }, [todasAeronaves, ordens]);

   if (isLoading) {
      return <WeekCalendarSkeleton dates={dates} />;
   }

   return (
      <WeekCalendar
         ordens={ordens}
         aeronaves={aeronavesFiltradas}
         isFetching={isFetching}
         isError={isError}
         onRetry={refetch}
         truncado={truncado}
         totalOrdens={data?.total ?? 0}
         dates={dates}
         onShiftDays={shift}
         onToday={goToday}
         canBack={canBack}
         canForward={canForward}
         isToday={isToday}
      />
   );
}
