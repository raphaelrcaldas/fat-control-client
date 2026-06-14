"use client";
import { useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { listOrdens } from "services/routes/om/ordens";
import { ordemKeys } from "@/hooks/queries/useOrdens";
import { useAeronaves } from "@/hooks/queries/useAeronaves";
import { useDaysToShow } from "@/hooks/useDaysToShow";
import { dateToIso, getWeekStart, isoStrToDate } from "utils/dateHandler";
import WeekCalendar from "./components/MissionList/WeekCalendar";
import { WeekCalendarSkeleton } from "./components/MissionList/WeekCalendarSkeleton";

function parseInicioParam(value: string | null): Date {
   if (value) {
      const parsed = isoStrToDate(value);
      if (!isNaN(parsed.getTime())) return parsed;
   }
   return getWeekStart(new Date());
}

export default function QuadroOperacoes() {
   const searchParams = useSearchParams();
   const router = useRouter();
   const daysToShow = useDaysToShow();

   const currentWeekStart = useMemo(
      () => parseInicioParam(searchParams.get("inicio")),
      [searchParams]
   );

   const filters = useMemo(() => {
      const end = new Date(currentWeekStart);
      end.setDate(end.getDate() + daysToShow - 1);
      return {
         data_inicio: dateToIso(currentWeekStart),
         data_fim: dateToIso(end),
         status_ne: "cancelada",
         per_page: 100,
      };
   }, [currentWeekStart, daysToShow]);

   const { data, isLoading, isFetching } = useQuery({
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

   const aeronavesFiltradas = useMemo(() => {
      const matriculasComMissao = new Set(ordens.map((om) => om.matricula_anv));
      return todasAeronaves.filter(
         (anv) => anv.active || matriculasComMissao.has(anv.matricula)
      );
   }, [todasAeronaves, ordens]);

   const navigateWeek = useCallback(
      (direction: number) => {
         const newDate = new Date(currentWeekStart);
         newDate.setDate(newDate.getDate() + direction * daysToShow);
         const params = new URLSearchParams(searchParams);
         params.set("inicio", dateToIso(newDate));
         router.push(`?${params.toString()}`);
      },
      [currentWeekStart, daysToShow, searchParams, router]
   );

   if (isLoading) {
      return <WeekCalendarSkeleton daysToShow={daysToShow} />;
   }

   return (
      <WeekCalendar
         ordens={ordens}
         aeronaves={aeronavesFiltradas}
         isLoading={isLoading}
         isFetching={isFetching}
         currentWeekStart={currentWeekStart}
         daysToShow={daysToShow}
         onNavigateWeek={navigateWeek}
      />
   );
}
