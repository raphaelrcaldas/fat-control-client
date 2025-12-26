import { Modal, ModalBody, ModalHeader, Button } from "flowbite-react";
import { MdError, MdClose } from "react-icons/md";

interface ErrorModalProps {
   show: boolean;
   onClose: () => void;
   errorMessage: string;
   errorTitle?: string;
}

export function ErrorModal({
   show,
   onClose,
   errorMessage,
   errorTitle = "Erro",
}: ErrorModalProps) {
   return (
      <Modal size="lg" show={show} onClose={onClose} dismissible>
         <ModalHeader className="border-b-2 border-red-100 bg-gradient-to-r from-red-50 to-orange-50">
            <div className="flex items-center gap-3">
               <div className="rounded-full bg-red-500 p-2">
                  <MdError className="size-6 text-white" />
               </div>
               <span className="text-xl font-bold text-gray-800">
                  {errorTitle}
               </span>
            </div>
         </ModalHeader>
         <ModalBody className="p-6">
            <div className="flex flex-col gap-6">
               {/* Mensagem de erro */}
               <div className="rounded-r-lg border-l-4 border-red-500 bg-red-50 p-4">
                  <p className="text-sm font-medium whitespace-pre-wrap text-gray-800">
                     {errorMessage}
                  </p>
               </div>

               {/* Botão de fechar */}
               <div className="flex justify-center pt-2">
                  <Button
                     color="gray"
                     className="w-32"
                     onClick={onClose}
                     type="button"
                  >
                     <div className="flex items-center gap-2">
                        <MdClose className="size-5" />
                        <span>Fechar</span>
                     </div>
                  </Button>
               </div>
            </div>
         </ModalBody>
      </Modal>
   );
}
