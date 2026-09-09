"use client";

import {
   useIndispModalActions,
   useIndispTripTarget,
} from "../../context/indispModalContext";
import { TripIndisp } from "./TripIndisp";

/**
 * Instância única da lista do tripulante, controlada pelo context.
 * Mesmo padrão do IndispFormHost — evita uma instância de modal por linha.
 */
export function TripIndispHost() {
   const target = useIndispTripTarget();
   const { closeTrip } = useIndispModalActions();

   if (!target) return null;

   return <TripIndisp tripData={target} onClose={closeTrip} />;
}
