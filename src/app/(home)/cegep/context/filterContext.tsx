"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Missao } from "services/routes/cegep/missoes";

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
   // Usar valores iniciais vazios para evitar mismatch de hidratação
   const [misRecords, setMisRecords] = useState<Missao[] | null>(null);
   const [selectedTipo, setSelectedTipo] = useState<string[]>([]);
   const [selectedSit, setSelectedSit] = useState<string[]>([]);
   const [userSearch, setUserSearch] = useState("");
   const [dataInicio, setDataInicio] = useState("");
   const [dataFim, setDataFim] = useState("");
   const [tipoDoc, setTipoDoc] = useState<string[]>([]);
   const [nDoc, setNDoc] = useState(undefined);
   const [selectedAll, setSelectedAll] = useState(false);
   const [valorSoma, setValorSoma] = useState(0);
   const [listKey, setListKey] = useState(0);
   const [selectedIds, setSelectedIds] = useState([]);
   const [currentPage, setCurrentPage] = useState(1);
   const [itemsPerPage, setItemsPerPage] = useState(10);
   const [totalRecords, setTotalRecords] = useState(0);
   const [totalPages, setTotalPages] = useState(1);
   const [isHydrated, setIsHydrated] = useState(false);

   // Inicializar valores dependentes de Date apenas no cliente
   useEffect(() => {
      const dates = getDefaultDates();
      setDataInicio(dates.ini);
      setDataFim(dates.fim);
      setListKey(Date.now());
      setIsHydrated(true);
   }, []);

   return (
      <FilterContext.Provider
         value={{
            misRecords,
            setMisRecords,
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
            listKey,
            setListKey,
            selectedIds,
            setSelectedIds,
            currentPage,
            setCurrentPage,
            itemsPerPage,
            setItemsPerPage,
            totalRecords,
            setTotalRecords,
            totalPages,
            setTotalPages,
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
