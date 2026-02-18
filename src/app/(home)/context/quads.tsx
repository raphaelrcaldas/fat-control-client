"use client";
import React, { createContext, useContext } from "react";
import { usePersistedState } from "@/hooks/usePersistedState";

interface QuadsContextType {
   quadFunc: string;
   setQuadFunc: React.Dispatch<React.SetStateAction<string>>;
   visual: "comp" | "reduz";
   setVisual: React.Dispatch<React.SetStateAction<"comp" | "reduz">>;
   quadType: number;
   setQuadType: React.Dispatch<React.SetStateAction<number>>;
}

const QuadsContext = createContext<QuadsContextType | undefined>(undefined);

export function QuadsProvider({ children }: { children: React.ReactNode }) {
   const [quadFunc, setQuadFunc] = usePersistedState("quads.quadFunc", "mc");
   const [quadType, setQuadType] = usePersistedState<number>(
      "quads.quadType",
      1
   );
   const [visual, setVisual] = usePersistedState<"comp" | "reduz">(
      "quads.visual",
      "comp"
   );

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
}

export function useQuadsContext() {
   const context = useContext(QuadsContext);
   if (context === undefined) {
      throw new Error(
         "useQuadsContext deve ser usado dentro de um QuadsProvider"
      );
   }
   return context;
}
