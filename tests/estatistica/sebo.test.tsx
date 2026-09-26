// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import {
   act,
   cleanup,
   render,
   renderHook,
   screen,
   fireEvent,
   waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
   getDateBadgeClasses,
   getDateTooltip,
   getDsvBadgeClasses,
   renderSeboTooltip,
} from "@/app/(home)/estatistica/sebo/utils";
import { useSeboFilters } from "@/app/(home)/estatistica/sebo/hooks/useSeboFilters";
import SeboPage from "@/app/(home)/estatistica/sebo/page";
import { seboKeys } from "@/hooks/queries/useSebo";
import type { SeboTripItem } from "services/routes/estatistica/sebo";

const mocks = vi.hoisted(() => ({
   getSebo: vi.fn(),
   posicoes: () => [{ cod: "MC" }],
}));
vi.mock("services/routes/estatistica/sebo", () => ({ getSebo: mocks.getSebo }));
vi.mock("@/hooks/queries/useFuncoes", () => ({
   useFuncoes: () => ({ posicoes: mocks.posicoes }),
}));
vi.mock("next/dynamic", () => ({ default: () => () => null }));
vi.mock("@/app/(home)/estatistica/sebo/hooks/useSeboDesktop", () => ({
   useSeboDesktop: () => false,
}));

const trip: SeboTripItem = {
   trip_id: 1,
   p_g: "CAP",
   trig: "ABC",
   nome_guerra: "Pessoa",
   func: "mc",
   oper: "op",
   voo: { h_ano: 60, dsv: 35, data_ult_voo: null },
   cartoes: {
      cemal: null,
      tovn: null,
      imae: null,
      crm: null,
      val_pass: null,
      val_visa: null,
      cvi: null,
      ptai: null,
   },
};

afterEach(() => {
   cleanup();
   localStorage.clear();
   vi.useRealTimers();
   vi.clearAllMocks();
});

describe("Sebo — validade e conteúdo externo", () => {
   it("mantém o cartão válido no vencimento e alerta até 60 dias", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 8, 25, 12));
      expect(getDateBadgeClasses("2026-09-25")).toContain("bg-yellow");
      expect(getDateTooltip("2026-09-25", "CVI")).toContain("vence hoje");
      expect(getDateBadgeClasses("2026-11-24")).toContain("bg-yellow");
      // Em dia fica sem fundo: só a exceção ganha badge preenchido.
      expect(getDateBadgeClasses("2026-11-25")).not.toMatch(/\bbg-/);
      expect(getDateBadgeClasses("2026-09-24")).toContain("bg-red");
   });
   it("não deixa a classe branca disputar a cor de alerta", () => {
      expect(getDsvBadgeClasses(35).split(" ")).not.toContain("text-white");
   });
   it("só preenche o DSV fora da faixa normal", () => {
      expect(getDsvBadgeClasses(30)).not.toMatch(/\bbg-/);
      expect(getDsvBadgeClasses(31)).toContain("bg-yellow");
      expect(getDsvBadgeClasses(46)).toContain("bg-red");
   });
   it("renderiza os campos do tooltip como texto sem criar elementos injetados", () => {
      const payload = '<img src=x onerror="alert(1)"> & \"teste\"';
      const container = document.createElement("div");
      container.innerHTML = renderSeboTooltip(
         { ...trip, trig: payload, nome_guerra: payload, oper: payload },
         "",
         "01:00"
      );
      expect(container.querySelector("img")).toBeNull();
      expect(container.textContent).toContain(payload.toUpperCase());
      container.innerHTML = renderSeboTooltip(undefined, payload, payload);
      expect(container.querySelector("img")).toBeNull();
      expect(container.textContent).toContain(payload);
   });
});

function renderFilters() {
   const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
   });
   const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
   );
   return { ...renderHook(() => useSeboFilters(), { wrapper }), client };
}

describe("Sebo — filtros e falhas", () => {
   it("esvazia o resultado ao desligar todas as operacionalidades, inclusive com cache preenchido", async () => {
      mocks.getSebo.mockResolvedValue([trip]);
      const { result } = renderFilters();
      await waitFor(() => expect(result.current.trips).toHaveLength(1));
      act(() => {
         result.current.setOpIn(false);
         result.current.setOpOp(false);
         result.current.setOpBa(false);
         result.current.setOpAl(false);
      });
      await waitFor(() => expect(result.current.trips).toHaveLength(0));
      act(() => result.current.setOpOp(true));
      await waitFor(() => expect(result.current.trips).toHaveLength(1));
   });
   it("expõe a falha inicial para diferenciá-la de resultado vazio", async () => {
      mocks.getSebo.mockRejectedValue(new Error("Servidor indisponível"));
      const { result } = renderFilters();
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.trips).toHaveLength(0);
   });
});

function renderPage() {
   const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
   });
   render(
      <QueryClientProvider client={client}>
         <SeboPage />
      </QueryClientProvider>
   );
   return client;
}

describe("Sebo — comportamento da página", () => {
   it("mostra erro com nova tentativa em vez de orientar a mudar filtros", async () => {
      mocks.getSebo
         .mockRejectedValueOnce(new Error("Indisponível"))
         .mockResolvedValueOnce([trip]);
      renderPage();
      const retry = await screen.findByRole("button", {
         name: "Tentar novamente",
      });
      expect(screen.queryByText("Nenhum resultado encontrado")).toBeNull();
      fireEvent.click(retry);
      expect(await screen.findByText("Pessoa")).not.toBeNull();
   });
   it("preserva dados e seleção por pessoa após refetch, reordenação e erro", async () => {
      const second = {
         ...trip,
         trip_id: 2,
         trig: "DEF",
         nome_guerra: "Segunda pessoa",
         voo: { ...trip.voo, h_ano: 30 },
      };
      mocks.getSebo.mockResolvedValueOnce([trip, second]);
      const client = renderPage();
      const row = (await screen.findByText("Segunda pessoa")).closest("tr")!;
      fireEvent.keyDown(row, { key: "Enter" });
      expect(row.getAttribute("aria-current")).toBe("true");
      let resolve!: (data: SeboTripItem[]) => void;
      mocks.getSebo.mockImplementationOnce(
         () =>
            new Promise<SeboTripItem[]>((done) => {
               resolve = done;
            })
      );
      let fetching!: Promise<void>;
      act(() => {
         fetching = client.refetchQueries({ queryKey: seboKeys.all });
      });
      expect(
         screen
            .getByText("Segunda pessoa")
            .closest("[aria-busy]")
            ?.getAttribute("aria-busy")
      ).toBe("false");
      await act(async () => {
         resolve([second, trip]);
         await fetching;
      });
      await waitFor(() =>
         expect(
            screen
               .getByText("Segunda pessoa")
               .closest("tr")
               ?.getAttribute("aria-current")
         ).toBe("true")
      );
      mocks.getSebo.mockRejectedValueOnce(new Error("Indisponível"));
      await act(async () => {
         await client.refetchQueries({ queryKey: seboKeys.all });
      });
      expect(
         await screen.findByRole("button", { name: "Tentar novamente" })
      ).not.toBeNull();
      expect(screen.getByText("Segunda pessoa")).not.toBeNull();
   });
});
