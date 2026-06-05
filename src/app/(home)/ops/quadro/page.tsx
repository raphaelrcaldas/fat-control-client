"use client";
import { useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { listOrdens } from "services/routes/om/ordens";
import { ordemKeys } from "@/hooks/queries/useOrdens";
import { useAeronaves } from "@/hooks/queries/useAeronaves";
import { useDaysToShow } from "@/hooks/useDaysToShow";
import WeekCalendar from "./components/MissionList/WeekCalendar";

function getWeekStart(date: Date): Date {
   const d = new Date(date);
   const day = d.getDay();
   const diff = d.getDate() - day + (day === 0 ? -6 : 1);
   d.setDate(diff);
   d.setHours(0, 0, 0, 0);
   return d;
}

function toLocalDateStr(date: Date): string {
   const y = date.getFullYear();
   const m = String(date.getMonth() + 1).padStart(2, "0");
   const d = String(date.getDate()).padStart(2, "0");
   return `${y}-${m}-${d}`;
}

function parseInicioParam(value: string | null): Date {
   if (value) {
      const parsed = new Date(value + "T00:00:00");
      if (!isNaN(parsed.getTime())) {
         parsed.setHours(0, 0, 0, 0);
         return parsed;
      }
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
         data_inicio: toLocalDateStr(currentWeekStart),
         data_fim: toLocalDateStr(end),
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
         params.set("inicio", toLocalDateStr(newDate));
         router.push(`?${params.toString()}`);
      },
      [currentWeekStart, daysToShow, searchParams, router]
   );

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
