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
import { CrewIndisp, IndispType } from "services/routes/indisps";

export type IndispModalState =
   | { status: "closed" }
   | { status: "open"; tripId: number; dateRef: Date };

/** Alvo do formulário global (null = fechado). */
export type IndispFormTarget = {
   trip: CrewIndisp;
   indisp: IndispType | null;
   readOnly: boolean;
};

export type IndispModalActions = {
   /** Abre o modal de detalhes de uma célula (trip + data). */
   open: (params: { tripId: number; dateRef: Date }) => void;
   close: () => void;
   /** Abre o formulário único de indisponibilidade. */
   openForm: (target: {
      trip: CrewIndisp;
      indisp: IndispType | null;
      readOnly?: boolean;
   }) => void;
   closeForm: () => void;
};

const StateContext = createContext<IndispModalState | null>(null);
const FormContext = createContext<IndispFormTarget | null>(null);
const ActionsContext = createContext<IndispModalActions | null>(null);

const CLOSED: IndispModalState = { status: "closed" };

export function IndispModalProvider({ children }: { children: ReactNode }) {
   const [state, setState] = useState<IndispModalState>(CLOSED);
   const [form, setForm] = useState<IndispFormTarget | null>(null);
   const triggerRef = useRef<HTMLElement | null>(null);

   const open = useCallback<IndispModalActions["open"]>(
      ({ tripId, dateRef }) => {
         // salva elemento focado para restaurar foco ao fechar (a11y)
         const active = document.activeElement;
         triggerRef.current = active instanceof HTMLElement ? active : null;
         setState({ status: "open", tripId, dateRef });
      },
      []
   );
   const close = useCallback<IndispModalActions["close"]>(() => {
      setState(CLOSED);
      // aguarda render/unmount do modal antes de restaurar foco
      requestAnimationFrame(() => triggerRef.current?.focus());
   }, []);

   const openForm = useCallback<IndispModalActions["openForm"]>((target) => {
      setForm({
         trip: target.trip,
         indisp: target.indisp,
         readOnly: target.readOnly ?? false,
      });
   }, []);
   const closeForm = useCallback<IndispModalActions["closeForm"]>(() => {
      setForm(null);
   }, []);

   const actions = useMemo<IndispModalActions>(
      () => ({ open, close, openForm, closeForm }),
      [open, close, openForm, closeForm]
   );

   return (
      <ActionsContext.Provider value={actions}>
         <StateContext.Provider value={state}>
            <FormContext.Provider value={form}>{children}</FormContext.Provider>
         </StateContext.Provider>
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

export function useIndispFormTarget(): IndispFormTarget | null {
   return useContext(FormContext);
}
