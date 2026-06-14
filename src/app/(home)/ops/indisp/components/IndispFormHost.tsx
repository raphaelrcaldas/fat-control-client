"use client";

import {
   useIndispFormTarget,
   useIndispModalActions,
} from "../context/indispModalContext";
import { IndispForm } from "./IndispForm";

/**
 * Instância única do IndispForm, controlada pelo context (openForm/closeForm).
 * Evita N modais de formulário espalhados com useState local.
 */
export function IndispFormHost() {
   const target = useIndispFormTarget();
   const { closeForm } = useIndispModalActions();

   if (!target) return null;

   return (
      <IndispForm
         open
         setOpen={(value) => {
            if (!value) closeForm();
         }}
         trip={target.trip}
         indisp={target.indisp}
         readOnly={target.readOnly}
      />
   );
}
