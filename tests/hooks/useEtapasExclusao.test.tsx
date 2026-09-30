// @vitest-environment jsdom

import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook } from "@testing-library/react";
import {
   missaoEtpKeys,
   useDeleteEtapa,
   useDeleteMissaoComEtapas,
   useUpdateMissaoWithEtapas,
} from "@/hooks/queries/useEtapas";

const mocks = vi.hoisted(() => ({
   request: vi.fn(),
   deleteMissaoComEtapas: vi.fn(),
}));
vi.mock("services/Api", async (importOriginal) => ({
   ...(await importOriginal<typeof import("services/Api")>()),
   default: mocks.request,
}));
vi.mock("services/routes/estatistica/etapas", async (importOriginal) => ({
   ...(await importOriginal<
      typeof import("services/routes/estatistica/etapas")
   >()),
   deleteMissaoComEtapas: mocks.deleteMissaoComEtapas,
}));

function setup() {
   const queryClient = new QueryClient();
   const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
   );
   return { queryClient, wrapper };
}

afterEach(() => {
   cleanup();
   vi.clearAllMocks();
});

describe("useDeleteMissaoComEtapas", () => {
   it("não invalida o detalhe da missão excluída, mas invalida as demais", async () => {
      mocks.deleteMissaoComEtapas.mockResolvedValue({ ok: true });
      const { queryClient, wrapper } = setup();
      queryClient.setQueryData(missaoEtpKeys.detail(5), { id: 5 });
      queryClient.setQueryData(missaoEtpKeys.detail(9), { id: 9 });
      const { result } = renderHook(() => useDeleteMissaoComEtapas(), {
         wrapper,
      });
      await act(() => result.current.mutateAsync(5));
      expect(
         queryClient.getQueryState(missaoEtpKeys.detail(5))?.isInvalidated
      ).toBe(false);
      expect(
         queryClient.getQueryState(missaoEtpKeys.detail(9))?.isInvalidated
      ).toBe(true);
   });
});

describe("useDeleteEtapa", () => {
   const resposta = (status: number, body: object) =>
      ({
         ok: status < 400,
         status,
         json: async () => body,
      }) as Response;

   it("sinaliza 404 como notFound, distinto de outras falhas", async () => {
      const { wrapper } = setup();
      const { result } = renderHook(() => useDeleteEtapa(), { wrapper });
      const args = { id: 7, missaoId: 1 };
      mocks.request.mockResolvedValueOnce(
         resposta(404, { message: "Etapa não encontrada" })
      );
      expect(await act(() => result.current.mutateAsync(args))).toMatchObject({
         ok: false,
         notFound: true,
      });
      mocks.request.mockResolvedValueOnce(
         resposta(403, { message: "Sem permissão" })
      );
      expect(await act(() => result.current.mutateAsync(args))).toMatchObject({
         ok: false,
         notFound: false,
      });
      mocks.request.mockResolvedValueOnce(resposta(200, { message: "ok" }));
      expect(await act(() => result.current.mutateAsync(args))).toMatchObject({
         ok: true,
         notFound: false,
      });
      expect(mocks.request).toHaveBeenCalledWith(
         "DELETE",
         "estatistica/etapas/7"
      );
   });

   it("missao_removida na resposta: não invalida o detalhe da missão removida", async () => {
      const { queryClient, wrapper } = setup();
      queryClient.setQueryData(missaoEtpKeys.detail(1), { id: 1 });
      queryClient.setQueryData(missaoEtpKeys.detail(2), { id: 2 });
      const { result } = renderHook(() => useDeleteEtapa(), { wrapper });
      mocks.request.mockResolvedValueOnce(
         resposta(200, { message: "ok", data: { missao_removida: true } })
      );
      await act(() => result.current.mutateAsync({ id: 7, missaoId: 1 }));
      expect(
         queryClient.getQueryState(missaoEtpKeys.detail(1))?.isInvalidated
      ).toBe(false);
      expect(
         queryClient.getQueryState(missaoEtpKeys.detail(2))?.isInvalidated
      ).toBe(true);
   });

   it("missao_removida falso: invalida o detalhe da missão", async () => {
      const { queryClient, wrapper } = setup();
      queryClient.setQueryData(missaoEtpKeys.detail(1), { id: 1 });
      const { result } = renderHook(() => useDeleteEtapa(), { wrapper });
      mocks.request.mockResolvedValueOnce(
         resposta(200, { message: "ok", data: { missao_removida: false } })
      );
      await act(() => result.current.mutateAsync({ id: 7, missaoId: 1 }));
      expect(
         queryClient.getQueryState(missaoEtpKeys.detail(1))?.isInvalidated
      ).toBe(true);
   });

   it("404 (notFound) não conta como missão removida: o detalhe é invalidado", async () => {
      const { queryClient, wrapper } = setup();
      queryClient.setQueryData(missaoEtpKeys.detail(1), { id: 1 });
      const { result } = renderHook(() => useDeleteEtapa(), { wrapper });
      mocks.request.mockResolvedValueOnce(
         resposta(404, { message: "Etapa não encontrada" })
      );
      await act(() => result.current.mutateAsync({ id: 7, missaoId: 1 }));
      expect(
         queryClient.getQueryState(missaoEtpKeys.detail(1))?.isInvalidated
      ).toBe(true);
   });
});

describe("useUpdateMissaoWithEtapas", () => {
   const resposta = (status: number, body: object) =>
      ({ ok: status < 400, status, json: async () => body }) as Response;

   it("PUT recusado invalida só o detalhe da missão, para o editor reconciliar", async () => {
      const { queryClient, wrapper } = setup();
      queryClient.setQueryData(missaoEtpKeys.detail(1), { id: 1 });
      queryClient.setQueryData(missaoEtpKeys.detail(2), { id: 2 });
      queryClient.setQueryData(["etapas", "list"], []);
      const { result } = renderHook(() => useUpdateMissaoWithEtapas(), {
         wrapper,
      });
      mocks.request.mockResolvedValueOnce(
         resposta(422, { message: "Etapa(s) não pertencem à missão" })
      );
      const res = await act(() =>
         result.current.mutateAsync({
            id: 1,
            data: { update: [], create: [], delete_ids: [], obs: null },
         } as never)
      );
      expect(res.ok).toBe(false);
      expect(
         queryClient.getQueryState(missaoEtpKeys.detail(1))?.isInvalidated
      ).toBe(true);
      expect(
         queryClient.getQueryState(missaoEtpKeys.detail(2))?.isInvalidated
      ).toBe(false);
      expect(queryClient.getQueryState(["etapas", "list"])?.isInvalidated).toBe(
         false
      );
   });
});
