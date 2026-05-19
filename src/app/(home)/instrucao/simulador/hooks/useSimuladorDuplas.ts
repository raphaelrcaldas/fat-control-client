import { useState, useMemo, useCallback } from "react";
import { useEtapas } from "@/hooks/queries";
import type { MissaoComEtapas } from "services/routes/estatistica/etapas";
import type { Dupla, DuplaPilot, PendingDupla } from "../types";

function getFirstDate(d: Dupla): string | null {
   if (d.etapas.length === 0) return null;
   return d.etapas.map((e) => e.data).sort()[0];
}

function sortByFirstDate(a: Dupla, b: Dupla): number {
   const da = getFirstDate(a);
   const db = getFirstDate(b);
   if (!da && !db) return 0;
   if (!da) return 1;
   if (!db) return -1;
   return da.localeCompare(db);
}

function buildDuplasFromApi(missoes: MissaoComEtapas[]): Dupla[] {
   return missoes
      .map((missao) => {
         const pilotsMap = new Map<number, DuplaPilot>();
         for (const etapa of missao.etapas) {
            for (const trip of etapa.tripulantes) {
               if (!pilotsMap.has(trip.trip_id)) {
                  pilotsMap.set(trip.trip_id, {
                     trip_id: trip.trip_id,
                     trig: trip.trig,
                     nome_guerra: trip.nome_guerra,
                     p_g: trip.p_g,
                     func: trip.func,
                     func_bordo: trip.func_bordo,
                  });
               }
            }
         }
         const pilots = Array.from(pilotsMap.values()).sort(
            (a, b) => a.trip_id - b.trip_id
         );

         return {
            key: String(missao.id),
            pilots,
            etapas: missao.etapas,
            missaoId: missao.id,
         } satisfies Dupla;
      })
      .sort(sortByFirstDate);
}

function mergeDuplas(apiDuplas: Dupla[], pending: PendingDupla[]): Dupla[] {
   const pendingByMissao = new Map(pending.map((p) => [p.missaoId, p]));

   // Enriquece duplas da API: se sem pilotos, usa pilotos da pending
   const enriched = apiDuplas.map((d) => {
      if (d.pilots.length === 0 && pendingByMissao.has(d.missaoId)) {
         return { ...d, pilots: pendingByMissao.get(d.missaoId)!.pilots };
      }
      return d;
   });

   // Pending duplas que ainda não apareceram na API
   const apiMissaoIds = new Set(apiDuplas.map((d) => d.missaoId));
   const newDuplas: Dupla[] = pending
      .filter((p) => !apiMissaoIds.has(p.missaoId))
      .map((p) => ({
         key: p.key,
         pilots: p.pilots,
         etapas: [],
         missaoId: p.missaoId,
      }));

   return [...enriched, ...newDuplas].sort(sortByFirstDate);
}

export function useSimuladorDuplas(anoRef: number) {
   const [pendingDuplas, setPendingDuplas] = useState<PendingDupla[]>([]);
   const [selectedKey, setSelectedKey] = useState<string | null>(null);

   const { data, isLoading, isError } = useEtapas({
      is_simulador: true,
      data_ini: `${anoRef}-01-01`,
      data_fim: `${anoRef}-12-31`,
   });

   const apiDuplas = useMemo(() => buildDuplasFromApi(data ?? []), [data]);

   const duplas = useMemo(
      () => mergeDuplas(apiDuplas, pendingDuplas),
      [apiDuplas, pendingDuplas]
   );

   const selectedDupla = useMemo(
      () => duplas.find((d) => d.key === selectedKey) ?? null,
      [duplas, selectedKey]
   );

   const handleDuplaCreated = useCallback(
      (missaoId: number, pilots: DuplaPilot[]) => {
         const sorted = [...pilots].sort((a, b) => a.trip_id - b.trip_id);
         const key = String(missaoId);

         setPendingDuplas((prev) => {
            if (prev.some((p) => p.missaoId === missaoId)) return prev;
            return [...prev, { key, missaoId, pilots: sorted }];
         });

         setSelectedKey(key);
      },
      []
   );

   const removePending = useCallback((missaoId: number) => {
      setPendingDuplas((prev) => prev.filter((p) => p.missaoId !== missaoId));
   }, []);

   return {
      duplas,
      selectedDupla,
      selectedKey,
      setSelectedKey,
      isLoading,
      isError,
      handleDuplaCreated,
      removePending,
   };
}
