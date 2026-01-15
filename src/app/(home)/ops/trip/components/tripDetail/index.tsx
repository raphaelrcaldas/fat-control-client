import { useState, useCallback } from "react";
import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import { FaEdit } from "react-icons/fa";
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
            className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-sm font-medium text-red-600 transition-all hover:border-red-300 hover:bg-red-100 focus:ring-4 focus:ring-red-100 focus:outline-none"
            onClick={handleShow}
            title="Editar tripulante"
         >
            <FaEdit className="size-5" />
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
