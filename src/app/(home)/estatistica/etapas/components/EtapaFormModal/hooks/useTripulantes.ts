import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { useQuery } from "@tanstack/react-query";
import { getPosicoesByFunc } from "@/constants/tripulantes/funcoes";
import type { FuncType } from "@/constants/tripulantes/funcoes";
import { tripKeys } from "@/hooks/queries/useTrips";
import { getTrips } from "services/routes/trips";
import type { PoolTrip, AssignedTrip } from "../types";

export function useTripulantes() {
   const [poolTrips, setPoolTrips] = useState<PoolTrip[]>([]);
   const [assignedTrips, setAssignedTrips] = useState<AssignedTrip[]>([]);
   const [searchQuery, setSearchQuery] = useState("");
   const [debouncedSearch, setDebouncedSearch] = useState("");
   const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
   const [activeTrip, setActiveTrip] = useState<PoolTrip | null>(null);

   // Debounce search
   useEffect(() => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      searchTimerRef.current = setTimeout(() => {
         setDebouncedSearch(searchQuery);
      }, 300);
      return () => {
         if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      };
   }, [searchQuery]);

   const searchParams = debouncedSearch
      ? { search: debouncedSearch, per_page: 8, active: true }
      : undefined;
   const { data: tripsData, isFetching: searchingTrips } = useQuery({
      queryKey: tripKeys.list(searchParams),
      queryFn: ({ signal }) => getTrips(searchParams!, signal),
      enabled: !!debouncedSearch,
   });

   // Computed sets for filtering
   const assignedIds = useMemo(
      () => new Set(assignedTrips.map((t) => t.tripId)),
      [assignedTrips]
   );
   const poolIds = useMemo(
      () => new Set(poolTrips.map((t) => t.tripId)),
      [poolTrips]
   );

   // Pool management
   function addToPool(trip: {
      id?: number;
      trig: string;
      user: { nome_guerra: string; p_g: string };
   }) {
      const tripId = trip.id!;
      if (assignedIds.has(tripId) || poolIds.has(tripId)) return;
      setPoolTrips((prev) => [
         ...prev,
         {
            tripId,
            trig: trip.trig,
            nomeGuerra: trip.user.nome_guerra,
            pGraduacao: trip.user.p_g,
         },
      ]);
   }

   function removeFromPool(tripId: number) {
      setPoolTrips((prev) => prev.filter((t) => t.tripId !== tripId));
   }

   function removeFromGroup(tripId: number) {
      const trip = assignedTrips.find((t) => t.tripId === tripId);
      if (!trip) return;
      setAssignedTrips((prev) => prev.filter((t) => t.tripId !== tripId));
      setPoolTrips((prev) => [
         ...prev,
         {
            tripId: trip.tripId,
            trig: trip.trig,
            nomeGuerra: trip.nomeGuerra,
            pGraduacao: trip.pGraduacao,
         },
      ]);
   }

   function updateFuncBordo(tripId: number, funcBordo: string) {
      setAssignedTrips((prev) =>
         prev.map((t) => (t.tripId === tripId ? { ...t, funcBordo } : t))
      );
   }

   function addTripToGroup(
      trip: {
         id?: number;
         trig: string;
         user: { nome_guerra: string; p_g: string };
      },
      func: FuncType
   ) {
      const tripId = trip.id!;
      if (assignedIds.has(tripId)) return;

      // Remove from pool if there
      setPoolTrips((prev) => prev.filter((t) => t.tripId !== tripId));

      const posicoes = getPosicoesByFunc(func);
      const defaultFuncBordo =
         posicoes[0]?.codigo ?? func.toUpperCase().slice(0, 2);

      setAssignedTrips((prev) => [
         ...prev,
         {
            tripId,
            trig: trip.trig,
            nomeGuerra: trip.user.nome_guerra,
            pGraduacao: trip.user.p_g,
            func,
            funcBordo: defaultFuncBordo,
         },
      ]);
   }

   // Drag & Drop
   const sensors = useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
   );

   const handleDragStart = useCallback((event: DragStartEvent) => {
      const { trip } = event.active.data.current as { trip: PoolTrip };
      setActiveTrip(trip);
   }, []);

   const handleDragEnd = useCallback((event: DragEndEvent) => {
      setActiveTrip(null);
      const { over, active } = event;
      if (!over) return;

      const { trip } = active.data.current as { trip: PoolTrip };
      const targetFunc = (over.data.current as { targetFunc?: FuncType })
         ?.targetFunc;
      if (!targetFunc) return;

      const posicoes = getPosicoesByFunc(targetFunc);
      const defaultFuncBordo =
         posicoes[0]?.codigo ?? targetFunc.toUpperCase().slice(0, 2);

      // Remove from current location
      setPoolTrips((prev) => prev.filter((t) => t.tripId !== trip.tripId));
      setAssignedTrips((prev) => {
         const existing = prev.find((t) => t.tripId === trip.tripId);
         const filtered = prev.filter((t) => t.tripId !== trip.tripId);
         return [
            ...filtered,
            {
               ...trip,
               func: targetFunc,
               funcBordo: existing?.funcBordo ?? defaultFuncBordo,
            },
         ];
      });
   }, []);

   // Reset search state
   const resetSearch = useCallback(() => {
      setSearchQuery("");
      setDebouncedSearch("");
   }, []);

   return {
      poolTrips,
      setPoolTrips,
      assignedTrips,
      setAssignedTrips,
      searchQuery,
      setSearchQuery,
      debouncedSearch,
      tripsData,
      searchingTrips,
      assignedIds,
      poolIds,
      addToPool,
      removeFromPool,
      removeFromGroup,
      updateFuncBordo,
      addTripToGroup,
      sensors,
      activeTrip,
      handleDragStart,
      handleDragEnd,
      resetSearch,
   };
}
