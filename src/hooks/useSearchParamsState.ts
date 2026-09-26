"use client";

import { useCallback, useLayoutEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

type ParamUpdates = Record<string, string | undefined>;

interface SetParamsOptions {
   /**
    * `true` empilha uma entrada no histórico (`router.push`) em vez de
    * sobrescrever a atual (`router.replace`, o padrão).
    *
    * Use para mudança que o usuário entende como **navegação** e espera
    * desfazer com o botão voltar — trocar de aba, por exemplo. Não use
    * para filtro digitado: cada tecla viraria uma entrada no histórico e
    * o voltar ficaria inútil.
    */
   push?: boolean;
}

/**
 * Hook that provides searchParams for reading and a setParams function
 * for batch-updating multiple URL search params at once.
 *
 * When a value is `undefined`, the param is deleted from the URL.
 * Uses `{ scroll: false }` to avoid page scroll; writes with
 * `router.replace()` unless `{ push: true }` is passed.
 *
 * Escritas compõem sobre a query mais recente PRETENDIDA, não sobre a do
 * render: `router.replace`/`push` é transição, e `useSearchParams` só reflete
 * a URL nova depois que o render urgente e os efeitos já rodaram. Duas
 * escritas nesse intervalo (ex.: um handler e um efeito que reage ao estado
 * que ele mudou) partiam da mesma URL velha e a segunda desfazia a primeira —
 * ver `docs/ai/notes/frontend-armadilhas.md`. Consequência: `setParams` é
 * estável entre renders.
 */
export function useSearchParamsUpdater() {
   const searchParams = useSearchParams();
   const router = useRouter();
   const pathname = usePathname();
   const spString = searchParams.toString();

   // Query mais recente pretendida. Ressincroniza com a URL comitada a cada
   // mudança dela (navegação externa, voltar/avançar, escrita própria que
   // acabou de comitar). Layout effect: roda antes de QUALQUER efeito passivo,
   // inclusive os de componentes filhos — um filho que escreva num efeito
   // logo após o voltar já compõe sobre a URL nova. `pathname` nas deps: o
   // hook pode viver num componente que continua montado ao trocar de rota.
   const latestQsRef = useRef(spString);
   useLayoutEffect(() => {
      latestQsRef.current = spString;
   }, [pathname, spString]);

   const setParams = useCallback(
      (updates: ParamUpdates, options?: SetParamsOptions) => {
         const params = new URLSearchParams(latestQsRef.current);

         for (const [key, value] of Object.entries(updates)) {
            if (value === undefined || value === "") {
               params.delete(key);
            } else {
               params.set(key, value);
            }
         }

         const queryString = params.toString();
         latestQsRef.current = queryString;
         const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
         // Chamado no router, não desestruturado: `push`/`replace` são
         // métodos do AppRouterInstance e podem depender do `this`.
         if (options?.push) {
            router.push(newUrl, { scroll: false });
         } else {
            router.replace(newUrl, { scroll: false });
         }
      },
      [router, pathname]
   );

   return { searchParams, setParams };
}

// --- Helper parsers ---

export function getStringParam(
   searchParams: URLSearchParams,
   key: string,
   defaultValue = ""
): string {
   return searchParams.get(key) ?? defaultValue;
}

export function getNumberParam(
   searchParams: URLSearchParams,
   key: string
): number | undefined {
   const value = searchParams.get(key);
   if (value === null || value === "") return undefined;
   const num = Number(value);
   return Number.isNaN(num) ? undefined : num;
}

export function getArrayParam(
   searchParams: URLSearchParams,
   key: string
): string[] {
   const value = searchParams.get(key);
   if (!value) return [];
   return value.split(",").filter(Boolean);
}

export function getNumberArrayParam(
   searchParams: URLSearchParams,
   key: string
): number[] {
   const value = searchParams.get(key);
   if (!value) return [];
   return value
      .split(",")
      .map(Number)
      .filter((n) => !Number.isNaN(n));
}

// --- Serializers (return undefined to delete param) ---

export function serializeArray(arr: string[]): string | undefined {
   return arr.length > 0 ? arr.join(",") : undefined;
}

export function serializeNumberArray(arr: number[]): string | undefined {
   return arr.length > 0 ? arr.join(",") : undefined;
}

export function serializeNumber(n: number | undefined): string | undefined {
   return n !== undefined ? String(n) : undefined;
}

export function serializeString(
   s: string,
   defaultValue?: string
): string | undefined {
   if (!s || s === defaultValue) return undefined;
   return s;
}
