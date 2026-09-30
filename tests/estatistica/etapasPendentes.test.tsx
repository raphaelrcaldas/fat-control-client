// @vitest-environment jsdom

import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
   cleanup,
   render,
   screen,
   waitFor,
   within,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EtapasPendentesAlert } from "@/app/(home)/estatistica/etapas/components/EtapasPendentesAlert";
import type { ItemLabel } from "@/app/(home)/estatistica/etapas/components/itemLabel";
import { SESSAO_LABEL } from "@/app/(home)/instrucao/simulador/helpers/itemLabel";

const mocks = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock("services/Api", async (importOriginal) => ({
   ...(await importOriginal<typeof import("services/Api")>()),
   default: mocks.request,
}));

beforeEach(() => {
   mocks.request.mockReset();
   mocks.request.mockImplementation((_method, _url, _body, params) =>
      Promise.resolve(
         Response.json({
            data: {
               total: 1,
               total_missoes: 1,
               missoes: [
                  {
                     missao_id: params.is_simulador === "true" ? 7 : 8,
                     titulo:
                        params.is_simulador === "true"
                           ? "Simulador antigo"
                           : "Voo antigo",
                     etapa_id: 9,
                     primeira_data: "2024-01-01",
                     ultima_data: "2024-01-01",
                     total: 1,
                  },
               ],
            },
         })
      )
   );
});
afterEach(cleanup);

function renderAlerts() {
   const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
   });
   render(
      <QueryClientProvider client={client}>
         <EtapasPendentesAlert
            dataIni="2026-01-01"
            dataFim="2026-12-31"
            isSimulador
         />
         <EtapasPendentesAlert dataIni="2026-01-01" dataFim="2026-12-31" />
      </QueryClientProvider>
   );
   return client;
}

it("separa as consultas e abre a etapa antiga no editor de cada tela", async () => {
   renderAlerts();
   const simulador = await screen.findByRole("link", {
      name: /Simulador antigo/,
   });
   const voo = await screen.findByRole("link", { name: /Voo antigo/ });
   expect(simulador.getAttribute("href")).toBe(
      "/instrucao/simulador/missao/7?etapa=9"
   );
   expect(voo.getAttribute("href")).toBe(
      "/estatistica/etapas/missao/8?etapa=9"
   );
   expect(simulador.getAttribute("title")).toContain(
      "fora do período filtrado"
   );
   const filters = mocks.request.mock.calls.map((call) => call[3]);
   expect(filters).toEqual(
      expect.arrayContaining([
         { limit: "100", is_simulador: "true" },
         { limit: "100", is_simulador: "false" },
      ])
   );
});

it("atualiza as duas contagens ao invalidar etapas depois de salvar", async () => {
   const client = renderAlerts();
   await screen.findByRole("link", { name: /Simulador antigo/ });
   await screen.findByRole("link", { name: /Voo antigo/ });
   mocks.request.mockImplementation(() =>
      Promise.resolve(
         Response.json({ data: { total: 0, total_missoes: 0, missoes: [] } })
      )
   );
   await client.invalidateQueries({ queryKey: ["etapas"] });
   await waitFor(() =>
      expect(
         screen.queryByRole("region", { name: "Pendências de verificação" })
      ).toBeNull()
   );
});

it("distingue falha na consulta de ausência de pendências", async () => {
   mocks.request.mockRejectedValue(new Error("Sem conexão"));
   renderAlerts();
   await waitFor(() => expect(screen.getAllByRole("alert")).toHaveLength(2));
   expect(
      within(screen.getAllByRole("alert")[0]).getByRole("button", {
         name: "Tentar novamente",
      })
   ).not.toBeNull();
});

function mockPendentes(
   missoes: Array<{
      missao_id: number;
      titulo: string | null;
      primeira_data: string;
      trigramas?: string[];
      total?: number;
   }>,
   total = missoes.length
) {
   mocks.request.mockImplementation(() =>
      Promise.resolve(
         Response.json({
            data: {
               total,
               total_missoes: missoes.length,
               missoes: missoes.map((missao) => ({
                  etapa_id: 1,
                  ultima_data: missao.primeira_data,
                  total: 1,
                  ...missao,
               })),
            },
         })
      )
   );
}

function renderAlert(props: { isSimulador?: boolean; itemLabel?: ItemLabel }) {
   const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
   });
   render(
      <QueryClientProvider client={client}>
         <EtapasPendentesAlert
            dataIni="2026-01-01"
            dataFim="2026-12-31"
            {...props}
         />
      </QueryClientProvider>
   );
}

it("simulador: chips de missões com o mesmo título saem distintos pela dupla e pela data", async () => {
   mockPendentes([
      {
         missao_id: 1,
         titulo: "Simulador",
         primeira_data: "2026-03-05",
         trigramas: ["ABC", "DEF"],
      },
      {
         missao_id: 2,
         titulo: "Simulador",
         primeira_data: "2026-04-10",
         trigramas: ["GHI", "JKL", "MNO"],
      },
   ]);
   renderAlert({ isSimulador: true });

   const primeiro = await screen.findByRole("link", {
      name: /05\/03 ABC•DEF/,
   });
   const segundo = await screen.findByRole("link", {
      name: /10\/04 GHI•JKL•MNO/,
   });
   expect(primeiro).not.toBe(segundo);
   expect(screen.queryByText("Simulador")).toBeNull();
   // Chip mostra "DD/MM ABC•DEF"; o ano fica no title. Contagem preservada.
   expect(primeiro.getAttribute("title")).toContain("ABC•DEF 05/03/2026");
   const nomeSimulador = within(primeiro).getByText("05/03 ABC•DEF");
   expect(nomeSimulador.className).toContain("truncate");
   // O title do span mais interno vence o do Link: sem ele, o tooltip rico
   // (ano, contagem) é o que aparece ao passar o mouse sobre o nome.
   expect(nomeSimulador.hasAttribute("title")).toBe(false);
   expect(within(primeiro).getByText("1")).not.toBeNull();
});

it("simulador: sem trigramas (API antiga) cai no título da missão", async () => {
   mockPendentes([
      { missao_id: 1, titulo: "Simulador", primeira_data: "2026-03-05" },
      {
         missao_id: 2,
         titulo: "Simulador",
         primeira_data: "2026-03-06",
         trigramas: [],
      },
   ]);
   renderAlert({ isSimulador: true });

   expect(await screen.findAllByText("Simulador")).toHaveLength(2);
});

it("estatística: o chip continua com o título, mesmo que a API mande trigramas", async () => {
   mockPendentes([
      {
         missao_id: 1,
         titulo: "Voo antigo",
         primeira_data: "2026-03-05",
         trigramas: ["ABC"],
      },
      { missao_id: 2, titulo: null, primeira_data: "2026-03-06" },
   ]);
   renderAlert({});

   expect(await screen.findByText("Voo antigo")).not.toBeNull();
   expect(screen.getByText("Missão #2")).not.toBeNull();
   expect(screen.queryByText(/ABC/)).toBeNull();
});

it("estatística: textos padrão falam em etapa", async () => {
   mockPendentes(
      [{ missao_id: 1, titulo: "Voo antigo", primeira_data: "2026-03-05" }],
      3
   );
   renderAlert({});

   expect(
      await screen.findByText("3 etapas pendentes de verificação")
   ).not.toBeNull();
   const link = screen.getByRole("link", { name: /Voo antigo/ });
   expect(link.getAttribute("title")).toBe(
      "Abrir Voo antigo — 1 etapa(s) pendente(s)"
   );
   const nome = within(link).getByText("Voo antigo");
   expect(nome.className).toContain("truncate");
   expect(nome.hasAttribute("title")).toBe(false);
});

it("estatística: singular e mensagem de falha padrão falam em etapa", async () => {
   mockPendentes(
      [{ missao_id: 1, titulo: "Voo antigo", primeira_data: "2026-03-05" }],
      1
   );
   renderAlert({});
   expect(
      await screen.findByText("1 etapa pendente de verificação")
   ).not.toBeNull();

   cleanup();
   mocks.request.mockRejectedValue(new Error("Sem conexão"));
   renderAlert({});
   expect(
      await screen.findByText("Não foi possível verificar as etapas pendentes.")
   ).not.toBeNull();
});

it("simulador: itemLabel troca o vocabulário dos textos", async () => {
   mockPendentes(
      [
         {
            missao_id: 1,
            titulo: "Simulador",
            primeira_data: "2026-03-05",
            trigramas: ["ABC"],
         },
      ],
      3
   );
   renderAlert({ isSimulador: true, itemLabel: SESSAO_LABEL });

   expect(
      await screen.findByText("3 sessões pendentes de verificação")
   ).not.toBeNull();
   expect(screen.getByRole("link", { name: /ABC/ }).getAttribute("title")).toBe(
      "Abrir ABC 05/03/2026 — 1 sessão(s) pendente(s)"
   );

   cleanup();
   mockPendentes([
      { missao_id: 1, titulo: "Simulador", primeira_data: "2026-03-05" },
   ]);
   renderAlert({ isSimulador: true, itemLabel: SESSAO_LABEL });
   expect(
      await screen.findByText("1 sessão pendente de verificação")
   ).not.toBeNull();
});
