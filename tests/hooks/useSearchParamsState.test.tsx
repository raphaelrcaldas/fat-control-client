// @vitest-environment jsdom

import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({
   current: new URLSearchParams("a=1&b=2"),
   listeners: new Set<() => void>(),
   calls: [] as { method: "push" | "replace"; url: string }[],
}));

vi.mock("next/navigation", async () => {
   const { useSyncExternalStore } = await import("react");
   const router = {
      replace: (url: string) =>
         navigation.calls.push({ method: "replace", url }),
      push: (url: string) => navigation.calls.push({ method: "push", url }),
   };
   return {
      useRouter: () => router,
      usePathname: () => "/x",
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

import { useSearchParamsUpdater } from "@/hooks/useSearchParamsState";

function commit(url: string) {
   navigation.current = new URLSearchParams(url.split("?")[1] ?? "");
   navigation.listeners.forEach((listener) => listener());
}

describe("useSearchParamsUpdater", () => {
   beforeEach(() => {
      navigation.current = new URLSearchParams("a=1&b=2");
      navigation.calls = [];
   });
   afterEach(cleanup);

   it("compõe escritas feitas antes de a primeira navegação comitar", () => {
      const { result } = renderHook(() => useSearchParamsUpdater());
      const setParams = result.current.setParams;

      act(() => {
         result.current.setParams({ a: undefined });
         result.current.setParams({ c: "3" });
      });

      expect(navigation.calls).toEqual([
         { method: "replace", url: "/x?b=2" },
         { method: "replace", url: "/x?b=2&c=3" },
      ]);

      act(() => commit("/x?b=2&c=3"));
      expect(result.current.searchParams.toString()).toBe("b=2&c=3");
      expect(result.current.setParams).toBe(setParams);
   });

   it("usa a URL externa após voltar ou navegar e preserva a opção push", () => {
      const { result } = renderHook(() => useSearchParamsUpdater());
      const setParams = result.current.setParams;

      act(() => commit("/x?z=9"));
      act(() => result.current.setParams({ y: "8" }, { push: true }));

      expect(navigation.calls).toEqual([{ method: "push", url: "/x?z=9&y=8" }]);
      expect(result.current.setParams).toBe(setParams);
   });
});
