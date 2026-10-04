// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { TripulanteSearchModal } from "@/app/(home)/estatistica/tripulante/components/TripulanteSearchModal";

const { useSearch } = vi.hoisted(() => ({ useSearch: vi.fn() }));
vi.mock("@/hooks/queries/useTrips", () => ({
   useTrips: useSearch,
}));
vi.mock("@/hooks/useDebouncedValue", () => ({
   default: (value: string) => value,
}));

afterEach(() => {
   cleanup();
   vi.clearAllMocks();
});

const activeTrip = {
   id: 7,
   trig: "FUL",
   active: true,
   user: {
      active: true,
      posto: { short: "2º Sgt" },
      quadro: "QSS",
      esp: "BMA",
      nome_guerra: "Fulano",
      nome_completo: "Fulano da Silva",
   },
};
const inactiveTrip = {
   ...activeTrip,
   id: 9,
   trig: "OUT",
   active: false,
   user: {
      ...activeTrip.user,
      nome_guerra: "Outro",
      nome_completo: "Outro da Silva",
   },
};

const userInactiveTrip = {
   ...activeTrip,
   id: 11,
   trig: "USR",
   active: true,
   user: {
      ...activeTrip.user,
      active: false,
      nome_guerra: "Desligado",
      nome_completo: "Desligado da Silva",
   },
};

describe("busca do relatório do tripulante", () => {
   it("apresenta a identidade militar e indica o tripulante já selecionado", () => {
      useSearch.mockReturnValue({
         data: { items: [activeTrip], total: 1, pages: 1 },
         isFetching: false,
         isError: false,
      });
      render(
         <TripulanteSearchModal
            show
            selectedTripId={7}
            onClose={vi.fn()}
            onSelect={vi.fn()}
         />
      );
      fireEvent.change(
         screen.getByRole("textbox", { name: "Buscar por nome ou trigrama" }),
         { target: { value: "ful" } }
      );
      const result = screen.getByRole("button", { name: /FUL/ });
      expect(result.textContent).toContain("2º Sgt QSS BMA Fulano");
      expect(result.textContent).toContain("Fulano da Silva");
      expect(result.getAttribute("aria-current")).toBe("true");
      expect(screen.getByText("1 tripulante encontrado")).toBeTruthy();
   });

   it("preserva a ordem recebida dentro de cada grupo", () => {
      const senior = {
         ...activeTrip,
         id: 12,
         trig: "ANT",
         user: { ...activeTrip.user, nome_guerra: "Antigo" },
      };
      useSearch.mockReturnValue({
         data: {
            items: [senior, activeTrip, inactiveTrip],
            total: 3,
            pages: 1,
         },
         isFetching: false,
         isError: false,
      });
      render(
         <TripulanteSearchModal show onClose={vi.fn()} onSelect={vi.fn()} />
      );
      fireEvent.change(
         screen.getByRole("textbox", { name: "Buscar por nome ou trigrama" }),
         { target: { value: "silva" } }
      );
      const results = screen
         .getAllByRole("button")
         .filter((button) => button.textContent?.includes("da Silva"));
      expect(
         results.map((button) => button.textContent?.match(/ANT|FUL|OUT/)?.[0])
      ).toEqual(["ANT", "FUL", "OUT"]);
   });

   it("agrupa em Inativos o tripulante ativo cujo usuário está inativo", () => {
      useSearch.mockReturnValue({
         data: { items: [userInactiveTrip], total: 1, pages: 1 },
         isFetching: false,
         isError: false,
      });
      render(
         <TripulanteSearchModal show onClose={vi.fn()} onSelect={vi.fn()} />
      );
      fireEvent.change(
         screen.getByRole("textbox", { name: "Buscar por nome ou trigrama" }),
         { target: { value: "usr" } }
      );
      expect(screen.queryByRole("heading", { name: "Ativos" })).toBeNull();
      expect(screen.getByRole("heading", { name: "Inativos" })).toBeTruthy();
      expect(screen.getByRole("button", { name: /USR/ })).toBeTruthy();
   });

   it("busca pelo match sem filtro de situação e permite selecionar inativo", () => {
      useSearch.mockReturnValue({
         data: { items: [activeTrip, inactiveTrip], total: 2, pages: 1 },
         isFetching: false,
         isError: false,
      });
      const onSelect = vi.fn();
      const onClose = vi.fn();
      render(
         <TripulanteSearchModal show onClose={onClose} onSelect={onSelect} />
      );
      fireEvent.change(
         screen.getByRole("textbox", { name: "Buscar por nome ou trigrama" }),
         { target: { value: "silva" } }
      );
      expect(useSearch).toHaveBeenLastCalledWith(
         { search: "silva", page: 1, per_page: 10, include_inactive: true },
         true
      );
      expect(screen.queryByRole("combobox")).toBeNull();
      expect(screen.getByRole("heading", { name: "Ativos" })).toBeTruthy();
      expect(screen.getByRole("heading", { name: "Inativos" })).toBeTruthy();
      fireEvent.click(screen.getByRole("button", { name: /OUT/ }));
      expect(onSelect).toHaveBeenCalledWith(inactiveTrip);
      expect(onClose).toHaveBeenCalledOnce();
   });

   it("volta para a primeira página quando o termo muda", () => {
      useSearch.mockReturnValue({
         data: { items: [activeTrip], total: 21, pages: 3 },
         isFetching: false,
         isError: false,
      });
      render(
         <TripulanteSearchModal show onClose={vi.fn()} onSelect={vi.fn()} />
      );
      const input = screen.getByRole("textbox", {
         name: "Buscar por nome ou trigrama",
      });
      fireEvent.change(input, { target: { value: "silva" } });
      fireEvent.click(screen.getByRole("button", { name: "Próxima" }));
      expect(useSearch).toHaveBeenLastCalledWith(
         { search: "silva", page: 2, per_page: 10, include_inactive: true },
         true
      );
      useSearch.mockClear();
      fireEvent.change(input, { target: { value: "ful" } });
      expect(useSearch).toHaveBeenLastCalledWith(
         { search: "ful", page: 1, per_page: 10, include_inactive: true },
         true
      );
      // Nenhuma consulta sai com o termo antigo na página 1.
      expect(
         useSearch.mock.calls.some(
            ([params]) => params.search === "silva" && params.page === 1
         )
      ).toBe(false);
   });

   it("mantém a seleção indisponível durante uma busca nova", () => {
      useSearch.mockReturnValue({
         data: { items: [activeTrip], total: 1, pages: 1 },
         isFetching: true,
         isError: false,
      });
      render(
         <TripulanteSearchModal show onClose={vi.fn()} onSelect={vi.fn()} />
      );
      fireEvent.change(
         screen.getByRole("textbox", { name: "Buscar por nome ou trigrama" }),
         { target: { value: "ful" } }
      );
      expect(
         screen.getByRole("button", { name: /FUL/ }).hasAttribute("disabled")
      ).toBe(true);
   });
});
