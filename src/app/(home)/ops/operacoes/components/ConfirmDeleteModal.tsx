"use client";

import { Modal, ModalHeader, ModalBody, Button, Spinner } from "flowbite-react";
import { HiExclamation } from "react-icons/hi";

interface ConfirmDeleteModalProps {
   show: boolean;
   message: string;
   confirmLabel?: string;
   isDeleting?: boolean;
   onClose: () => void;
   onConfirm: () => void;
}

export function ConfirmDeleteModal({
   show,
   message,
   confirmLabel = "Sim, excluir",
   isDeleting = false,
   onClose,
   onConfirm,
}: ConfirmDeleteModalProps) {
   return (
      <Modal
         show={show}
         onClose={isDeleting ? undefined : onClose}
         size="sm"
         popup
      >
         <ModalHeader />
         <ModalBody>
            <div className="text-center">
               <HiExclamation className="mx-auto mb-4 h-14 w-14 text-gray-400" />
               <h3 className="mb-5 text-lg font-normal text-gray-500">
                  {message}
               </h3>
               <div className="flex justify-center gap-4">
                  <Button color="red" onClick={onConfirm} disabled={isDeleting}>
                     {isDeleting ? (
                        <>
                           <Spinner
                              size="sm"
                              className="mr-2"
                              color="primary"
                           />
                           Excluindo...
                        </>
                     ) : (
                        confirmLabel
                     )}
                  </Button>
                  <Button color="gray" onClick={onClose} disabled={isDeleting}>
                     Cancelar
                  </Button>
               </div>
            </div>
         </ModalBody>
      </Modal>
   );
}
