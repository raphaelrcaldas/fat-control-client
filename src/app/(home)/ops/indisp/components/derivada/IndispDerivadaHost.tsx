"use client";

import {
   useIndispDerivadaTarget,
   useIndispModalActions,
} from "../../context/indispModalContext";
import { IndispDerivada } from "./IndispDerivada";

/**
 * Instância única da ficha da faixa derivada, controlada pelo context.
 * Mesmo padrão do `IndispFormHost` e do `TripIndispHost`.
 */
export function IndispDerivadaHost() {
   const target = useIndispDerivadaTarget();
   const { closeDerivada } = useIndispModalActions();

   if (!target) return null;

   return (
      <IndispDerivada
         trip={target.trip}
         restricao={target.restricao}
         onClose={closeDerivada}
      />
   );
}
