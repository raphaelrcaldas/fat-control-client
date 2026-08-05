"use client";
import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePersistedState } from "@/hooks/usePersistedState";
import { todayIso } from "@/../utils/dateHandler";
import type { EscalaSort } from "services/routes/ops/escala";
import type { EscalaFiltersState } from "../types";

const STORAGE_KEY = "escala.filters";
const VALID_SORTS: EscalaSort[] = ["horas_voo", "quads_asc"];

/**
 * Puxa uma janela que ficou no passado de volta para hoje.
 *
 * O estado inteiro é persistido no localStorage, datas incluídas — então na
 * sessão seguinte o filtro voltava com a data de ontem, abaixo do `min={today}`
 * do próprio input, e a consulta saía para uma janela passada sem nada na tela
 * indicando isso. Como CEMAL e desadaptação são calculados contra `date_end`,
 * a escala inteira vinha datada de ontem. O default do módulo também não
 * salvava: `todayIso()` roda uma vez, na carga.
 */
function clampToToday(filters: EscalaFiltersState): EscalaFiltersState {
   const today = todayIso();
   if (filters.date_start >= today) return filters;

   // Encosta o início em hoje. O fim só se move se também estiver no passado —
   // uma janela que atravessa hoje mantém a data final que o usuário escolheu.
   const end = filters.date_end < today ? today : filters.date_end;
   return { ...filters, date_start: today, date_end: end };
}

function parseFromUrl(
   sp: URLSearchParams,
   fallback: EscalaFiltersState
): { value: EscalaFiltersState; hasAny: boolean } {
   const date_start = sp.get("date_start");
   const date_end = sp.get("date_end");
   const tipo_quad_id = sp.get("tipo_quad_id");
   const funcs = sp.get("funcs");
   const sortParam = sp.get("sort");

   const hasAny = Boolean(
      date_start || date_end || tipo_quad_id || funcs || sortParam
   );

   const parsedTipo =
      tipo_quad_id !== null && tipo_quad_id !== ""
         ? Number.parseInt(tipo_quad_id, 10)
         : fallback.tipo_quad_id;

   const parsedSort = VALID_SORTS.includes(sortParam as EscalaSort)
      ? (sortParam as EscalaSort)
      : fallback.sort;

   return {
      value: {
         date_start: date_start ?? fallback.date_start,
         date_end: date_end ?? fallback.date_end,
         tipo_quad_id:
            Number.isFinite(parsedTipo) && (parsedTipo ?? 0) > 0
               ? (parsedTipo as number)
               : fallback.tipo_quad_id,
         funcs: funcs ? funcs.split(",").filter(Boolean) : fallback.funcs,
         sort: parsedSort,
      },
      hasAny,
   };
}

function toQueryString(filters: EscalaFiltersState): string {
   const sp = new URLSearchParams();
   if (filters.date_start) sp.set("date_start", filters.date_start);
   if (filters.date_end) sp.set("date_end", filters.date_end);
   if (filters.tipo_quad_id !== null) {
      sp.set("tipo_quad_id", String(filters.tipo_quad_id));
   }
   if (filters.funcs.length > 0) sp.set("funcs", filters.funcs.join(","));
   if (filters.sort) sp.set("sort", filters.sort);
   return sp.toString();
}

export function useEscalaFilters(defaults: EscalaFiltersState) {
   const router = useRouter();
   const searchParams = useSearchParams();
   const [filters, setFilters] = usePersistedState<EscalaFiltersState>(
      STORAGE_KEY,
      defaults
   );
   const initialized = useRef(false);
   const lastApplied = useRef<string>("");

   useEffect(() => {
      if (initialized.current) return;
      initialized.current = true;

      const sp = new URLSearchParams(searchParams.toString());
      const { value, hasAny } = parseFromUrl(sp, filters);

      // Vale para as duas origens: tanto o que veio do localStorage quanto um
      // link antigo colado na barra de endereço podem trazer data vencida.
      const resolved = clampToToday(hasAny ? value : filters);
      const next = toQueryString(resolved);
      lastApplied.current = next;

      // `clampToToday` devolve o MESMO objeto quando não há nada a corrigir,
      // então a comparação por identidade cobre as duas origens: só grava se a
      // URL trouxe filtro novo ou se a data precisou ser puxada para hoje.
      if (resolved !== filters) setFilters(resolved);
      if (next) router.replace(`?${next}`, { scroll: false });
   }, []);

   useEffect(() => {
      if (!initialized.current) return;
      const next = toQueryString(filters);
      if (next === lastApplied.current) return;
      lastApplied.current = next;
      router.replace(next ? `?${next}` : "?", { scroll: false });
   }, [filters, router]);

   return [filters, setFilters] as const;
}
