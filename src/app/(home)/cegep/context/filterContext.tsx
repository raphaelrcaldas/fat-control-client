import React, { createContext, useContext, useState } from "react";

const FilterContext = createContext(null);

export function FilterProvider({ children }) {
   const hoje = new Date();
   const quinzeDiasAntes = new Date();
   quinzeDiasAntes.setDate(hoje.getDate() - 15);

   const [misRecords, setMisRecords] = useState(null);
   const [selectedTipo, setSelectedTipo] = useState("");
   const [selectedSit, setSelectedSit] = useState("");
   const [userSearch, setUserSearch] = useState("");
   const [dataInicio, setDataInicio] = useState(
      quinzeDiasAntes.toISOString().split("T")[0]
   ); // Default to 15 days ago
   const [dataFim, setDataFim] = useState(hoje.toISOString().split("T")[0]); // Default to today's date
   const [tipoDoc, setTipoDoc] = useState("");
   const [nDoc, setNDoc] = useState(undefined);
   const [selectedAll, setSelectedAll] = useState(false);
   const [valorSoma, setValorSoma] = useState(0);
   const [listKey, setListKey] = useState(Date.now());
   const [selectedIds, setSelectedIds] = useState([]);

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
