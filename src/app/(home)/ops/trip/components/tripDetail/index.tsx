import { useState, useCallback } from "react";
import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import { FaEdit } from "react-icons/fa";
import { TripEditForm } from "./TripEditForm";
import type { Trip } from "../../types/trip.types";

type TripDetailProps = {
   trip: Trip;
   update: () => void;
};

export function TripDetail({ trip, update }: TripDetailProps) {
   const [show, setShow] = useState(false);

   const handleShow = useCallback(() => setShow(true), []);
   const handleClose = useCallback(() => setShow(false), []);

   return (
      <div>
         <button
            className='text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 hover:border-red-300 focus:outline-none focus:ring-4 focus:ring-red-100 font-medium rounded-lg text-sm p-2.5 transition-all'
            onClick={handleShow}
            title='Editar tripulante'
         >
            <FaEdit className='size-5' />
         </button>

         <Modal show={show} onClose={handleClose} size='lg'>
            <ModalHeader>Editar Tripulante</ModalHeader>
            <ModalBody>
               <TripEditForm
                  trip={trip}
                  onSuccess={update}
                  onClose={handleClose}
                  onCancel={handleClose}
               />
            </ModalBody>
         </Modal>
      </div>
   );
}
