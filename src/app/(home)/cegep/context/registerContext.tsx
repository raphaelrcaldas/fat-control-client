import React, { createContext, useContext, useState } from "react";

const RegisterContext = createContext(null);

export function RegisterProvider({ children }) {
   const hoje = new Date();
   const quinzeDiasAntes = new Date(hoje.getFullYear(), 0, 1);
   const [dataInicio, setDataInicio] = useState(
      quinzeDiasAntes.toISOString().split("T")[0]
   ); // Default to 15 days ago
   const [dataFim, setDataFim] = useState(hoje.toISOString().split("T")[0]);
   const [tipoDoc, setTipoDoc] = useState("");
   const [nDoc, setNDoc] = useState("");
   const [selectedTipo, setSelectedTipo] = useState("");

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
