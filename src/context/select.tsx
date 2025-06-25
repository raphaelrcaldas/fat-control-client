"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

const SelectContext = createContext({});

export const SelectProvider = ({ children }) => {
   const [seboFunc, setSeboFunc] = useState("mc");
   const [quadFunc, setQuadFunc] = useState("mc");
   const [quadType, setQuadType] = useState(1);
   const [indispFunc, setIndispFunc] = useState(1);

   return (
      <SelectContext.Provider
         value={{
            seboPage: { func: { state: seboFunc, setState: setSeboFunc } },
            quadsPage: {
               func: { state: quadFunc, setState: setQuadFunc },
               type: { state: quadType, setState: setQuadType },
            },
            indispPage: {
               func: { state: indispFunc, setState: setIndispFunc },
            },
         }}
      >
         {children}
      </SelectContext.Provider>
   );
};

export function useSelect() {
   return useContext(SelectContext);
}
