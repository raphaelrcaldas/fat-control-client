import { useState, useCallback } from "react";
import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import { TripEditForm } from "./TripEditForm";
import type { Trip } from "../../types/trip.types";

type TripDetailProps = {
   trip: Trip;
};

export function TripDetail({ trip }: TripDetailProps) {
   const [show, setShow] = useState(false);

   const handleShow = useCallback(() => setShow(true), []);
   const handleClose = useCallback(() => setShow(false), []);

   return (
      <div>
         <button
            className="text-sm font-medium text-cyan-600 hover:underline"
            onClick={handleShow}
         >
            Detalhes
         </button>

         <Modal show={show} onClose={handleClose} size="lg" dismissible>
            <ModalHeader>Editar Tripulante</ModalHeader>
            <ModalBody>
               <TripEditForm
                  trip={trip}
                  onClose={handleClose}
                  onCancel={handleClose}
               />
            </ModalBody>
         </Modal>
      </div>
   );
}
