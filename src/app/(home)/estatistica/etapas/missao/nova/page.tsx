"use client";

import { MissaoDraftProvider } from "../_state/MissaoDraftContext";
import { emptyDraft } from "../_state/helpers";
import { MissaoEditor } from "../_components/MissaoEditor";

export default function NovaMissaoPage() {
   return (
      <MissaoDraftProvider initialDraft={emptyDraft()}>
         <MissaoEditor mode="new" />
      </MissaoDraftProvider>
   );
}
