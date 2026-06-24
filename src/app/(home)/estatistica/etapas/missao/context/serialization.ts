import type { MissaoDraft } from "./types";

function stableStringify(value: unknown): string {
   if (value === null || typeof value !== "object") {
      return JSON.stringify(value);
   }
   if (Array.isArray(value)) {
      return `[${value.map((v) => stableStringify(v)).join(",")}]`;
   }
   const obj = value as Record<string, unknown>;
   const keys = Object.keys(obj).sort();
   const parts = keys.map(
      (k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`
   );
   return `{${parts.join(",")}}`;
}

export function serializeDraft(draft: MissaoDraft): string {
   // Exclude UI-only fields and metadata that shouldn't trigger "dirty":
   //   - initialSnapshot: the comparison reference itself
   //   - initialEtapaServerIds: load-time metadata for delete-detection
   //   - selectedLocalId: pure UI state (which etapa the user is viewing)
   //   - dirty: derived flag set by user actions, not a value to compare
   const {
      initialSnapshot: _omitSnapshot,
      initialEtapaServerIds: _omitIds,
      selectedLocalId: _omitSelected,
      ...rest
   } = draft;
   void _omitSnapshot;
   void _omitIds;
   void _omitSelected;
   const cleanedEtapas = rest.etapas.map(
      ({ dirty: _omitDirty, ...etapaRest }) => {
         void _omitDirty;
         return etapaRest;
      }
   );
   return stableStringify({ ...rest, etapas: cleanedEtapas });
}

export function isDirty(draft: MissaoDraft): boolean {
   if (draft.initialSnapshot == null) return true;
   return serializeDraft(draft) !== draft.initialSnapshot;
}
