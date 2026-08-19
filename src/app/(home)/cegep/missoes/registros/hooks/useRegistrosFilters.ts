"use client";

import { useEffect, useState } from "react";
import {
   useSearchParamsUpdater,
   getStringParam,
   getArrayParam,
   getNumberArrayParam,
   serializeArray,
   serializeNumberArray,
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
 * Estado dos filtros de registros de missão, com a URL como fonte da verdade.
 *
 * Mesmo desenho do painel de Pagamentos: os campos livres mantêm cópia local
 * para dar retorno imediato ao digitar e escrevem na URL com debounce, e a
 * cópia é ressincronizada quando a URL muda por fora (voltar/avançar).
 */
export function useRegistrosFilters() {
   const { searchParams, setParams } = useSearchParamsUpdater();

   // Filtros lidos da URL
   const tipoDoc = getArrayParam(searchParams, "tipo_doc");
   const nDoc = getStringParam(searchParams, "n_doc");
   const selectedTipo = getArrayParam(searchParams, "tipo");
   const userSearch = getStringParam(searchParams, "user");
   const citySearch = getStringParam(searchParams, "city");
   const dataInicio = getStringParam(searchParams, "ini", defaultIni);
   const dataFim = getStringParam(searchParams, "fim", defaultFim);
   const selectedEtiquetaIds = getNumberArrayParam(searchParams, "etiquetas");
   const currentPage = Number(getStringParam(searchParams, "page", "1"));

   // Cópia local dos campos livres (feedback imediato + URL com debounce)
   const [localUserSearch, setLocalUserSearch] = useState(userSearch);
   const [localCitySearch, setLocalCitySearch] = useState(citySearch);
   const [localNDoc, setLocalNDoc] = useState<string>(nDoc);
   const [localDataInicio, setLocalDataInicio] = useState(dataInicio);
   const [localDataFim, setLocalDataFim] = useState(dataFim);

   // Ressincroniza quando a URL muda por fora (back/forward)
   useEffect(() => {
      setLocalUserSearch(userSearch);
   }, [userSearch]);
   useEffect(() => {
      setLocalCitySearch(citySearch);
   }, [citySearch]);
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

   const debouncedSetCity = useDebouncedCallback((value: string) => {
      setParams({ city: serializeString(value), page: undefined });
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

   function setSelectedEtiquetaIds(
      updater: number[] | ((prev: number[]) => number[])
   ) {
      const newIds =
         typeof updater === "function" ? updater(selectedEtiquetaIds) : updater;
      setParams({
         etiquetas: serializeNumberArray(newIds),
         page: undefined,
      });
   }

   function handlePageChange(page: number) {
      setParams({ page: page === 1 ? undefined : String(page) });
   }

   function handleUserSearchChange(value: string) {
      setLocalUserSearch(value);
      debouncedSetUser(value);
   }

   function handleCitySearchChange(value: string) {
      setLocalCitySearch(value);
      debouncedSetCity(value);
   }

   function handleNDocChange(value: string) {
      setLocalNDoc(value);
      debouncedSetNDoc(value);
   }

   function handleDataInicioChange(value: string) {
      setLocalDataInicio(value);
      if (isValidDate(value)) debouncedSetDataInicio(value);
   }

   function handleDataFimChange(value: string) {
      setLocalDataFim(value);
      if (isValidDate(value)) debouncedSetDataFim(value);
   }

   const activeFilterCount =
      tipoDoc.length +
      (nDoc ? 1 : 0) +
      selectedTipo.length +
      (userSearch ? 1 : 0) +
      (citySearch ? 1 : 0) +
      (dataInicio !== defaultIni ? 1 : 0) +
      (dataFim !== defaultFim ? 1 : 0) +
      selectedEtiquetaIds.length;

   const hasActiveFilters = activeFilterCount > 0;

   function clearFilters() {
      setParams({
         tipo_doc: undefined,
         n_doc: undefined,
         tipo: undefined,
         user: undefined,
         city: undefined,
         etiquetas: undefined,
         ini: undefined,
         fim: undefined,
         page: undefined,
      });
      setLocalUserSearch("");
      setLocalCitySearch("");
      setLocalNDoc("");
   }

   function removeTipoDoc(tipo: string) {
      setTipoDoc(tipoDoc.filter((t) => t !== tipo));
   }

   function removeNDoc() {
      setParams({ n_doc: undefined, page: undefined });
      setLocalNDoc("");
   }

   function removeSelectedTipo(tipo: string) {
      setSelectedTipo(selectedTipo.filter((t) => t !== tipo));
   }

   function removeUserSearch() {
      setParams({ user: undefined, page: undefined });
      setLocalUserSearch("");
   }

   function removeCitySearch() {
      setParams({ city: undefined, page: undefined });
      setLocalCitySearch("");
   }

   function removeDataInicio() {
      setParams({ ini: undefined, page: undefined });
   }

   function removeDataFim() {
      setParams({ fim: undefined, page: undefined });
   }

   function removeEtiqueta(id: number) {
      setSelectedEtiquetaIds((prev) => prev.filter((eid) => eid !== id));
   }

   function toggleEtiqueta(etiquetaId: number) {
      if (selectedEtiquetaIds.includes(etiquetaId)) {
         setSelectedEtiquetaIds((prev) =>
            prev.filter((id) => id !== etiquetaId)
         );
      } else {
         setSelectedEtiquetaIds([...selectedEtiquetaIds, etiquetaId]);
      }
   }

   return {
      tipoDoc,
      nDoc,
      selectedTipo,
      userSearch,
      citySearch,
      dataInicio,
      dataFim,
      selectedEtiquetaIds,
      currentPage,
      localUserSearch,
      localCitySearch,
      localNDoc,
      localDataInicio,
      localDataFim,
      setTipoDoc,
      setSelectedTipo,
      handlePageChange,
      handleUserSearchChange,
      handleCitySearchChange,
      handleNDocChange,
      handleDataInicioChange,
      handleDataFimChange,
      activeFilterCount,
      hasActiveFilters,
      clearFilters,
      removeTipoDoc,
      removeNDoc,
      removeSelectedTipo,
      removeUserSearch,
      removeCitySearch,
      removeDataInicio,
      removeDataFim,
      removeEtiqueta,
      toggleEtiqueta,
   };
}

export type RegistrosFilters = ReturnType<typeof useRegistrosFilters>;
