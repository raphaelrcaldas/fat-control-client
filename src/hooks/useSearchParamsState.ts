"use client";

import { useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

type ParamUpdates = Record<string, string | undefined>;

/**
 * Hook that provides searchParams for reading and a setParams function
 * for batch-updating multiple URL search params at once.
 *
 * When a value is `undefined`, the param is deleted from the URL.
 * Uses `router.replace()` with `{ scroll: false }` to avoid page scroll.
 */
export function useSearchParamsUpdater() {
   const searchParams = useSearchParams();
   const router = useRouter();
   const pathname = usePathname();

   const setParams = useCallback(
      (updates: ParamUpdates) => {
         const params = new URLSearchParams(searchParams.toString());

         for (const [key, value] of Object.entries(updates)) {
            if (value === undefined || value === "") {
               params.delete(key);
            } else {
               params.set(key, value);
            }
         }

         const queryString = params.toString();
         const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
         router.replace(newUrl, { scroll: false });
      },
      [searchParams, router, pathname]
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
