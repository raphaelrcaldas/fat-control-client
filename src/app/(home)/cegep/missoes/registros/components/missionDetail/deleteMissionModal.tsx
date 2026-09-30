import { Modal, ModalBody, ModalHeader, Button, Spinner } from "flowbite-react";
import { MdWarning, MdDelete, MdClose } from "react-icons/md";

interface DeleteMissionModalProps {
   show: boolean;
   onClose: () => void;
   onConfirm: () => void;
   /**
    * Exclusão em voo: o modal fica aberto, com o botão ocupado e o "Cancelar"
    * travado — é irreversível, e fechar aqui não cancelaria a requisição.
    * Quem fecha é o pai, no sucesso (navegação) ou no erro.
    */
   isDeleting?: boolean;
   missionInfo: {
      tipoDoc: string;
      nDoc: string;
      desc: string;
   };
}

export function DeleteMissionModal({
   show,
   onClose,
   onConfirm,
   isDeleting = false,
   missionInfo,
}: DeleteMissionModalProps) {
   return (
      <Modal
         size="lg"
         show={show}
         onClose={isDeleting ? () => {} : onClose}
         dismissible={!isDeleting}
      >
         <ModalHeader className="border-b border-slate-200">
            <div className="flex items-center gap-3">
               <div className="rounded-md bg-red-100 p-2 shadow-sm">
                  <MdWarning className="size-6 text-red-600" />
               </div>
               <span className="text-xl font-bold text-gray-800">
                  Confirmar Exclusão
               </span>
            </div>
         </ModalHeader>
         <ModalBody className="p-6">
            <div className="flex flex-col gap-6">
               {/* Mensagem de aviso */}
               <div className="rounded border-l-4 border-red-500 bg-red-50 p-4">
                  <p className="font-medium text-gray-800">
                     Tem certeza que deseja excluir esta missão?
                  </p>
                  <p className="mt-2 text-sm text-gray-600">
                     Esta ação não pode ser desfeita. Todos os pernoites e
                     militares associados serão removidos.
                  </p>
               </div>

               {/* Informações da missão */}
               <div className="rounded border border-slate-200 bg-gray-50 p-4">
                  <h4 className="mb-3 text-sm font-semibold text-gray-700">
                     Detalhes da Missão:
                  </h4>
                  <div className="space-y-2">
                     <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Tipo:</span>
                        <span className="font-semibold text-gray-800 uppercase">
                           {missionInfo.tipoDoc}
                        </span>
                     </div>
                     <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                           Nº Documento:
                        </span>
                        <span className="font-semibold text-gray-800">
                           {missionInfo.nDoc}
                        </span>
                     </div>
                     <div className="flex items-start gap-2">
                        <span className="text-sm text-gray-600">
                           Descrição:
                        </span>
                        <span className="font-medium text-gray-800 uppercase">
                           {missionInfo.desc}
                        </span>
                     </div>
                  </div>
               </div>

               {/* Botões de ação */}
               <div className="flex justify-center gap-3 pt-2">
                  <Button
                     color="gray"
                     className="w-32"
                     onClick={onClose}
                     disabled={isDeleting}
                     type="button"
                  >
                     <div className="flex items-center gap-2">
                        <MdClose className="size-5" />
                        <span>Cancelar</span>
                     </div>
                  </Button>

                  <Button
                     color="red"
                     className="w-32"
                     onClick={onConfirm}
                     disabled={isDeleting}
                     aria-busy={isDeleting}
                     type="button"
                  >
                     <div className="flex items-center gap-2">
                        {isDeleting ? (
                           <Spinner size="sm" color="white" />
                        ) : (
                           <MdDelete className="size-5" />
                        )}
                        <span>{isDeleting ? "Excluindo…" : "Excluir"}</span>
                     </div>
                  </Button>
               </div>
            </div>
         </ModalBody>
      </Modal>
   );
}
