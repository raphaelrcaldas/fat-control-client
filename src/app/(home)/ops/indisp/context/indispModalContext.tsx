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
import {
   CrewIndisp,
   CrewIndispList,
   IndispType,
} from "services/routes/indisps";

export type IndispModalState =
   { status: "closed" } | { status: "open"; tripId: number; dateRef: Date };

/** Alvo do formulário global (null = fechado). */
export type IndispFormTarget = {
   trip: CrewIndisp;
   indisp: IndispType | null;
   readOnly: boolean;
   /**
    * Data que o formulário de criação já nasce preenchendo — vem da vaga "+"
    * clicada na grade, que sabe o dia, mas não tem registro para editar.
    */
   initialDate?: string;
};

export type IndispModalActions = {
   /** Abre o formulário único de indisponibilidade. */
   openForm: (target: {
      trip: CrewIndisp;
      indisp: IndispType | null;
      readOnly?: boolean;
      initialDate?: string;
   }) => void;
   closeForm: () => void;
   /** Abre a lista completa de um tripulante. */
   openTrip: (tripData: CrewIndispList) => void;
   closeTrip: () => void;
};

const FormContext = createContext<IndispFormTarget | null>(null);
const TripContext = createContext<CrewIndispList | null>(null);
const ActionsContext = createContext<IndispModalActions | null>(null);

export function IndispModalProvider({ children }: { children: ReactNode }) {
   const [form, setForm] = useState<IndispFormTarget | null>(null);
   const [tripTarget, setTripTarget] = useState<CrewIndispList | null>(null);
   /**
    * Um gatilho POR CANAL. Com um ref só, abrir o formulário de dentro da
    * ficha do tripulante sobrescrevia o gatilho da ficha: ao fechar os dois, o
    * foco voltava para um botão que já não existia — ou seja, para o body.
    */
   const formTriggerRef = useRef<HTMLElement | null>(null);
   const tripTriggerRef = useRef<HTMLElement | null>(null);

   // Guarda o elemento focado para devolver o foco ao fechar (a11y).
   const lembrarGatilho = (ref: typeof formTriggerRef) => {
      const active = document.activeElement;
      ref.current = active instanceof HTMLElement ? active : null;
   };

   const openForm = useCallback<IndispModalActions["openForm"]>((target) => {
      lembrarGatilho(formTriggerRef);
      // `readOnly` é SEMPRE explícito de quem abre — nunca derivado do motivo.
      // O client é o portal de gestão: motivo `locked` (Saúde, Férias, CEMAL…)
      // ganha vermelho e cadeado como SINAL de "não é o escalante que mexe
      // nisso", e não como tranca. Derivar a tranca daí trancava o gestor fora
      // da correção de um registro que é dele corrigir. Quem hoje abre em
      // consulta é o registro excluído (`LastIndisps`).
      setForm({
         trip: target.trip,
         indisp: target.indisp,
         readOnly: target.readOnly ?? false,
         initialDate: target.initialDate,
      });
   }, []);
   const closeForm = useCallback<IndispModalActions["closeForm"]>(() => {
      setForm(null);
      // aguarda o unmount do modal antes de restaurar o foco
      requestAnimationFrame(() => formTriggerRef.current?.focus());
   }, []);

   const openTrip = useCallback<IndispModalActions["openTrip"]>((tripData) => {
      lembrarGatilho(tripTriggerRef);
      setTripTarget(tripData);
   }, []);
   const closeTrip = useCallback<IndispModalActions["closeTrip"]>(() => {
      setTripTarget(null);
      requestAnimationFrame(() => tripTriggerRef.current?.focus());
   }, []);

   const actions = useMemo<IndispModalActions>(
      () => ({ openForm, closeForm, openTrip, closeTrip }),
      [openForm, closeForm, openTrip, closeTrip]
   );

   return (
      <ActionsContext.Provider value={actions}>
         <FormContext.Provider value={form}>
            <TripContext.Provider value={tripTarget}>
               {children}
            </TripContext.Provider>
         </FormContext.Provider>
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

export function useIndispFormTarget(): IndispFormTarget | null {
   return useContext(FormContext);
}

export function useIndispTripTarget(): CrewIndispList | null {
   return useContext(TripContext);
}
