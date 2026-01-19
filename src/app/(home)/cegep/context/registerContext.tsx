"use client";

import { createContext, useContext, useState } from "react";

const RegisterContext = createContext(null);

export function RegisterProvider({ children }) {
   const hoje = new Date();
   const defaultIni = new Date();
   defaultIni.setDate(hoje.getDate() - 60);
   const [dataInicio, setDataInicio] = useState(
      defaultIni.toISOString().split("T")[0]
   );
   const [dataFim, setDataFim] = useState(hoje.toISOString().split("T")[0]);
   const [tipoDoc, setTipoDoc] = useState<string[]>([]);
   const [userSearch, setUserSearch] = useState("");
   const [citySearch, setCitySearch] = useState("");
   const [nDoc, setNDoc] = useState<number | undefined>(undefined);
   const [selectedTipo, setSelectedTipo] = useState<string[]>([]);

   return (
      <RegisterContext.Provider
         value={{
            dataInicio,
            setDataInicio,
            dataFim,
            setDataFim,
            tipoDoc,
            setTipoDoc,
            nDoc,
            setNDoc,
            selectedTipo,
            setSelectedTipo,
            userSearch,
            setUserSearch,
            citySearch,
            setCitySearch,
         }}
      >
         {children}
      </RegisterContext.Provider>
   );
}

export function useRegisterContext() {
   const ctx = useContext(RegisterContext);
   if (!ctx)
      throw new Error(
         "useRegisterContext deve ser usado dentro de RegisterProvider"
      );
   return ctx;
}
