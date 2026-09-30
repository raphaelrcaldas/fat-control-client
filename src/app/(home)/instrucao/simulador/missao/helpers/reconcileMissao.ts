import type {
   DraftEtapa,
   MissaoDraft,
} from "@/app/(home)/estatistica/etapas/missao/context/types";

/**
 * Impressao digital do conteudo editavel de uma sessao. Ignora `uid`: os
 * mappers do servidor geram uids novos a cada leitura, e comparar com eles
 * marcaria como alterado um dado identico.
 */
export function etapaFingerprint(etapa: DraftEtapa): string {
   const noUid = <T extends { uid: string }>({ uid: _uid, ...rest }: T) => rest;
   // Só o que vai no payload, com chaves em ordem fixa e por `tripId`: remover
   // e re-adicionar o mesmo piloto muda a posição na lista e a ordem das
   // chaves (o mapper do servidor e o `ADD_TRIP` montam o objeto de formas
   // diferentes), o que não é alteração.
   const trips = etapa.assignedTrips
      .map(({ tripId, func, funcBordo }) => ({ tripId, func, funcBordo }))
      .sort((a, b) => a.tripId - b.tripId);
   return JSON.stringify([
      etapa.form,
      etapa.oiItems.map(noUid),
      trips,
      etapa.pqd.map(noUid),
      etapa.revo.map(noUid),
      etapa.heavyCds.map(noUid),
   ]);
}

export interface ReconcileResult {
   draft: MissaoDraft;
   baseline: MissaoDraft;
   /** Sessoes com alteracoes locais que o servidor removeu (datas ISO). */
   discardedDates: string[];
}

/** Posicao de uma sessao persistida na ordem cronologica da lista. */
function sortKey(etapa: DraftEtapa): string {
   return `${etapa.form.data}T${etapa.form.dep}`;
}

/**
 * Reconcilia o rascunho local da missao com o estado atual do servidor.
 *
 * - sessao do servidor desconhecida localmente: entra limpa;
 * - sessao persistida que sumiu do servidor: sai (avisando se tinha edicao);
 * - sessao limpa que mudou no servidor: assume a versao do servidor; com
 *   edicao local, o rascunho vence e a proxima gravacao sobrescreve;
 * - sessoes novas (`serverId` nulo) ficam intocadas; `obs` limpa acompanha o
 *   servidor.
 *
 * Devolve `null` quando nada muda — dado identico e no-op, sem nova
 * identidade de estado nem marca de alteracao. `localId` das sessoes
 * existentes e sempre preservado.
 */
export function reconcileDraft(
   draft: MissaoDraft,
   baseline: MissaoDraft,
   server: MissaoDraft
): ReconcileResult | null {
   const serverById = new Map(
      server.etapas.map((etapa) => [etapa.serverId as number, etapa])
   );
   const baselineByLocal = new Map(baseline.etapas.map((e) => [e.localId, e]));
   const knownServerIds = new Set<number>();
   for (const etapa of [...draft.etapas, ...baseline.etapas])
      if (etapa.serverId !== null) knownServerIds.add(etapa.serverId);

   let changed = false;
   const discardedDates: string[] = [];
   const draftEtapas: DraftEtapa[] = [];
   const baselineEtapas: DraftEtapa[] = [];

   for (const etapa of draft.etapas) {
      if (etapa.serverId === null) {
         draftEtapas.push(etapa);
         continue;
      }
      const base = baselineByLocal.get(etapa.localId) ?? null;
      const fresh = serverById.get(etapa.serverId);
      const modified =
         !base || etapaFingerprint(etapa) !== etapaFingerprint(base);
      if (!fresh) {
         changed = true;
         if (modified)
            discardedDates.push((base ?? etapa).form.data || etapa.form.data);
         continue;
      }
      if (base && etapaFingerprint(fresh) === etapaFingerprint(base)) {
         draftEtapas.push(etapa);
         baselineEtapas.push(base);
         continue;
      }
      changed = true;
      const adopted: DraftEtapa = { ...fresh, localId: etapa.localId };
      baselineEtapas.push(adopted);
      draftEtapas.push(modified ? etapa : adopted);
   }

   // Sessoes criadas por outra pessoa: entram na posicao cronologica entre as
   // persistidas, antes dos rascunhos novos.
   for (const fresh of server.etapas) {
      if (knownServerIds.has(fresh.serverId as number)) continue;
      changed = true;
      const position = draftEtapas.findIndex((etapa) => {
         if (etapa.serverId === null) return true;
         const base = baselineEtapas.find((b) => b.localId === etapa.localId);
         return sortKey(base ?? etapa) > sortKey(fresh);
      });
      draftEtapas.splice(
         position === -1 ? draftEtapas.length : position,
         0,
         fresh
      );
      baselineEtapas.push(fresh);
   }

   const obsDirty = (draft.obs ?? "") !== (baseline.obs ?? "");
   const obsChanged = (server.obs ?? "") !== (baseline.obs ?? "");
   const tituloChanged = server.titulo !== baseline.titulo;
   if (obsChanged || tituloChanged) changed = true;
   if (!changed) return null;

   const selectedLocalId = draftEtapas.some(
      (e) => e.localId === draft.selectedLocalId
   )
      ? draft.selectedLocalId
      : (draftEtapas[0]?.localId ?? null);
   const initialEtapaServerIds = draftEtapas
      .filter((e) => e.serverId !== null)
      .map((e) => e.serverId as number);

   return {
      discardedDates,
      draft: {
         ...draft,
         titulo: server.titulo,
         obs: obsChanged && !obsDirty ? server.obs : draft.obs,
         etapas: draftEtapas,
         selectedLocalId,
         initialEtapaServerIds,
      },
      baseline: {
         ...baseline,
         titulo: server.titulo,
         obs: server.obs,
         etapas: baselineEtapas,
         initialEtapaServerIds,
      },
   };
}
