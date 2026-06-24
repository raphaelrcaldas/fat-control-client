"use client";

import {
   createContext,
   useContext,
   useMemo,
   useReducer,
   type Dispatch,
   type ReactNode,
} from "react";

import { emptyDraft } from "./helpers";
import { missaoDraftReducer } from "./reducer";
import type { Action, MissaoDraft } from "./types";

const MissaoDraftStateContext = createContext<MissaoDraft | null>(null);
const MissaoDraftDispatchContext = createContext<Dispatch<Action> | null>(null);

interface MissaoDraftProviderProps {
   children: ReactNode;
   initialDraft?: MissaoDraft;
}

export function MissaoDraftProvider({
   children,
   initialDraft,
}: MissaoDraftProviderProps) {
   const [state, dispatch] = useReducer(
      missaoDraftReducer,
      initialDraft,
      (init) => init ?? emptyDraft()
   );

   // Dispatch is stable; memoize to keep reference identity explicit.
   const stableDispatch = useMemo(() => dispatch, [dispatch]);

   return (
      <MissaoDraftStateContext.Provider value={state}>
         <MissaoDraftDispatchContext.Provider value={stableDispatch}>
            {children}
         </MissaoDraftDispatchContext.Provider>
      </MissaoDraftStateContext.Provider>
   );
}

export function useMissaoDraft(): MissaoDraft {
   const ctx = useContext(MissaoDraftStateContext);
   if (ctx == null) {
      throw new Error(
         "useMissaoDraft must be used within a MissaoDraftProvider"
      );
   }
   return ctx;
}

export function useMissaoDraftDispatch(): Dispatch<Action> {
   const ctx = useContext(MissaoDraftDispatchContext);
   if (ctx == null) {
      throw new Error(
         "useMissaoDraftDispatch must be used within a MissaoDraftProvider"
      );
   }
   return ctx;
}
