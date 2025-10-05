"use client";
import React, { createContext, useContext, useState } from "react";

interface QuadsContextType {
   quadFunc: string;
   setQuadFunc: React.Dispatch<React.SetStateAction<string>>;
   quadType: number;
   setQuadType: React.Dispatch<React.SetStateAction<number>>;
}

const QuadsContext = createContext<QuadsContextType | undefined>(undefined);

export const QuadsProvider = ({ children }) => {
   const [quadFunc, setQuadFunc] = useState("mc");
   const [quadType, setQuadType] = useState(1);

   return (
      <QuadsContext.Provider
         value={{
            quadFunc,
            setQuadFunc,
            quadType,
            setQuadType,
         }}
      >
         {children}
      </QuadsContext.Provider>
   );
};

export function useQuadsContext() {
   return useContext(QuadsContext);
}
