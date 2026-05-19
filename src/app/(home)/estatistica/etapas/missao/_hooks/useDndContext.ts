"use client";

import { useCallback, useState, type Dispatch } from "react";

import {
   KeyboardSensor,
   PointerSensor,
   useSensor,
   useSensors,
   type DragEndEvent,
   type DragStartEvent,
   type SensorDescriptor,
   type SensorOptions,
} from "@dnd-kit/core";

import {
   getPosicoesByFunc,
   type FuncType,
} from "@/constants/tripulantes/funcoes";

import type { Action, DraftAssignedTrip, DraftPoolTrip } from "../_state/types";

interface UseDndContextParams {
   selectedLocalId: string | null;
   assignedTrips: DraftAssignedTrip[];
   dispatch: Dispatch<Action>;
}

export interface UseDndContextResult {
   sensors: SensorDescriptor<SensorOptions>[];
   activeTrip: DraftPoolTrip | null;
   handleDragStart: (event: DragStartEvent) => void;
   handleDragEnd: (event: DragEndEvent) => void;
}

export function useDndContext({
   selectedLocalId,
   assignedTrips,
   dispatch,
}: UseDndContextParams): UseDndContextResult {
   const [activeTrip, setActiveTrip] = useState<DraftPoolTrip | null>(null);

   const sensors = useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
      useSensor(KeyboardSensor)
   );

   const handleDragStart = useCallback((event: DragStartEvent) => {
      const data = event.active.data.current as
         | { trip?: DraftPoolTrip }
         | undefined;
      if (data?.trip) setActiveTrip(data.trip);
   }, []);

   const handleDragEnd = useCallback(
      (event: DragEndEvent) => {
         setActiveTrip(null);

         const { over, active } = event;
         if (!over || !selectedLocalId) return;

         const activeData = active.data.current as
            | { trip?: DraftPoolTrip }
            | undefined;
         const overData = over.data.current as
            | { targetFunc?: FuncType }
            | undefined;

         const trip = activeData?.trip;
         const targetFunc = overData?.targetFunc;
         if (!trip || !targetFunc) return;

         const existing = assignedTrips.find((t) => t.tripId === trip.tripId);

         if (existing) {
            // Trip already assigned in this etapa → just move to new func.
            // Preserve existing funcBordo (matches legacy behaviour).
            if (existing.func === targetFunc) return;
            dispatch({
               type: "MOVE_TRIP_TO_FUNC",
               payload: {
                  localId: selectedLocalId,
                  tripId: trip.tripId,
                  func: targetFunc,
               },
            });
            return;
         }

         // Trip coming from the pool → add as a new assignment.
         const posicoes = getPosicoesByFunc(targetFunc);
         const defaultFuncBordo =
            posicoes[0]?.codigo ?? targetFunc.toUpperCase().slice(0, 2);

         const assigned: DraftAssignedTrip = {
            tripId: trip.tripId,
            trig: trip.trig,
            nomeGuerra: trip.nomeGuerra,
            pGraduacao: trip.pGraduacao,
            ant: trip.ant,
            ult_promo: trip.ult_promo,
            ant_rel: trip.ant_rel,
            func: targetFunc,
            funcBordo: defaultFuncBordo,
         };

         dispatch({
            type: "ADD_TRIP",
            payload: { localId: selectedLocalId, trip: assigned },
         });
      },
      [assignedTrips, dispatch, selectedLocalId]
   );

   return {
      sensors,
      activeTrip,
      handleDragStart,
      handleDragEnd,
   };
}
