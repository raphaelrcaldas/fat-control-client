import { useMemo } from "react";
import { useEtapas } from "@/hooks/queries";
import type { MissaoComEtapas } from "services/routes/estatistica/etapas";
import type { Dupla } from "../types";

import { collectPilotos } from "../helpers/sessoes";

/** Data da sessao mais recente da dupla; `null` quando ainda nao ha sessao. */
function getLastDate(d: Dupla): string | null {
   if (d.etapas.length === 0) return null;
   return (
      d.etapas
         .map((e) => e.data)
         .sort()
         .at(-1) ?? null
   );
}

/**
 * Mais recentes no topo, pela ULTIMA sessao — nao pela primeira: uma dupla
 * antiga que voou ontem e atividade recente e precisa subir. Duplas ainda sem
 * sessao ficam acima de todas, por serem o trabalho pendente.
 */
function sortByLastDateDesc(a: Dupla, b: Dupla): number {
   const da = getLastDate(a);
   const db = getLastDate(b);
   if (!da && !db) return b.missaoId - a.missaoId;
   if (!da) return -1;
   if (!db) return 1;
   if (da === db) return b.missaoId - a.missaoId;
   return db.localeCompare(da);
}

function buildDuplasFromApi(missoes: MissaoComEtapas[]): Dupla[] {
   return missoes
      .map((missao) => {
         const pilots = collectPilotos(missao.etapas);

         return {
            key: String(missao.id),
            pilots,
            etapas: missao.etapas,
            missaoId: missao.id,
            obs: missao.obs,
         } satisfies Dupla;
      })
      .sort(sortByLastDateDesc);
}

export function useSimuladorDuplas(anoRef: number) {
   const { data, isLoading, isFetching, isError, refetch } = useEtapas({
      is_simulador: true,
      data_ini: `${anoRef}-01-01`,
      data_fim: `${anoRef}-12-31`,
   });

   const duplas = useMemo(() => buildDuplasFromApi(data ?? []), [data]);

   return {
      duplas,
      isLoading,
      isFetching,
      isError,
      refetch,
   };
}
