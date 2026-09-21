// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
   cleanup,
   fireEvent,
   render,
   screen,
   waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import EditarMissaoSimuladorPage from "@/app/(home)/instrucao/simulador/missao/[id]/page";
import { missaoEtpKeys } from "@/hooks/queries/useEtapas";
import type { MissaoComEtapasDetail } from "services/routes/estatistica/etapas";

const mocks = vi.hoisted(() => ({
   getMissao: vi.fn(),
   push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
   useParams: () => ({ id: "7" }),
   useRouter: () => ({ push: mocks.push }),
   useSearchParams: () => new URLSearchParams(),
}));
vi.mock("@/app/(home)/hooks/usePermBased", () => ({
   usePermBased: () => ({ hasPerm: () => true }),
}));
vi.mock("services/routes/estatistica/etapas", () => ({
   getMissao: mocks.getMissao,
}));
vi.mock(
   "@/app/(home)/instrucao/simulador/missao/components/SimuladorMissaoEditor",
   async () => {
      const { useState } = await import("react");
      return {
         SimuladorMissaoEditor: ({
            missao,
         }: {
            missao: MissaoComEtapasDetail;
         }) => {
            const [draft, setDraft] = useState("");
            return (
               <section aria-label="Editor de missão">
                  <p>{missao.titulo}</p>
                  <label htmlFor="draft">Rascunho</label>
                  <input
                     id="draft"
                     value={draft}
                     onChange={(event) => setDraft(event.target.value)}
                  />
               </section>
            );
         },
      };
   }
);

const missao: MissaoComEtapasDetail = {
   id: 7,
   titulo: "Missão carregada",
   obs: null,
   is_simulador: true,
   etapas: [],
};

function renderPage() {
   const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
   });
   render(
      <QueryClientProvider client={queryClient}>
         <EditarMissaoSimuladorPage />
      </QueryClientProvider>
   );
   return queryClient;
}

describe("página de edição da missão de simulador", () => {
   beforeEach(() => vi.clearAllMocks());
   afterEach(() => {
      cleanup();
      vi.restoreAllMocks();
   });

   it("mantém o editor e o rascunho quando um refetch posterior falha", async () => {
      mocks.getMissao
         .mockResolvedValueOnce(missao)
         .mockRejectedValueOnce(new Error("Servidor indisponível"));
      const queryClient = renderPage();
      const draft = await screen.findByLabelText<HTMLInputElement>("Rascunho");
      fireEvent.change(draft, { target: { value: "alteração não salva" } });

      await queryClient.refetchQueries({ queryKey: missaoEtpKeys.detail(7) });

      await waitFor(() =>
         expect(screen.getByText("Servidor indisponível")).not.toBeNull()
      );
      expect(screen.getByLabelText<HTMLInputElement>("Rascunho").value).toBe(
         "alteração não salva"
      );
      expect(
         screen.getByRole("button", { name: "Tentar novamente" })
      ).not.toBeNull();
   });

   it("mantém a tela de erro dedicada quando o primeiro carregamento falha", async () => {
      mocks.getMissao.mockRejectedValueOnce(new Error("Servidor indisponível"));
      renderPage();

      await waitFor(() =>
         expect(screen.getByText("Servidor indisponível")).not.toBeNull()
      );
      expect(screen.queryByLabelText("Rascunho")).toBeNull();
   });
});
