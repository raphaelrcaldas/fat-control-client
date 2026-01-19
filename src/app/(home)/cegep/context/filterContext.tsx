"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const FilterContext = createContext(null);

// Função para calcular datas de forma consistente
function getDefaultDates() {
   const hoje = new Date();
   const defaultIni = new Date();
   defaultIni.setDate(hoje.getDate() - 60);
   return {
      ini: defaultIni.toISOString().split("T")[0],
      fim: hoje.toISOString().split("T")[0],
   };
}

export function FilterProvider({ children }) {
   // Estados de filtros (UI)
   const [selectedTipo, setSelectedTipo] = useState<string[]>([]);
   const [selectedSit, setSelectedSit] = useState<string[]>([]);
   const [userSearch, setUserSearch] = useState("");
   const [dataInicio, setDataInicio] = useState("");
   const [dataFim, setDataFim] = useState("");
   const [tipoDoc, setTipoDoc] = useState<string[]>([]);
   const [nDoc, setNDoc] = useState<number | undefined>(undefined);

   // Estados de seleção (UI)
   const [selectedAll, setSelectedAll] = useState(false);
   const [valorSoma, setValorSoma] = useState(0);
   const [selectedIds, setSelectedIds] = useState<number[]>([]);

   // Estados de paginação (UI)
   const [currentPage, setCurrentPage] = useState(1);
   const [itemsPerPage, setItemsPerPage] = useState(10);

   // Hydration state
   const [isHydrated, setIsHydrated] = useState(false);

   // Inicializar valores dependentes de Date apenas no cliente
   useEffect(() => {
      const dates = getDefaultDates();
      setDataInicio(dates.ini);
      setDataFim(dates.fim);
      setIsHydrated(true);
   }, []);

   return (
      <FilterContext.Provider
         value={{
            nDoc,
            setNDoc,
            tipoDoc,
            setTipoDoc,
            selectedTipo,
            setSelectedTipo,
            selectedSit,
            setSelectedSit,
            userSearch,
            setUserSearch,
            dataInicio,
            setDataInicio,
            dataFim,
            setDataFim,
            selectedAll,
            setSelectedAll,
            valorSoma,
            setValorSoma,
            selectedIds,
            setSelectedIds,
            currentPage,
            setCurrentPage,
            itemsPerPage,
            setItemsPerPage,
            isHydrated,
         }}
      >
         {children}
      </FilterContext.Provider>
   );
}

export function useFilterContext() {
   const ctx = useContext(FilterContext);
   if (!ctx)
      throw new Error(
         "useFilterContext deve ser usado dentro de FilterProvider"
      );
   return ctx;
}
