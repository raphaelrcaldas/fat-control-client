// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";

import { useMissaoObs } from "@/app/(home)/instrucao/simulador/missao/hooks/useMissaoObs";

const mocks = vi.hoisted(() => ({
   push: vi.fn(),
   updateMissao: vi.fn(),
}));

vi.mock("@/app/context/toast", () => ({
   useToast: () => ({ push: mocks.push }),
}));
vi.mock("@/hooks/queries/useEtapas", () => ({
   useUpdateMissao: () => ({
      mutateAsync: mocks.updateMissao,
      isPending: false,
   }),
}));

describe("useMissaoObs", () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   afterEach(() => {
      cleanup();
      vi.restoreAllMocks();
   });

   it("mantém o texto digitado após o início do salvamento como rascunho", async () => {
      const pending = Promise.withResolvers<{ ok: boolean }>();
      mocks.updateMissao.mockReturnValue(pending.promise);
      const { result, rerender } = renderHook(
         ({ serverObs }) => useMissaoObs({ missaoId: 7, serverObs }),
         { initialProps: { serverObs: "" } }
      );

      act(() => result.current.setObs("versão enviada"));
      const flush = result.current.flush();
      await waitFor(() => expect(mocks.updateMissao).toHaveBeenCalledOnce());
      act(() => result.current.setObs("versão posterior"));
      await act(async () => {
         pending.resolve({ ok: true });
         await flush;
      });

      expect(result.current.obs).toBe("versão posterior");
      expect(result.current.isDirty).toBe(true);

      // O refetch atrasado só confirma o baseline salvo; não pode descartar B.
      rerender({ serverObs: "versão enviada" });
      expect(result.current.obs).toBe("versão posterior");
      expect(result.current.isDirty).toBe(true);

      await act(async () => {
         await result.current.flush();
      });
      expect(mocks.updateMissao).toHaveBeenLastCalledWith({
         id: 7,
         data: { obs: "versão posterior" },
      });
      expect(result.current.isDirty).toBe(false);
   });

   it("mantém a observação suja quando a persistência falha", async () => {
      mocks.updateMissao.mockRejectedValue(new Error("indisponível"));
      const { result } = renderHook(() =>
         useMissaoObs({ missaoId: 7, serverObs: "salva" })
      );

      act(() => result.current.setObs("rascunho"));
      await expect(result.current.flush()).resolves.toBe(false);

      expect(result.current.obs).toBe("rascunho");
      expect(result.current.isDirty).toBe(true);
   });
});
