"use client";

import {
   createContext,
   ReactNode,
   useCallback,
   useContext,
   useMemo,
   useRef,
   useState,
} from "react";

export type IndispModalState =
   | { status: "closed" }
   | { status: "open"; tripId: number; dateRef: Date };

export type IndispModalActions = {
   open: (params: { tripId: number; dateRef: Date }) => void;
   close: () => void;
};

const StateContext = createContext<IndispModalState | null>(null);
const ActionsContext = createContext<IndispModalActions | null>(null);

const CLOSED: IndispModalState = { status: "closed" };

export function IndispModalProvider({ children }: { children: ReactNode }) {
   const [state, setState] = useState<IndispModalState>(CLOSED);
   const triggerRef = useRef<HTMLElement | null>(null);

   const open = useCallback<IndispModalActions["open"]>(
      ({ tripId, dateRef }) => {
         // salva elemento focado para restaurar foco ao fechar (a11y)
         const active = document.activeElement;
         triggerRef.current =
            active instanceof HTMLElement ? active : null;
         setState({ status: "open", tripId, dateRef });
      },
      []
   );
   const close = useCallback<IndispModalActions["close"]>(() => {
      setState(CLOSED);
      // aguarda render/unmount do modal antes de restaurar foco
      requestAnimationFrame(() => triggerRef.current?.focus());
   }, []);

   const actions = useMemo<IndispModalActions>(
      () => ({ open, close }),
      [open, close]
   );

   return (
      <ActionsContext.Provider value={actions}>
         <StateContext.Provider value={state}>{children}</StateContext.Provider>
      </ActionsContext.Provider>
   );
}

export function useIndispModalActions(): IndispModalActions {
   const ctx = useContext(ActionsContext);
   if (!ctx) {
      throw new Error(
         "useIndispModalActions deve ser usado dentro de IndispModalProvider"
      );
   }
   return ctx;
}

export function useIndispModalState(): IndispModalState {
   const ctx = useContext(StateContext);
   if (!ctx) {
      throw new Error(
         "useIndispModalState deve ser usado dentro de IndispModalProvider"
      );
   }
   return ctx;
}
