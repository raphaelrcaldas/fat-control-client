import { useCallback } from "react";
import { Modal, ModalHeader, ModalBody, Button, Spinner } from "flowbite-react";
import { FaTrash } from "react-icons/fa";
import { useDeleteCrewFunc } from "@/hooks/queries";
import { useToast } from "@/app/context/toast";
import type { CrewFunc } from "../../types/trip.types";

type FuncDeleteModalProps = {
   show: boolean;
   onClose: () => void;
   deletingFunc: CrewFunc | null;
};

export function FuncDeleteModal({
   show,
   onClose,
   deletingFunc,
}: FuncDeleteModalProps) {
   const { push } = useToast();
   const deleteFuncMutation = useDeleteCrewFunc();

   const handleDelete = useCallback(async () => {
      if (!deletingFunc) return;

      deleteFuncMutation.mutate(deletingFunc.id, {
         onSuccess: (result) => {
            if (result.ok) {
               onClose();
               push({
                  type: "success",
                  message: result.message || "Funcao excluida com sucesso.",
               });
            } else {
               push({
                  type: "error",
                  message: result.message || "Erro ao excluir funcao.",
               });
            }
         },
         onError: (err: any) => {
            push({
               type: "error",
               message: err?.message || "Erro ao excluir funcao.",
            });
         },
      });
   }, [deletingFunc, onClose, push, deleteFuncMutation]);

   return (
      <Modal show={show} onClose={onClose} size="md" popup>
         <ModalHeader />
         <ModalBody>
            <div className="text-center">
               <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                  <FaTrash className="h-7 w-7 text-red-600" />
               </div>
               <h3 className="mb-3 text-lg font-semibold text-gray-800">
                  Excluir Funcao
               </h3>
               {deletingFunc && (
                  <div className="mb-5 space-y-2">
                     <p className="text-sm text-gray-600">
                        Tem certeza que deseja excluir a funcao:
                     </p>
                     <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <p className="text-base font-bold text-gray-800 uppercase">
                           {deletingFunc.func}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                           Operacionalidade:{" "}
                           <span className="font-semibold uppercase">
                              {deletingFunc.oper}
                           </span>
                        </p>
                     </div>
                     <p className="mt-3 text-sm font-medium text-red-600">
                        Esta acao nao pode ser desfeita.
                     </p>
                  </div>
               )}
               <div className="flex justify-center gap-3">
                  <Button
                     color="gray"
                     onClick={onClose}
                     disabled={deleteFuncMutation.isPending}
                  >
                     Cancelar
                  </Button>
                  <Button
                     color="red"
                     onClick={handleDelete}
                     disabled={deleteFuncMutation.isPending}
                  >
                     {deleteFuncMutation.isPending ? (
                        <div className="flex items-center gap-2">
                           <Spinner size="sm" color="failure" />
                           <span>Excluindo...</span>
                        </div>
                     ) : (
                        <div className="flex items-center gap-2">
                           <FaTrash className="size-4" />
                           <span>Sim, excluir</span>
                        </div>
                     )}
                  </Button>
               </div>
            </div>
         </ModalBody>
      </Modal>
   );
}
