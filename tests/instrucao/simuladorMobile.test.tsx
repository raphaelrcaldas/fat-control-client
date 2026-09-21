// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
   act,
   cleanup,
   fireEvent,
   render,
   screen,
   within,
} from "@testing-library/react";

import PilotSearchDropdown from "@/app/(home)/instrucao/simulador/components/PilotSearchDropdown";
import { NovaMissaoSimulador } from "@/app/(home)/instrucao/simulador/missao/components/NovaMissaoSimulador";

const mocks = vi.hoisted(() => ({
   createMissaoWithEtapas: vi.fn(),
   onAdd: vi.fn(),
   onRemove: vi.fn(),
   onUpdateFuncBordo: vi.fn(),
   replace: vi.fn(),
   push: vi.fn(),
   toast: vi.fn(),
}));

vi.mock("next/navigation", () => ({
   useRouter: () => ({ replace: mocks.replace, push: mocks.push }),
}));
vi.mock("@/app/context/toast", () => ({
   useToast: () => ({ push: mocks.toast }),
}));
vi.mock("@/hooks/queries/useEsfAer", () => ({
   useEsfAerList: () => ({
      data: [{ id: 1, descricao: "SML" }],
      isLoading: false,
   }),
}));
vi.mock("@/hooks/queries/useTiposMissao", () => ({
   useTiposMissao: () => ({
      data: [{ id: 2, cod: "SIM", desc: "Simulador" }],
      isLoading: false,
   }),
}));
vi.mock("@/hooks/queries/useEtapas", () => ({
   useCreateEtapa: () => ({ mutateAsync: vi.fn(), isPending: false }),
   useUpdateEtapa: () => ({ mutateAsync: vi.fn(), isPending: false }),
   useCreateMissaoWithEtapas: () => ({
      mutateAsync: mocks.createMissaoWithEtapas,
      isPending: false,
   }),
}));
vi.mock("@/hooks/queries/useTrips", () => ({
   useTrips: () => ({
      data: {
         items: [
            {
               id: 7,
               trig: "SIL",
               user: { nome_guerra: "Silva", p_g: "CAP" },
            },
         ],
      },
      isLoading: false,
   }),
}));

beforeEach(() => {
   vi.clearAllMocks();
   HTMLElement.prototype.scrollTo = vi.fn();
});
afterEach(() => {
   cleanup();
   vi.useRealTimers();
});

describe("criação de dupla no celular", () => {
   it("edita a observação no conteúdo móvel e a envia ao criar a dupla", async () => {
      vi.useFakeTimers();
      mocks.createMissaoWithEtapas.mockResolvedValue({
         ok: true,
         data: { id: 12 },
      });
      render(<NovaMissaoSimulador anoRef={2026} />);

      const obs = within(
         screen.getByRole("region", { name: "Observações da missão" })
      ).getByRole<HTMLTextAreaElement>("textbox", {
         name: "Observações da missão",
      });
      fireEvent.change(obs, { target: { value: "Treino noturno" } });
      expect(obs.value).toBe("Treino noturno");

      fireEvent.change(screen.getByRole("textbox", { name: "Buscar piloto" }), {
         target: { value: "si" },
      });
      await act(async () => vi.advanceTimersByTimeAsync(300));
      fireEvent.click(screen.getByRole("button", { name: /CAP.*Silva/ }));

      for (const [label, value] of [
         ["Data", "2026-09-20"],
         ["Origem", "SBGL"],
         ["Destino", "SBBR"],
         ["DEP", "10:00"],
         ["ARR", "11:00"],
      ]) {
         fireEvent.change(screen.getByLabelText(label), { target: { value } });
      }
      await act(async () => {
         fireEvent.click(screen.getByRole("button", { name: "Criar dupla" }));
      });

      expect(mocks.createMissaoWithEtapas).toHaveBeenCalledOnce();
      expect(mocks.createMissaoWithEtapas.mock.calls[0][0]).toMatchObject({
         obs: "Treino noturno",
         etapas: [
            expect.objectContaining({
               tripulantes: [expect.objectContaining({ trip_id: 7 })],
            }),
         ],
      });
   });
});

describe("controles de tripulação", () => {
   it("expõe nomes específicos para a função e remoção de cada piloto", () => {
      render(
         <PilotSearchDropdown
            pilots={[
               {
                  trip_id: 7,
                  trig: "SIL",
                  nome_guerra: "Silva",
                  p_g: "CAP",
                  func: "pil",
                  func_bordo: "1P",
               },
            ]}
            onAdd={mocks.onAdd}
            onRemove={mocks.onRemove}
            onUpdateFuncBordo={mocks.onUpdateFuncBordo}
            showSearch
         />
      );

      fireEvent.change(
         screen.getByRole("combobox", { name: "Função a bordo de CAP SILVA" }),
         { target: { value: "IN" } }
      );
      fireEvent.click(
         screen.getByRole("button", { name: "Remover CAP SILVA" })
      );

      expect(mocks.onUpdateFuncBordo).toHaveBeenCalledWith(7, "IN");
      expect(mocks.onRemove).toHaveBeenCalledWith(7);
   });
});
