import { Modal, ModalHeader, ModalBody, Button } from "flowbite-react";
import { MdFlightTakeoff } from "react-icons/md";

interface ConfirmDeleteModalProps {
   show: boolean;
   onClose: () => void;
   onConfirm: () => void;
   title?: string;
   description?: string;
}

export default function ConfirmDeleteModal({
   show,
   onClose,
   onConfirm,
   title = "Excluir sessão?",
   description = "Esta ação não pode ser desfeita.",
}: ConfirmDeleteModalProps) {
   return (
      <Modal show={show} size="md" onClose={onClose} popup>
         <ModalHeader />
         <ModalBody>
            <div className="text-center">
               <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-red-100">
                  <MdFlightTakeoff className="h-6 w-6 text-red-600" />
               </div>
               <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  {title}
               </h3>
               <p className="mb-6 text-sm text-gray-500">{description}</p>
               <div className="flex justify-center gap-3">
                  <Button color="red" onClick={onConfirm}>
                     Sim, excluir
                  </Button>
                  <Button color="gray" onClick={onClose}>
                     Cancelar
                  </Button>
               </div>
            </div>
         </ModalBody>
      </Modal>
   );
}
