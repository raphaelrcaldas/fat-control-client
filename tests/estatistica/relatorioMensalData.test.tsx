// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
   getRelatorioMensal,
   relatorioMensalSchema,
} from "services/routes/estatistica/relatorioMensal";
import {
   relatorioMensalKeys,
   useRelatorioMensal,
} from "@/hooks/queries/useRelatorioMensal";
import { relatorioMensalFixture } from "./fixtures/relatorioMensal";

const mocks = vi.hoisted(() => ({
   request: vi.fn(),
   org: "11gt" as string | null,
}));
vi.mock("services/Api", async (importOriginal) => ({
   ...(await importOriginal<object>()),
   default: mocks.request,
}));
vi.mock("@/app/context/auth", () => ({
   useAuth: () => ({ activeOrg: mocks.org }),
}));
afterEach(() => {
   cleanup();
   vi.clearAllMocks();
   mocks.org = "11gt";
});
const wrapper = ({ children }: { children: ReactNode }) => (
   <QueryClientProvider
      client={
         new QueryClient({
            defaultOptions: { queries: { retry: false, gcTime: 0 } },
         })
      }
   >
      {children}
   </QueryClientProvider>
);
describe("dados do mensal", () => {
   it("preserva todas as funções e os regimes independentes do contrato", () => {
      const data = relatorioMensalSchema.parse(relatorioMensalFixture);
      expect(data.aeronaves.etapas[0].funcoes.map((f) => f.func)).toEqual([
         "lm",
         "ml",
      ]);
      expect(data.aeronaves.total.noturno).toBe(30);
      expect(data.aeronaves.total.nvg).toBe(30);
      expect(data.aeronaves.etapas[0].missao).toBeNull();
      expect(() =>
         relatorioMensalSchema.parse({ ...relatorioMensalFixture, mes: 13 })
      ).toThrow();
   });
   it("encaminha parâmetros e cancelamento e falha em respostas de erro", async () => {
      mocks.request.mockResolvedValueOnce(
         new Response(JSON.stringify({ data: relatorioMensalFixture }), {
            status: 200,
         })
      );
      const signal = new AbortController().signal;
      const data = await getRelatorioMensal(7, 2026, 5, signal);
      expect(data.mes).toBe(5);
      expect(mocks.request).toHaveBeenCalledWith(
         "GET",
         "estatistica/tripulantes/7/relatorio-mensal",
         null,
         { ano: 2026, mes: 5 },
         signal
      );
      mocks.request.mockResolvedValueOnce(
         new Response(JSON.stringify({ message: "Falha" }), { status: 500 })
      );
      await expect(getRelatorioMensal(7, 2026, 5)).rejects.toThrow();
   });
   it("isola cache por organização, pessoa, ano e mês", () => {
      const key = relatorioMensalKeys.detalhe("11gt", 7, 2026, 5);
      for (const outra of [
         relatorioMensalKeys.detalhe("1gt", 7, 2026, 5),
         relatorioMensalKeys.detalhe("11gt", 9, 2026, 5),
         relatorioMensalKeys.detalhe("11gt", 7, 2027, 5),
         relatorioMensalKeys.detalhe("11gt", 7, 2026, 6),
      ])
         expect(outra).not.toEqual(key);
   });
   it("não consulta sem seleção ou sem organização", () => {
      const first = renderHook(() => useRelatorioMensal(null, 2026, 5), {
         wrapper,
      });
      expect(first.result.current.fetchStatus).toBe("idle");
      first.unmount();
      mocks.org = null;
      const second = renderHook(() => useRelatorioMensal(7, 2026, 5), {
         wrapper,
      });
      expect(second.result.current.fetchStatus).toBe("idle");
      expect(mocks.request).not.toHaveBeenCalled();
   });
   it("outra competência não mostra o relatório do mês anterior", async () => {
      const client = new QueryClient({
         defaultOptions: { queries: { retry: false, gcTime: 0 } },
      });
      const provider = ({ children }: { children: ReactNode }) => (
         <QueryClientProvider client={client}>{children}</QueryClientProvider>
      );
      mocks.request
         .mockResolvedValueOnce(
            new Response(JSON.stringify({ data: relatorioMensalFixture }), {
               status: 200,
            })
         )
         .mockImplementationOnce(() => new Promise(() => {}));
      const hook = renderHook(({ mes }) => useRelatorioMensal(7, 2026, mes), {
         wrapper: provider,
         initialProps: { mes: 5 },
      });
      await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));
      hook.rerender({ mes: 6 });
      expect(hook.result.current.data).toBeUndefined();
      expect(hook.result.current.isPending).toBe(true);
      hook.unmount();
      client.clear();
   });
});
