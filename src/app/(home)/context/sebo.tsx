"use client";
import React, { createContext, useContext, useState } from "react";

interface SeboContextType {
   seboFunc: string;
   setSeboFunc: React.Dispatch<React.SetStateAction<string>>;
}

const SeboContext = createContext<SeboContextType | undefined>(undefined);

export const SeboProvider = ({ children }) => {
   const [seboFunc, setSeboFunc] = useState<string>("mc");

   return (
      <SeboContext.Provider
         value={{
            seboFunc,
            setSeboFunc,
         }}
      >
         {children}
      </SeboContext.Provider>
   );
};

export function useSeboContext() {
   return useContext(SeboContext);
}
