"use client";

import { MissaoDraftProvider } from "../context/MissaoDraftContext";
import { emptyDraft } from "../context/serverMappers";
import { MissaoEditor } from "../components/MissaoEditor";

export default function NovaMissaoPage() {
   return (
      <MissaoDraftProvider initialDraft={emptyDraft()}>
         <MissaoEditor mode="new" />
      </MissaoDraftProvider>
   );
}
