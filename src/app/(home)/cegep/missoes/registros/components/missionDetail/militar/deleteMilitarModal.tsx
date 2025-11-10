import { Modal, ModalBody, Button } from "flowbite-react";
import { HiExclamationTriangle, HiXMark, HiTrash } from "react-icons/hi2";
import { UserMission } from "services/routes/cegep/missoes";

type DeleteMilitarModalProps = {
   show: boolean;
   setShow: (show: boolean) => void;
   userMis: UserMission;
   onConfirm: () => void;
};

export function DeleteMilitarModal({
   show,
   setShow,
   userMis,
   onConfirm,
}: DeleteMilitarModalProps) {
   const handleConfirm = () => {
      onConfirm();
      setShow(false);
   };

   return (
      <Modal
         show={show}
         size="md"
         onClose={() => setShow(false)}
         popup
      >
         <ModalBody className="p-0">
            <div className="relative">

               {/* Botão fechar */}
               <button
                  onClick={() => setShow(false)}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors duration-200"
               >
                  <HiXMark className="w-6 h-6" />
               </button>

               {/* Conteúdo */}
               <div className="p-6 space-y-6">
                  <div className="text-center space-y-3">
                     <h3 className="text-2xl font-bold text-gray-900">
                        Confirmar Exclusão
                     </h3>
                     <p className="text-gray-600">
                        Tem certeza que deseja excluir este militar da missão?
                     </p>
                  </div>

                  {/* Card com informações do militar */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-4 space-y-3">
                     <div className="text-center">
                        <p className="text-lg font-bold text-gray-900 uppercase">
                           <span className="text-blue-600 uppercase">{userMis.p_g}</span>
                           {" "}
                           <span className="text-gray-700">{userMis.user.nome_guerra}</span>
                        </p>
                        
                     </div>
                  </div>

                  {/* Botões de ação */}
                  <div className="flex gap-3 pt-2">
                     <Button
                        onClick={() => setShow(false)}
                        className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 border-2 border-gray-300 transition-all duration-300 shadow-sm hover:shadow"
                     >
                        <HiXMark className="w-5 h-5 mr-2" />
                        Cancelar
                     </Button>
                     <Button
                        onClick={handleConfirm}
                        className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg"
                     >
                        <HiTrash className="w-5 h-5 mr-2" />
                        Excluir
                     </Button>
                  </div>
               </div>
            </div>
         </ModalBody>
      </Modal>
   );
}
