"use client";
import { useState, useMemo } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { listOrdens } from "services/routes/om/ordens";
import { ordemKeys } from "@/hooks/queries/useOrdens";
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

export default function QuadroOperacoes() {
   const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() =>
      getWeekStart(new Date())
   );

   const filters = useMemo(() => {
      const end = new Date(currentWeekStart);
      end.setDate(end.getDate() + 20);
      return {
         data_inicio: toLocalDateStr(currentWeekStart),
         data_fim: toLocalDateStr(end),
         per_page: 100,
      };
   }, [currentWeekStart]);

   const { data, isLoading, isFetching } = useQuery({
      queryKey: ordemKeys.list(filters),
      queryFn: ({ signal }) => listOrdens(filters, signal),
      placeholderData: keepPreviousData,
   });

   const ordens = data?.items ?? [];

   const navigateWeek = (direction: number) => {
      setCurrentWeekStart((prev) => {
         const newDate = new Date(prev);
         newDate.setDate(newDate.getDate() + direction * 7);
         return newDate;
      });
   };

   return (
      <WeekCalendar
         ordens={ordens}
         isLoading={isLoading}
         isFetching={isFetching}
         currentWeekStart={currentWeekStart}
         onNavigateWeek={navigateWeek}
      />
   );
}
