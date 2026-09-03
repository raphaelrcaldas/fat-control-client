"use client";

import { useMemo } from "react";
import { Button, Modal, ModalBody, ModalFooter } from "flowbite-react";
import { CrewIndispList } from "services/routes/indisps";
import {
   useIndispModalActions,
   useIndispModalState,
} from "../context/indispModalContext";
import { computeIndispStatus } from "../utils/indispStatus";
import IndispDetails from "./IndispDetails";

type IndispModalProps = {
   indisps: CrewIndispList[] | undefined;
};

export function IndispModal({ indisps }: IndispModalProps) {
   const state = useIndispModalState();
   const { close } = useIndispModalActions();
   const isOpen = state.status === "open";

   const tripData = useMemo(() => {
      if (state.status !== "open" || !indisps) return null;
      return indisps.find((it) => it.trip.id === state.tripId) ?? null;
   }, [state, indisps]);

   const status = useMemo(() => {
      if (!tripData || state.status !== "open") return null;
      return computeIndispStatus(tripData, state.dateRef);
   }, [tripData, state]);

   return (
      <Modal show={isOpen} onClose={close} size="md" dismissible popup>
         {/* `pt-6` para igualar o recuo dos lados: com `popup`, o tema do
             Flowbite zera o padding do topo do corpo (`p-6 pt-0`) porque
             conta com um `ModalHeader` ali em cima. Este modal não tem
             header, então o nome do tripulante encostava na borda. */}
         <ModalBody className="pt-6">
            {tripData && status && state.status === "open" && (
               <IndispDetails
                  trip={tripData.trip}
                  dateRef={state.dateRef}
                  filterIndisp={status.filterIndisp}
                  isValidCEMAL={status.isValidCEMAL}
                  isDesadaptado={status.isDesadaptado}
               />
            )}
         </ModalBody>
         <ModalFooter className="justify-center">
            <Button color="gray" size="sm" onClick={close} tabIndex={-1}>
               Fechar
            </Button>
         </ModalFooter>
      </Modal>
   );
}
