"use client";

import React, { createContext, useContext, useState } from "react";
import { Missao } from "services/routes/cegep/missoes";

const FilterContext = createContext(null);

export function FilterProvider({ children }) {
   const hoje = new Date();
   const defaultIni = new Date();
   defaultIni.setDate(hoje.getDate() - 60);

   const [misRecords, setMisRecords] = useState<Missao[] | null>(null);
   const [selectedTipo, setSelectedTipo] = useState<string[]>([]);
   const [selectedSit, setSelectedSit] = useState<string[]>([]);
   const [userSearch, setUserSearch] = useState("");
   const [dataInicio, setDataInicio] = useState(
      defaultIni.toISOString().split("T")[0]
   );
   const [dataFim, setDataFim] = useState(hoje.toISOString().split("T")[0]); // Default to today's date
   const [tipoDoc, setTipoDoc] = useState<string[]>([]);
   const [nDoc, setNDoc] = useState(undefined);
   const [selectedAll, setSelectedAll] = useState(false);
   const [valorSoma, setValorSoma] = useState(0);
   const [listKey, setListKey] = useState(Date.now());
   const [selectedIds, setSelectedIds] = useState([]);
   const [currentPage, setCurrentPage] = useState(1);
   const [itemsPerPage, setItemsPerPage] = useState(10);
   const [totalRecords, setTotalRecords] = useState(0);
   const [totalPages, setTotalPages] = useState(1);

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
