"use client";

import { Modal, ModalHeader, ModalBody, Button, Spinner } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";

interface DeleteOrdemModalProps {
   isOpen: boolean;
   ordemNumero: string;
   onConfirm: () => void;
   onCancel: () => void;
   isDeleting?: boolean;
}

export function DeleteOrdemModal({
   isOpen,
   ordemNumero,
   onConfirm,
   onCancel,
   isDeleting = false,
}: DeleteOrdemModalProps) {
   return (
      <Modal show={isOpen} size="md" onClose={onCancel} popup>
         <ModalHeader />
         <ModalBody>
            <div className="text-center">
               <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-red-400" />
               <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Excluir Rascunho
               </h3>
               <p className="mb-5 text-sm text-gray-500">
                  Tem certeza que deseja excluir o rascunho{" "}
                  <span className="font-mono font-bold text-gray-900">
                     {ordemNumero}
                  </span>
                  ?
               </p>
               <p className="mb-5 text-xs text-gray-400">
                  Esta ação não pode ser desfeita.
               </p>
               <div className="flex justify-center gap-4">
                  <Button color="red" onClick={onConfirm} disabled={isDeleting}>
                     {isDeleting ? (
                        <>
                           <Spinner size="sm" className="mr-2" />
                           Excluindo...
                        </>
                     ) : (
                        "Sim, excluir"
                     )}
                  </Button>
                  <Button color="gray" onClick={onCancel} disabled={isDeleting}>
                     Cancelar
                  </Button>
               </div>
            </div>
         </ModalBody>
      </Modal>
   );
}
