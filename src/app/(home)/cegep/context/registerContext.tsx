import React, { createContext, useContext, useState } from "react";

const RegisterContext = createContext(null);

export function RegisterProvider({ children }) {
   const hoje = new Date();
   const quinzeDiasAntes = new Date();
   quinzeDiasAntes.setDate(hoje.getDate() - 15);

   const [dataInicio, setDataInicio] = useState(
      quinzeDiasAntes.toISOString().split("T")[0]
   ); // Default to 15 days ago
   const [dataFim, setDataFim] = useState(hoje.toISOString().split("T")[0]); // Default to today's date

   return (
      <RegisterContext.Provider
         value={{
            dataInicio,
            setDataInicio,
            dataFim,
            setDataFim,
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
