"use client";
import React, { createContext, useContext, useState } from "react";

interface QuadsContextType {
   quadFunc: string;
   setQuadFunc: React.Dispatch<React.SetStateAction<string>>;
   visual: "comp" | "reduz";
   setVisual: React.Dispatch<React.SetStateAction<"comp" | "reduz">>;
   quadType: number;
   setQuadType: React.Dispatch<React.SetStateAction<number>>;
}

const QuadsContext = createContext<QuadsContextType | undefined>(undefined);

interface QuadsProviderProps {
   children: React.ReactNode;
}

export const QuadsProvider = ({ children }: QuadsProviderProps) => {
   const [quadFunc, setQuadFunc] = useState("mc");
   const [quadType, setQuadType] = useState<number>(1);
   const [visual, setVisual] = useState<"comp" | "reduz">("comp");

   return (
      <QuadsContext.Provider
         value={{
            quadFunc,
            setQuadFunc,
            quadType,
            setQuadType,
            visual,
            setVisual,
         }}
      >
         {children}
      </QuadsContext.Provider>
   );
};

export function useQuadsContext() {
   const context = useContext(QuadsContext);
   if (context === undefined) {
      throw new Error(
         "useQuadsContext deve ser usado dentro de um QuadsProvider"
      );
   }
   return context;
}
