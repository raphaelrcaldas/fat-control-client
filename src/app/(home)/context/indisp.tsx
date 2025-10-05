"use client";
import React, { createContext, useContext, useState } from "react";

interface IndispContextType {
   indispFunc: string;
   setIndispFunc: React.Dispatch<React.SetStateAction<string>>;
}

const IndispContext = createContext<IndispContextType | undefined>(undefined);

export const IndispProvider = ({ children }) => {
   const [indispFunc, setIndispFunc] = useState<string>("mc");

   return (
      <IndispContext.Provider
         value={{
            indispFunc,
            setIndispFunc,
         }}
      >
         {children}
      </IndispContext.Provider>
   );
};

export function useIndispContext() {
   return useContext(IndispContext);
}
