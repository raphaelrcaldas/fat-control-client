"use client";

import { useMemo } from "react";
import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import { CrewIndispList } from "services/routes/indisps";
import {
   useIndispModalActions,
   useIndispModalState,
} from "../../context/indispModalContext";
import { computeIndispStatus } from "../../utils/indispStatus";
import IndispDetails from "./details";

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
         <ModalHeader />
         <ModalBody>
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
      </Modal>
   );
}
