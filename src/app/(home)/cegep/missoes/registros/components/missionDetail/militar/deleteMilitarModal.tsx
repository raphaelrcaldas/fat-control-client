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
      <Modal show={show} size="md" onClose={() => setShow(false)} popup>
         <ModalBody className="p-0">
            <div className="relative">
               {/* Botão fechar */}
               <button
                  onClick={() => setShow(false)}
                  className="absolute top-4 right-4 text-white/80 transition-colors duration-200 hover:text-white"
               >
                  <HiXMark className="h-6 w-6" />
               </button>

               {/* Conteúdo */}
               <div className="space-y-6 p-6">
                  <div className="space-y-3 text-center">
                     <h3 className="text-2xl font-bold text-gray-900">
                        Confirmar Exclusão
                     </h3>
                     <p className="text-gray-600">
                        Tem certeza que deseja excluir este militar da missão?
                     </p>
                  </div>

                  {/* Card com informações do militar */}
                  <div className="space-y-3 rounded-xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                     <div className="text-center">
                        <p className="text-lg font-bold text-gray-900 uppercase">
                           <span className="text-blue-600 uppercase">
                              {userMis.p_g}
                           </span>{" "}
                           <span className="text-gray-700">
                              {userMis.user.nome_guerra}
                           </span>
                        </p>
                     </div>
                  </div>

                  {/* Botões de ação */}
                  <div className="flex gap-3 pt-2">
                     <Button
                        onClick={() => setShow(false)}
                        className="flex-1 border-2 border-gray-300 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 shadow-sm transition-all duration-300 hover:from-gray-200 hover:to-gray-300 hover:shadow"
                     >
                        <HiXMark className="mr-2 h-5 w-5" />
                        Cancelar
                     </Button>
                     <Button
                        onClick={handleConfirm}
                        className="flex-1 bg-gradient-to-r from-red-500 to-red-600 shadow-md transition-all duration-300 hover:from-red-600 hover:to-red-700 hover:shadow-lg"
                     >
                        <HiTrash className="mr-2 h-5 w-5" />
                        Excluir
                     </Button>
                  </div>
               </div>
            </div>
         </ModalBody>
      </Modal>
   );
}
