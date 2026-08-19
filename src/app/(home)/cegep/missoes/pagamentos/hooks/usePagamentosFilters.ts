"use client";

import { useEffect, useState } from "react";
import {
   useSearchParamsUpdater,
   getStringParam,
   getArrayParam,
   serializeArray,
   serializeString,
} from "@/hooks/useSearchParamsState";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { dateToIso, todayIso } from "@/../utils/dateHandler";

function getDefaultIni(): string {
   const d = new Date();
   d.setDate(d.getDate() - 60);
   return dateToIso(d);
}

export const defaultIni = getDefaultIni();
export const defaultFim = todayIso();

const isValidDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);

/**
 * Estado dos filtros de pagamentos, com a URL como fonte da verdade.
 *
 * Os inputs de texto/data mantêm cópia local para dar retorno imediato ao
 * digitar e só escrevem na URL com debounce — sem isso cada tecla dispararia
 * uma navegação e um refetch. A cópia local é ressincronizada quando a URL
 * muda por fora (voltar/avançar do navegador).
 */
export function usePagamentosFilters() {
   const { searchParams, setParams } = useSearchParamsUpdater();

   // Filtros lidos da URL
   const tipoDoc = getArrayParam(searchParams, "tipo_doc");
   const nDoc = getStringParam(searchParams, "n_doc");
   const selectedTipo = getArrayParam(searchParams, "tipo");
   const selectedSit = getArrayParam(searchParams, "sit");
   const userSearch = getStringParam(searchParams, "user");
   const dataInicio = getStringParam(searchParams, "ini", defaultIni);
   const dataFim = getStringParam(searchParams, "fim", defaultFim);
   const currentPage = Number(getStringParam(searchParams, "page", "1"));
   const itemsPerPage = Number(getStringParam(searchParams, "per_page", "10"));

   // Cópia local dos campos livres (feedback imediato + URL com debounce)
   const [localUserSearch, setLocalUserSearch] = useState(userSearch);
   const [localNDoc, setLocalNDoc] = useState<string>(nDoc);
   const [localDataInicio, setLocalDataInicio] = useState(dataInicio);
   const [localDataFim, setLocalDataFim] = useState(dataFim);

   // Ressincroniza quando a URL muda por fora (back/forward)
   useEffect(() => {
      setLocalUserSearch(userSearch);
   }, [userSearch]);
   useEffect(() => {
      setLocalNDoc(nDoc);
   }, [nDoc]);
   useEffect(() => {
      setLocalDataInicio(dataInicio);
   }, [dataInicio]);
   useEffect(() => {
      setLocalDataFim(dataFim);
   }, [dataFim]);

   const debouncedSetUser = useDebouncedCallback((value: string) => {
      setParams({ user: serializeString(value), page: undefined });
   }, 400);

   const debouncedSetNDoc = useDebouncedCallback((value: string) => {
      setParams({
         n_doc: value === "" ? undefined : value,
         page: undefined,
      });
   }, 400);

   const debouncedSetDataInicio = useDebouncedCallback((value: string) => {
      if (!isValidDate(value)) return;
      setParams({
         ini: serializeString(value, defaultIni),
         page: undefined,
      });
   }, 500);

   const debouncedSetDataFim = useDebouncedCallback((value: string) => {
      if (!isValidDate(value)) return;
      setParams({
         fim: serializeString(value, defaultFim),
         page: undefined,
      });
   }, 500);

   function setTipoDoc(value: string[]) {
      setParams({ tipo_doc: serializeArray(value), page: undefined });
   }

   function setSelectedTipo(value: string[]) {
      setParams({ tipo: serializeArray(value), page: undefined });
   }

   function setSelectedSit(value: string[]) {
      setParams({ sit: serializeArray(value), page: undefined });
   }

   function setCurrentPage(page: number) {
      setParams({ page: page === 1 ? undefined : String(page) });
   }

   function setItemsPerPage(value: number) {
      setParams({
         per_page: value === 10 ? undefined : String(value),
         page: undefined,
      });
   }

   function handleUserSearchChange(value: string) {
      setLocalUserSearch(value);
      debouncedSetUser(value);
   }

   function handleNDocChange(value: string) {
      setLocalNDoc(value);
      debouncedSetNDoc(value);
   }

   // Datas: a janela não pode inverter — mexer numa arrasta a outra junto.
   function handleDataInicioChange(value: string) {
      setLocalDataInicio(value);
      if (!isValidDate(value)) return;
      debouncedSetDataInicio(value);
      if (localDataFim && value > localDataFim) {
         setLocalDataFim(value);
         debouncedSetDataFim(value);
      }
   }

   function handleDataFimChange(value: string) {
      setLocalDataFim(value);
      if (!isValidDate(value)) return;
      debouncedSetDataFim(value);
      if (localDataInicio && value < localDataInicio) {
         setLocalDataInicio(value);
         debouncedSetDataInicio(value);
      }
   }

   const hasActiveFilters = !!(
      tipoDoc?.length ||
      nDoc ||
      selectedTipo?.length ||
      selectedSit?.length ||
      userSearch ||
      dataInicio !== defaultIni ||
      dataFim !== defaultFim
   );

   const activeFiltersCount =
      (tipoDoc?.length || 0) +
      (nDoc ? 1 : 0) +
      (selectedTipo?.length || 0) +
      (selectedSit?.length || 0) +
      (userSearch ? 1 : 0) +
      (dataInicio !== defaultIni ? 1 : 0) +
      (dataFim !== defaultFim ? 1 : 0);

   function clearFilters() {
      setParams({
         tipo_doc: undefined,
         n_doc: undefined,
         tipo: undefined,
         sit: undefined,
         user: undefined,
         ini: undefined,
         fim: undefined,
         page: undefined,
      });
      setLocalUserSearch("");
      setLocalNDoc("");
   }

   function removeNDoc() {
      setParams({ n_doc: undefined, page: undefined });
      setLocalNDoc("");
   }

   function removeUserSearch() {
      setParams({ user: undefined, page: undefined });
      setLocalUserSearch("");
   }

   function removeDataInicio() {
      setParams({ ini: undefined, page: undefined });
   }

   function removeDataFim() {
      setParams({ fim: undefined, page: undefined });
   }

   return {
      tipoDoc,
      nDoc,
      selectedTipo,
      selectedSit,
      userSearch,
      dataInicio,
      dataFim,
      currentPage,
      itemsPerPage,
      localUserSearch,
      localNDoc,
      localDataInicio,
      localDataFim,
      setTipoDoc,
      setSelectedTipo,
      setSelectedSit,
      setCurrentPage,
      setItemsPerPage,
      handleUserSearchChange,
      handleNDocChange,
      handleDataInicioChange,
      handleDataFimChange,
      hasActiveFilters,
      activeFiltersCount,
      clearFilters,
      removeNDoc,
      removeUserSearch,
      removeDataInicio,
      removeDataFim,
   };
}

export type PagamentosFilters = ReturnType<typeof usePagamentosFilters>;
