"use client";
import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePersistedState } from "@/hooks/usePersistedState";
import type { OperStatus, OperTipo } from "services/routes/ops/operacoes";
import type { OperacoesFiltersState } from "../components/OperacoesFilters";

const STORAGE_KEY = "operacoes.filters";

const VALID_STATUS: OperStatus[] = [
   "planejada",
   "andamento",
   "encerrada",
   "cancelada",
];
const VALID_TIPO: OperTipo[] = ["operacao", "manobra", "exercicio"];

function parseFromUrl(
   sp: URLSearchParams,
   fallback: OperacoesFiltersState
): { value: OperacoesFiltersState; hasAny: boolean } {
   const status = sp.get("status");
   const tipo = sp.get("tipo");
   const date_start = sp.get("date_start");
   const date_end = sp.get("date_end");
   const q = sp.get("q");

   const hasAny = Boolean(status || tipo || date_start || date_end || q);

   return {
      value: {
         status: VALID_STATUS.includes(status as OperStatus)
            ? (status as OperStatus)
            : null,
         tipo: VALID_TIPO.includes(tipo as OperTipo)
            ? (tipo as OperTipo)
            : null,
         // Datas nunca ficam vazias: caem no padrão (ano corrente).
         date_start: date_start ?? fallback.date_start,
         date_end: date_end ?? fallback.date_end,
         q: q ?? fallback.q,
      },
      hasAny,
   };
}

function toQueryString(filters: OperacoesFiltersState): string {
   const sp = new URLSearchParams();
   if (filters.status) sp.set("status", filters.status);
   if (filters.tipo) sp.set("tipo", filters.tipo);
   if (filters.date_start) sp.set("date_start", filters.date_start);
   if (filters.date_end) sp.set("date_end", filters.date_end);
   if (filters.q.trim()) sp.set("q", filters.q.trim());
   return sp.toString();
}

/**
 * Estado dos filtros de operações persistido em localStorage e espelhado
 * na URL (compartilhável). Na montagem, a URL tem prioridade; sem params,
 * o estado persistido é aplicado à URL. Mesmo padrão de `useEscalaFilters`.
 */
export function useOperacoesFilters(defaults: OperacoesFiltersState) {
   const router = useRouter();
   const searchParams = useSearchParams();
   const [filters, setFilters] = usePersistedState<OperacoesFiltersState>(
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

      if (hasAny) {
         lastApplied.current = toQueryString(value);
         setFilters(value);
      } else {
         const next = toQueryString(filters);
         lastApplied.current = next;
         if (next) router.replace(`?${next}`, { scroll: false });
      }
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
