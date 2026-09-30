import { describe, expect, it } from "vitest";
import { buildDraftFromServer } from "@/app/(home)/estatistica/etapas/missao/context/serverMappers";
import { simuladorReducer } from "@/app/(home)/instrucao/simulador/missao/helpers/simuladorReducer";
import { etapaFingerprint } from "@/app/(home)/instrucao/simulador/missao/helpers/reconcileMissao";
import type { MissaoComEtapasDetail } from "services/routes/estatistica/etapas";
import { etapa } from "./fixtures";

const missao = (
   etapas = [etapa(1), etapa(2)],
   obs: string | null = null
): MissaoComEtapasDetail => ({
   id: 1,
   titulo: "Simulador",
   obs,
   is_simulador: true,
   etapas,
});
const draftOf = (m: MissaoComEtapasDetail) => buildDraftFromServer(m);

describe("ação RECONCILE do reducer", () => {
   it("calcula sobre o estado atual: edição enfileirada não é sobrescrita", () => {
      const base = draftOf(missao());
      const edited = simuladorReducer(base, {
         type: "UPDATE_ETAPA_FORM",
         payload: { localId: base.etapas[0].localId, patch: { pousos: 7 } },
      });
      // A leitura do servidor foi montada antes da edição, que já está no state.
      const server = draftOf(
         missao([{ ...etapa(1), data: "2026-09-10" }, etapa(2)])
      );
      const next = simuladorReducer(edited, {
         type: "RECONCILE",
         payload: { server, baseline: base },
      });
      expect(next.etapas[0].form.pousos).toBe(7);
      expect(next.etapas[0].form.data).toBe("2026-09-19");
      expect(next.etapas[1].form.data).toBe("2026-09-19");
   });

   it("é idempotente e devolve o mesmo estado quando nada muda", () => {
      const base = draftOf(missao());
      const same = draftOf(missao());
      expect(
         simuladorReducer(base, {
            type: "RECONCILE",
            payload: { server: same, baseline: base },
         })
      ).toBe(base);

      const server = draftOf(missao([etapa(1)], "nova obs"));
      const action = {
         type: "RECONCILE" as const,
         payload: { server, baseline: base },
      };
      const once = simuladorReducer(base, action);
      const twice = simuladorReducer(once, action);
      expect(once.etapas).toHaveLength(1);
      expect(once.obs).toBe("nova obs");
      expect(twice).toEqual(once);
   });
});

describe("etapaFingerprint dos pilotos", () => {
   it("ignora ordem das chaves, posição na lista e metadados de exibição", () => {
      const a = draftOf(missao()).etapas[0];
      const [trip] = a.assignedTrips;
      const reinserido = {
         ...a,
         assignedTrips: [
            {
               funcBordo: trip.funcBordo,
               func: trip.func,
               nomeGuerra: "Outro",
               tripId: trip.tripId,
            },
         ],
      } as typeof a;
      expect(etapaFingerprint(reinserido)).toBe(etapaFingerprint(a));
   });

   it("ordena por tripId e ainda enxerga troca de função a bordo", () => {
      const a = draftOf(missao()).etapas[0];
      const [p1] = a.assignedTrips;
      const p2 = { ...p1, tripId: 2, funcBordo: "2P" };
      const ab = { ...a, assignedTrips: [p1, p2] };
      const ba = { ...a, assignedTrips: [p2, p1] };
      expect(etapaFingerprint(ab)).toBe(etapaFingerprint(ba));
      const trocado = {
         ...a,
         assignedTrips: [p1, { ...p2, funcBordo: "IN" }],
      };
      expect(etapaFingerprint(trocado)).not.toBe(etapaFingerprint(ab));
   });
});
