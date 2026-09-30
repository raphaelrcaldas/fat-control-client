// @vitest-environment jsdom

// Erro na listagem de duplas: com dados em cache a mensagem fala da
// atualização que falhou (e o filtro sem resultado ainda mostra o estado
// vazio); sem dados, é falha de carregamento. `hasDuplas` olha o cache ANTES
// do filtro de piloto.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import SimuladorPage from "@/app/(home)/instrucao/simulador/page";
import type { Dupla } from "@/app/(home)/instrucao/simulador/types";

const mocks = vi.hoisted(() => ({
   piloto: "",
   duplaState: {
      duplas: [] as unknown[],
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
   },
}));

vi.mock("next/navigation", () => ({
   useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
   useSearchParams: () =>
      new URLSearchParams({ ano: "2026", piloto: mocks.piloto }),
}));
vi.mock("@/app/(home)/hooks/usePermBased", () => ({
   PermBased: ({ children }: { children: React.ReactNode }) => children,
   usePermBased: () => ({ hasPerm: () => true }),
}));
vi.mock("@/app/(home)/instrucao/simulador/hooks/useSimuladorDuplas", () => ({
   useSimuladorDuplas: () => mocks.duplaState,
}));
vi.mock("@/app/(home)/instrucao/simulador/hooks/useSimuladorActions", () => ({
   useSimuladorActions: () => ({
      deleteDupla: vi.fn(),
      isDeletingDupla: false,
   }),
}));
vi.mock(
   "@/app/(home)/estatistica/etapas/components/EtapasPendentesAlert",
   () => ({ EtapasPendentesAlert: () => null })
);
vi.mock(
   "@/app/(home)/instrucao/simulador/components/DuplasList/DuplasList",
   () => ({
      DuplasList: ({ duplas }: { duplas: Dupla[] }) => (
         <ul aria-label="Duplas">
            {duplas.map((d) => (
               <li key={d.key}>{d.key}</li>
            ))}
         </ul>
      ),
   })
);

const dupla: Dupla = {
   key: "1",
   missaoId: 1,
   obs: null,
   etapas: [],
   pilots: [
      {
         trip_id: 1,
         trig: "ABC",
         nome_guerra: "Silva",
         p_g: "CAP",
         func: "pil",
         func_bordo: "p",
      },
   ],
};

const ERRO_SEM_DADOS =
   "Erro ao carregar as sessões do simulador. Verifique a conexão e tente novamente.";
const ERRO_COM_CACHE =
   "Não foi possível atualizar as sessões do simulador. Exibindo a última consulta disponível.";

describe("listagem do simulador — erro e cache", () => {
   beforeEach(() => {
      mocks.piloto = "";
      mocks.duplaState = {
         duplas: [],
         isLoading: false,
         isFetching: false,
         isError: false,
         refetch: vi.fn(),
      };
   });
   afterEach(cleanup);

   it("erro com cache e filtro de piloto sem resultado: fala da última consulta e mostra o estado vazio", () => {
      mocks.piloto = "ZZZ";
      mocks.duplaState.duplas = [dupla];
      mocks.duplaState.isError = true;
      render(<SimuladorPage />);

      expect(screen.getByText(ERRO_COM_CACHE)).not.toBeNull();
      expect(screen.queryByText(/Verifique a conexão/)).toBeNull();
      expect(screen.getByText("Nenhuma dupla encontrada")).not.toBeNull();
      expect(screen.queryByLabelText("Duplas")).toBeNull();
   });

   it("erro com cache e filtro que casa: mantém a lista, sem estado vazio", () => {
      mocks.piloto = "silva";
      mocks.duplaState.duplas = [dupla];
      mocks.duplaState.isError = true;
      render(<SimuladorPage />);

      expect(screen.getByText(ERRO_COM_CACHE)).not.toBeNull();
      expect(screen.getByLabelText("Duplas")).not.toBeNull();
      expect(screen.queryByText("Nenhuma dupla encontrada")).toBeNull();
   });

   it("erro sem dados: pede para verificar a conexão e não mostra estado vazio", () => {
      mocks.duplaState.isError = true;
      render(<SimuladorPage />);

      expect(screen.getByText(ERRO_SEM_DADOS)).not.toBeNull();
      expect(screen.queryByText(ERRO_COM_CACHE)).toBeNull();
      expect(screen.queryByText("Nenhuma dupla disponível")).toBeNull();
      expect(screen.queryByText("Nenhuma dupla encontrada")).toBeNull();
      expect(
         screen.getByRole("button", { name: "Tentar novamente" })
      ).not.toBeNull();
   });

   it("sem erro e sem dados: estado vazio sem alerta", () => {
      render(<SimuladorPage />);

      expect(screen.getByText("Nenhuma dupla disponível")).not.toBeNull();
      expect(screen.queryByText(ERRO_SEM_DADOS)).toBeNull();
      expect(screen.queryByText(ERRO_COM_CACHE)).toBeNull();
   });
});
