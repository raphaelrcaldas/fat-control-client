import {
   Modal,
   ModalHeader,
   ModalBody,
   ModalFooter,
   Button,
} from "flowbite-react";

interface DeleteCartaoConfirmModalProps {
   show: boolean;
   onClose: () => void;
   onConfirm: () => void;
   isDeleting: boolean;
   nomeGuerra: string;
}

export default function DeleteCartaoConfirmModal({
   show,
   onClose,
   onConfirm,
   isDeleting,
   nomeGuerra,
}: DeleteCartaoConfirmModalProps) {
   return (
      <Modal show={show} onClose={onClose} size="sm">
         <ModalHeader>Confirmar exclusão</ModalHeader>
         <ModalBody>
            <p className="text-sm text-gray-600">
               Remover o cartão de{" "}
               <strong className="font-semibold text-gray-900">
                  {nomeGuerra.toUpperCase()}
               </strong>
               ? Esta ação não pode ser desfeita.
            </p>
         </ModalBody>
         <ModalFooter>
            <div className="flex w-full justify-end gap-2">
               <Button color="gray" onClick={onClose} disabled={isDeleting}>
                  Cancelar
               </Button>
               <Button color="red" onClick={onConfirm} disabled={isDeleting}>
                  {isDeleting ? "Removendo..." : "Remover"}
               </Button>
            </div>
         </ModalFooter>
      </Modal>
   );
}
