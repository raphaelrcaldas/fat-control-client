import { useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTrips } from "@/hooks/queries";
import type { FuncType, OperType } from "../types/trip.types";

type UseTripListParams = {
   uae: string;
};

const PER_PAGE_OPTIONS = [25, 50, 100];

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 25;
const DEFAULT_ACTIVE = true;

function parseCommaSeparated(value: string | null): string[] {
   if (!value) return [];
   return value.split(",").filter(Boolean);
}

export function useTripList({ uae }: UseTripListParams) {
   const searchParams = useSearchParams();
   const router = useRouter();

   // --- Read URL params ---
   const urlSearch = searchParams.get("search") ?? "";
   const filterPG = parseCommaSeparated(searchParams.get("pg"));
   const filterFunc = parseCommaSeparated(
      searchParams.get("func")
   ) as FuncType[];
   const filterOper = parseCommaSeparated(
      searchParams.get("oper")
   ) as OperType[];
   const activeParam = searchParams.get("active");
   const filterActive =
      activeParam === null ? DEFAULT_ACTIVE : activeParam === "true";
   const currentPage = Number(searchParams.get("page")) || DEFAULT_PAGE;
   const perPage = Number(searchParams.get("per_page")) || DEFAULT_PER_PAGE;

   // --- URL update helper ---
   const updateParams = useCallback(
      (updates: Record<string, string | undefined>, resetPage = true) => {
         const params = new URLSearchParams(searchParams.toString());

         for (const [key, value] of Object.entries(updates)) {
            if (value === undefined || value === "") {
               params.delete(key);
            } else {
               params.set(key, value);
            }
         }

         if (resetPage) {
            params.delete("page");
         }

         // Clean defaults from URL
         if (params.get("per_page") === String(DEFAULT_PER_PAGE)) {
            params.delete("per_page");
         }
         if (params.get("page") === String(DEFAULT_PAGE)) {
            params.delete("page");
         }
         if (params.get("active") === String(DEFAULT_ACTIVE)) {
            params.delete("active");
         }

         const qs = params.toString();
         router.replace(qs ? `?${qs}` : "?", { scroll: false });
      },
      [searchParams, router]
   );

   // --- Filters object (for compatibility with page) ---
   const filters = useMemo(
      () => ({
         name: urlSearch,
         p_g: filterPG,
         func: filterFunc,
         oper: filterOper,
         active: filterActive,
      }),
      [urlSearch, filterPG, filterFunc, filterOper, filterActive]
   );

   // --- Query params ---
   const queryParams = useMemo(
      () => ({
         uae,
         active: filterActive,
         page: currentPage,
         per_page: perPage,
         search: urlSearch || undefined,
         p_g: filterPG.length > 0 ? filterPG : undefined,
         func: filterFunc.length > 0 ? filterFunc : undefined,
         oper: filterOper.length > 0 ? filterOper : undefined,
      }),
      [
         uae,
         currentPage,
         perPage,
         urlSearch,
         filterPG,
         filterFunc,
         filterOper,
         filterActive,
      ]
   );

   const { data, isLoading, isFetching, refetch } = useTrips(queryParams);

   // --- Update handlers ---
   const updateSearch = useCallback(
      (value: string) => {
         updateParams({ search: value || undefined });
      },
      [updateParams]
   );

   const updateFilter = useCallback(
      (key: string, value: string[] | boolean | string) => {
         if (key === "name") {
            updateParams({ search: (value as string) || undefined });
         } else if (key === "active") {
            updateParams({
               active: value === DEFAULT_ACTIVE ? undefined : String(value),
            });
         } else if (key === "p_g") {
            const arr = value as string[];
            updateParams({ pg: arr.length > 0 ? arr.join(",") : undefined });
         } else if (key === "func") {
            const arr = value as string[];
            updateParams({ func: arr.length > 0 ? arr.join(",") : undefined });
         } else if (key === "oper") {
            const arr = value as string[];
            updateParams({ oper: arr.length > 0 ? arr.join(",") : undefined });
         }
      },
      [updateParams]
   );

   const clearFilters = useCallback(() => {
      router.replace("?", { scroll: false });
   }, [router]);

   const handlePageChange = useCallback(
      (page: number) => {
         updateParams(
            { page: page > DEFAULT_PAGE ? String(page) : undefined },
            false
         );
      },
      [updateParams]
   );

   const handlePerPageChange = useCallback(
      (newPerPage: number) => {
         updateParams({
            per_page:
               newPerPage !== DEFAULT_PER_PAGE ? String(newPerPage) : undefined,
         });
      },
      [updateParams]
   );

   return {
      trips: data?.items ?? [],
      loading: isLoading,
      isFetching,
      refetch,
      filters,
      updateFilter,
      updateSearch,
      clearFilters,
      currentPage: data?.page ?? currentPage,
      perPage,
      totalPages: data?.pages ?? 1,
      totalTrips: data?.total ?? 0,
      handlePageChange,
      handlePerPageChange,
      PER_PAGE_OPTIONS,
      urlSearch,
   };
}
