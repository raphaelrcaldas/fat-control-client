// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, renderHook, screen } from "@testing-library/react";
import {
   collectPilotos,
   sortPilotos,
} from "@/app/(home)/instrucao/simulador/helpers/sessoes";
import { useSimuladorDuplas } from "@/app/(home)/instrucao/simulador/hooks/useSimuladorDuplas";
import PilotSearchDropdown from "@/app/(home)/instrucao/simulador/components/PilotSearchDropdown";
import type { DuplaPilot } from "@/app/(home)/instrucao/simulador/types";
import type { EtapaItem } from "services/routes/estatistica/etapas";

const mocks = vi.hoisted(() => ({ data: [] as unknown[] }));
vi.mock("@/hooks/queries", () => ({ useEtapas: () => ({ data: mocks.data }) }));
vi.mock("@/hooks/queries/useTrips", () => ({
   useTrips: () => ({ data: { items: [] }, isLoading: false }),
}));
const piloto = (
   trip_id: number,
   ant: number,
   ult_promo = "2020-01-01",
   ant_rel = 1
): DuplaPilot => ({
   trip_id,
   ant,
   ult_promo,
   ant_rel,
   trig: String(trip_id),
   nome_guerra: `Piloto ${trip_id}`,
   p_g: "CAP",
   func: "pil",
   func_bordo: "1P",
});
afterEach(cleanup);

describe("antiguidade no simulador", () => {
   it("ordena por posto, promoção e antiguidade relativa, preservando a entrada", () => {
      const pilots = [
         piloto(1, 4),
         piloto(2, 2, "2022-01-01"),
         piloto(3, 2, "2020-01-01", 2),
         piloto(4, 2, "2020-01-01", 1),
      ];
      expect(sortPilotos(pilots).map((p) => p.trip_id)).toEqual([4, 3, 2, 1]);
      expect(pilots.map((p) => p.trip_id)).toEqual([1, 2, 3, 4]);
   });
   it("preserva a antiguidade ao coletar os pilotos de várias etapas", () => {
      const etapas = [
         { tripulantes: [piloto(1, 4), piloto(9, 1)] },
         { tripulantes: [piloto(9, 1)] },
      ] as EtapaItem[];
      expect(collectPilotos(etapas).map((p) => p.trip_id)).toEqual([9, 1]);
      expect(collectPilotos(etapas)[0].ant).toBe(1);
   });
   it("exibe o piloto mais antigo primeiro no formulário sem mudar a função a bordo", () => {
      render(
         <PilotSearchDropdown
            pilots={[piloto(1, 4), { ...piloto(9, 1), func_bordo: "2P" }]}
            showSearch
            onAdd={vi.fn()}
            onRemove={vi.fn()}
            onUpdateFuncBordo={vi.fn()}
         />
      );
      const fields = screen.getAllByRole<HTMLSelectElement>("combobox");
      expect(fields.map((field) => field.getAttribute("aria-label"))).toEqual([
         "Função a bordo de CAP PILOTO 9",
         "Função a bordo de CAP PILOTO 1",
      ]);
      expect(fields[0].value).toBe("2P");
   });
   it("ordena os nomes da dupla sem alterar a ordem da listagem por data", () => {
      mocks.data = [
         {
            id: 1,
            obs: null,
            etapas: [{ data: "2026-09-29", tripulantes: [piloto(1, 4)] }],
         },
         {
            id: 2,
            obs: null,
            etapas: [
               {
                  data: "2026-09-01",
                  tripulantes: [piloto(8, 3), piloto(9, 1)],
               },
            ],
         },
      ];
      const { result } = renderHook(() => useSimuladorDuplas(2026));
      expect(result.current.duplas.map((dupla) => dupla.missaoId)).toEqual([
         1, 2,
      ]);
      expect(result.current.duplas[1].pilots.map((p) => p.trip_id)).toEqual([
         9, 8,
      ]);
   });
});
