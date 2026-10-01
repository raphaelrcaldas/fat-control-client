// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
   act,
   cleanup,
   fireEvent,
   render,
   screen,
   waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ComissList } from "services/routes/cegep/comiss";

const navigation = vi.hoisted(() => {
   process.env.NEXT_PUBLIC_API_URL = "http://localhost/";
   return {
      current: new URLSearchParams(),
      listeners: new Set<() => void>(),
   };
});

vi.mock("next/navigation", async () => {
   const { useSyncExternalStore } = await import("react");
   const navigate = (url: string) => {
      navigation.current = new URLSearchParams(url.split("?")[1] ?? "");
      navigation.listeners.forEach((listener) => listener());
   };
   const router = { replace: navigate, push: navigate };
   return {
      useRouter: () => router,
      usePathname: () => "/cegep/comiss",
      useSearchParams: () =>
         useSyncExternalStore(
            (listener) => {
               navigation.listeners.add(listener);
               return () => navigation.listeners.delete(listener);
            },
            () => navigation.current
         ),
   };
});
vi.mock("@/app/context/auth", () => ({ useAuth: () => ({ role: "admin" }) }));

import { ListaPage } from "@/app/(home)/cegep/comiss/listaPage";

function registro(id: number, nome: string, antiguidade: number): ComissList {
   return {
      id,
      user_id: id,
      status: "aberto",
      dep: false,
      data_ab: "2026-01-01",
      data_fc: "2026-03-01",
      qtd_aj_ab: 1,
      valor_aj_ab: 335,
      qtd_aj_fc: 0,
      valor_aj_fc: 0,
      dias_cumprir: 10,
      doc_prop: "P",
      doc_aut: "A",
      doc_enc: null,
      dias_comp: 2,
      diarias_comp: 0,
      vals_comp: 0,
      modulo: false,
      completude: 20,
      missoes_count: 0,
      user: {
         id,
         p_g: "3s",
         nome_guerra: nome,
         nome_completo: nome,
         unidade: "11gt",
         active: true,
         quadro: null,
         esp: null,
         id_fab: null,
         ult_promo: "2020-01-01",
         ant_rel: antiguidade,
         telefone: null,
         promocoes: [],
         posto: {
            ant: 14,
            short: "3s",
            mid: "3º sgt",
            long: "terceiro sargento",
            circulo: "grad",
         },
      },
   };
}

let client: QueryClient;
let requests: URL[];
let rows: ComissList[];

beforeEach(() => {
   navigation.current = new URLSearchParams();
   requests = [];
   rows = [registro(1, "MODERNO", 20), registro(2, "ANTIGO", 1)];
   vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string) => {
         const url = new URL(input, "http://localhost/");
         requests.push(url);
         const fechado = url.searchParams.get("status") === "fechado";
         const body = {
            status: "success",
            data: rows,
            errors: null,
            message: null,
            timestamp: "2026-10-01T12:00:00",
            ...(fechado
               ? {
                    total: 25,
                    pages: 2,
                    per_page: 20,
                    page: Number(url.searchParams.get("page") || 1),
                    total_items: null,
                 }
               : {}),
         };
         return new Response(JSON.stringify(body), {
            headers: { "Content-Type": "application/json" },
         });
      })
   );
   client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});

afterEach(() => {
   cleanup();
   client.clear();
   vi.unstubAllGlobals();
});

function renderPage() {
   render(
      <QueryClientProvider client={client}>
         <ListaPage />
      </QueryClientProvider>
   );
}

describe("Comissionamentos — lista completa e histórico paginado", () => {
   it("mostra todos os abertos na ordem recebida e troca a situação pelo grupo", async () => {
      rows.push(
         ...Array.from({ length: 23 }, (_, i) =>
            registro(i + 3, `MILITAR ${i}`, i + 30)
         )
      );
      renderPage();
      await screen.findAllByText(/MODERNO/);
      expect(document.querySelectorAll("tbody tr")).toHaveLength(25);
      expect(document.querySelector("tbody tr")?.textContent).toContain(
         "MODERNO"
      );
      expect(requests[0].searchParams.get("page")).toBeNull();
      expect(requests[0].searchParams.get("order_by")).toBe("militar");
      fireEvent.click(screen.getByRole("button", { name: "Filtros: Abertos" }));
      const closed = screen.getByRole("radio", { name: "Fechados" });
      expect(screen.queryByRole("radio", { name: "Todos" })).toBeNull();
      fireEvent.click(closed);
      await waitFor(() =>
         expect(requests.at(-1)?.searchParams.get("status")).toBe("fechado")
      );
      expect(requests.at(-1)?.searchParams.get("page")).toBe("1");
   });

   it("mantém filtros e ordenação na URL, navega e reinicia a página ao ordenar", async () => {
      navigation.current = new URLSearchParams(
         "status=fechado&order_by=data_fc&direction=desc&search=SILVA"
      );
      renderPage();
      await screen.findAllByText(/MODERNO/);
      fireEvent.click(screen.getByRole("button", { name: "Próximo" }));
      await waitFor(() =>
         expect(requests.at(-1)?.searchParams.get("page")).toBe("2")
      );
      expect(requests.at(-1)?.searchParams.get("search")).toBe("SILVA");
      expect(requests.at(-1)?.searchParams.get("order_by")).toBe("data_fc");
      fireEvent.click(
         screen.getByText("Abertura", { selector: "th span span" })
      );
      await waitFor(() =>
         expect(requests.at(-1)?.searchParams.get("order_by")).toBe("data_ab")
      );
      expect(requests.at(-1)?.searchParams.get("page")).toBe("1");
      expect(requests.at(-1)?.searchParams.get("direction")).toBe("asc");
      expect(navigation.current.get("search")).toBe("SILVA");
      // A tabela não deve aplicar antiguidade por cima da ordem do servidor.
      expect(document.querySelector("tbody tr")?.textContent).toContain(
         "MODERNO"
      );
   });

   it("reinicia a página junto da busca, sem consultar o novo termo na página antiga", async () => {
      navigation.current = new URLSearchParams("status=fechado&page=2");
      renderPage();
      await screen.findAllByText(/MODERNO/);
      fireEvent.click(
         screen.getByRole("button", { name: /Filtros: Fechados/ })
      );
      fireEvent.change(screen.getByLabelText("Militar"), {
         target: { value: "NOVO" },
      });
      await waitFor(() =>
         expect(requests.at(-1)?.searchParams.get("search")).toBe("NOVO")
      );
      const buscas = requests.filter(
         (url) => url.searchParams.get("search") === "NOVO"
      );
      expect(buscas.length).toBeGreaterThan(0);
      expect(buscas.every((url) => url.searchParams.get("page") === "1")).toBe(
         true
      );
   });

   it("usa a ordenação padrão de cada situação quando a URL não traz order_by", async () => {
      renderPage();
      await screen.findAllByText(/MODERNO/);
      expect(requests.at(-1)?.searchParams.get("order_by")).toBe("militar");
      expect(requests.at(-1)?.searchParams.get("direction")).toBe("asc");
      cleanup();
      requests = [];
      // `direction` solta, sem `order_by`, é ignorada.
      navigation.current = new URLSearchParams("status=fechado&direction=asc");
      renderPage();
      await screen.findAllByText(/MODERNO/);
      expect(requests.at(-1)?.searchParams.get("order_by")).toBe("data_fc");
      expect(requests.at(-1)?.searchParams.get("direction")).toBe("desc");
   });

   it("mantém a ordenação explícita ao alternar Abertos e Fechados", async () => {
      navigation.current = new URLSearchParams(
         "order_by=modulo&direction=desc"
      );
      renderPage();
      await screen.findAllByText(/MODERNO/);
      fireEvent.click(screen.getByRole("button", { name: /Filtros: Abertos/ }));
      fireEvent.click(screen.getByRole("radio", { name: "Fechados" }));
      await waitFor(() =>
         expect(requests.at(-1)?.searchParams.get("status")).toBe("fechado")
      );
      expect(requests.at(-1)?.searchParams.get("order_by")).toBe("modulo");
      expect(requests.at(-1)?.searchParams.get("direction")).toBe("desc");
      expect(navigation.current.get("order_by")).toBe("modulo");
      expect(navigation.current.get("direction")).toBe("desc");
      fireEvent.click(screen.getByRole("radio", { name: "Abertos" }));
      await waitFor(() =>
         expect(requests.at(-1)?.searchParams.get("status")).toBe("aberto")
      );
      expect(requests.at(-1)?.searchParams.get("order_by")).toBe("modulo");
      expect(requests.at(-1)?.searchParams.get("direction")).toBe("desc");
      expect(navigation.current.get("order_by")).toBe("modulo");
   });

   it("em Fechados, clicar em Militar grava a ordem explícita na URL", async () => {
      navigation.current = new URLSearchParams("status=fechado");
      renderPage();
      await screen.findAllByText(/MODERNO/);
      fireEvent.click(
         screen.getByText("Militar", { selector: "th span span" })
      );
      await waitFor(() =>
         expect(requests.at(-1)?.searchParams.get("order_by")).toBe("militar")
      );
      expect(requests.at(-1)?.searchParams.get("direction")).toBe("asc");
      expect(navigation.current.get("order_by")).toBe("militar");
      expect(navigation.current.get("direction")).toBe("asc");
   });

   it("clicar na coluna do padrão da situação alterna a direção e, ao voltar ao padrão, limpa a URL", async () => {
      navigation.current = new URLSearchParams("status=fechado");
      renderPage();
      await screen.findAllByText(/MODERNO/);
      fireEvent.click(
         screen.getByText("Fechamento", { selector: "th span span" })
      );
      await waitFor(() =>
         expect(requests.at(-1)?.searchParams.get("direction")).toBe("asc")
      );
      expect(requests.at(-1)?.searchParams.get("order_by")).toBe("data_fc");
      expect(navigation.current.get("order_by")).toBe("data_fc");
      fireEvent.click(
         screen.getByText("Fechamento", { selector: "th span span" })
      );
      await waitFor(() =>
         expect(navigation.current.has("order_by")).toBe(false)
      );
      expect(navigation.current.has("direction")).toBe(false);
      expect(requests.at(-1)?.searchParams.get("direction")).toBe("desc");
   });

   it("normaliza links antigos com Todos para Abertos sem cortar a lista", async () => {
      navigation.current = new URLSearchParams(
         "status=todos&page=2&order_by=data_fc&direction=desc"
      );
      renderPage();
      await screen.findAllByText(/MODERNO/);
      expect(requests.at(-1)?.searchParams.get("status")).toBe("aberto");
      expect(requests.at(-1)?.searchParams.get("page")).toBeNull();
      expect(navigation.current.get("status")).toBeNull();
      expect(navigation.current.get("order_by")).toBe("data_fc");
   });

   it("mantém a página anterior durante a busca da seguinte sem corrigir a URL pelo placeholder", async () => {
      navigation.current = new URLSearchParams("status=fechado");
      renderPage();
      await screen.findAllByText(/MODERNO/);
      let resolve!: (value: Response) => void;
      vi.mocked(fetch).mockImplementationOnce(
         () =>
            new Promise<Response>((done) => {
               resolve = done;
            })
      );
      fireEvent.click(screen.getByRole("button", { name: "Próximo" }));
      await waitFor(() => expect(navigation.current.get("page")).toBe("2"));
      expect(document.querySelector("tbody tr")?.textContent).toContain(
         "MODERNO"
      );
      const paging = screen.getByRole("group", {
         name: "Paginação dos comissionamentos fechados",
      });
      expect(paging.hasAttribute("disabled")).toBe(true);
      await act(async () => {
         resolve(
            new Response(
               JSON.stringify({
                  status: "success",
                  data: [registro(30, "PÁGINA DOIS", 30)],
                  total: 21,
                  pages: 2,
                  page: 2,
                  per_page: 20,
                  total_items: null,
                  message: null,
                  errors: null,
                  timestamp: "2026-10-01T12:00:00",
               })
            )
         );
      });
      await screen.findAllByText(/PÁGINA DOIS/);
      expect(navigation.current.get("page")).toBe("2");
      expect(paging.hasAttribute("disabled")).toBe(false);
   });

   it("retorna à última página disponível quando uma exclusão esvazia a página solicitada", async () => {
      navigation.current = new URLSearchParams("status=fechado&page=2");
      vi.mocked(fetch).mockResolvedValueOnce(
         new Response(
            JSON.stringify({
               status: "success",
               data: [],
               total: 20,
               pages: 1,
               page: 2,
               per_page: 20,
               total_items: null,
               message: null,
               errors: null,
               timestamp: "2026-10-01T12:00:00",
            })
         )
      );
      renderPage();
      await screen.findAllByText(/MODERNO/);
      expect(navigation.current.get("page")).toBeNull();
      expect(requests.at(-1)?.searchParams.get("page")).toBe("1");
   });

   it("limita a página da URL ao teto da API e a leva à última página existente", async () => {
      navigation.current = new URLSearchParams("status=fechado&page=20000");
      vi.mocked(fetch).mockResolvedValueOnce(
         new Response(
            JSON.stringify({
               status: "success",
               data: [],
               total: 25,
               pages: 2,
               page: 10000,
               per_page: 20,
               total_items: null,
               message: null,
               errors: null,
               timestamp: "2026-10-01T12:00:00",
            })
         )
      );
      renderPage();
      await screen.findAllByText(/MODERNO/);
      // A resposta mockada acima não passa por `requests`; lê a chamada crua.
      const primeira = new URL(
         String(vi.mocked(fetch).mock.calls[0][0]),
         "http://localhost/"
      );
      expect(primeira.searchParams.get("page")).toBe("10000");
      expect(navigation.current.get("page")).toBe("2");
      expect(requests.at(-1)?.searchParams.get("page")).toBe("2");
   });

   it("mostra a situação, e não o total anterior, enquanto a troca de situação carrega", async () => {
      navigation.current = new URLSearchParams("status=fechado");
      renderPage();
      await screen.findAllByText(/MODERNO/);
      const subtitulo = () =>
         screen.getByRole("heading", { name: "Registros" }).nextElementSibling
            ?.textContent;
      expect(subtitulo()).toBe("25 comissionamentos");
      let resolve!: (value: Response) => void;
      vi.mocked(fetch).mockImplementationOnce(
         () =>
            new Promise<Response>((done) => {
               resolve = done;
            })
      );
      fireEvent.click(
         screen.getByRole("button", { name: /Filtros: Fechados/ })
      );
      fireEvent.click(screen.getByRole("radio", { name: "Abertos" }));
      await waitFor(() => expect(navigation.current.has("status")).toBe(false));
      expect(subtitulo()).toBe("Abertos");
      await act(async () => {
         resolve(
            new Response(
               JSON.stringify({
                  status: "success",
                  data: rows,
                  message: null,
                  errors: null,
                  timestamp: "2026-10-01T12:00:00",
               })
            )
         );
      });
      await waitFor(() => expect(subtitulo()).toBe("2 comissionamentos"));
   });

   it("preserva a lista e informa falha quando a atualização da página atual retorna erro", async () => {
      navigation.current = new URLSearchParams("status=fechado");
      renderPage();
      await screen.findAllByText(/MODERNO/);
      vi.mocked(fetch).mockResolvedValueOnce(
         new Response(
            JSON.stringify({
               status: "error",
               message: "Indisponível",
               errors: null,
            }),
            { status: 503 }
         )
      );
      await act(async () => {
         await client.refetchQueries({ queryKey: ["comiss", "list"] });
      });
      expect(
         await screen.findByText("Não foi possível atualizar a lista")
      ).not.toBeNull();
      expect(document.querySelector("tbody tr")?.textContent).toContain(
         "MODERNO"
      );
      expect(
         screen.getByRole("button", { name: "Tentar novamente" })
      ).not.toBeNull();
   });
});
