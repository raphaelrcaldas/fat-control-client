import { Modal, ModalBody, ModalHeader, Button } from "flowbite-react";
import { MdWarning, MdDelete, MdClose } from "react-icons/md";

interface DeleteMissionModalProps {
   show: boolean;
   onClose: () => void;
   onConfirm: () => void;
   missionInfo: {
      tipoDoc: string;
      nDoc: number | undefined;
      desc: string;
   };
}

export function DeleteMissionModal({
   show,
   onClose,
   onConfirm,
   missionInfo,
}: DeleteMissionModalProps) {
   return (
      <Modal size="lg" show={show} onClose={onClose} dismissible>
         <ModalHeader className="border-b-2 border-red-100 bg-linear-to-r from-red-50 to-orange-50">
            <div className="flex items-center gap-3">
               <div className="rounded-full bg-red-500 p-2">
                  <MdWarning className="size-6 text-white" />
               </div>
               <span className="text-xl font-bold text-gray-800">
                  Confirmar Exclusão
               </span>
            </div>
         </ModalHeader>
         <ModalBody className="p-6">
            <div className="flex flex-col gap-6">
               {/* Mensagem de aviso */}
               <div className="rounded-r-lg border-l-4 border-red-500 bg-red-50 p-4">
                  <p className="font-medium text-gray-800">
                     Tem certeza que deseja excluir esta missão?
                  </p>
                  <p className="mt-2 text-sm text-gray-600">
                     Esta ação não pode ser desfeita. Todos os pernoites e
                     militares associados serão removidos.
                  </p>
               </div>

               {/* Informações da missão */}
               <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
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
                     onClick={() => {
                        onConfirm();
                        onClose();
                     }}
                     type="button"
                  >
                     <div className="flex items-center gap-2">
                        <MdDelete className="size-5" />
                        <span>Excluir</span>
                     </div>
                  </Button>
               </div>
            </div>
         </ModalBody>
      </Modal>
   );
}
