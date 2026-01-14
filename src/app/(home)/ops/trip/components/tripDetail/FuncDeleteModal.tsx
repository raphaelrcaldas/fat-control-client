import { useState, useCallback } from "react";
import { Modal, ModalHeader, ModalBody, Button, Spinner } from "flowbite-react";
import { FaTrash } from "react-icons/fa";
import { deleteCrewFunc } from "services/routes/trips";
import { useToast } from "@/app/context/toast";
import type { CrewFunc } from "../../types/trip.types";

type FuncDeleteModalProps = {
   show: boolean;
   onClose: () => void;
   deletingFunc: CrewFunc | null;
   onSuccess: () => void;
};

export function FuncDeleteModal({
   show,
   onClose,
   deletingFunc,
   onSuccess,
}: FuncDeleteModalProps) {
   const [loading, setLoading] = useState(false);
   const { push } = useToast();

   const handleDelete = useCallback(async () => {
      if (!deletingFunc) return;

      setLoading(true);

      try {
         const response = await deleteCrewFunc(deletingFunc.id);
         const data = await response.json();
         if (response.ok) {
            onSuccess();
            onClose();
            push({
               type: "success",
               message: data.detail || "Função excluída com sucesso.",
            });
         } else {
            push({
               type: "error",
               message: data.detail || "Erro ao excluir função.",
            });
         }
      } catch (err: any) {
         push({
            type: "error",
            message: err?.message || "Erro ao excluir função.",
         });
      } finally {
         setLoading(false);
      }
   }, [deletingFunc, onSuccess, onClose, push]);

   return (
      <Modal show={show} onClose={onClose} size="md" popup>
         <ModalHeader />
         <ModalBody>
            <div className="text-center">
               <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                  <FaTrash className="h-7 w-7 text-red-600" />
               </div>
               <h3 className="mb-3 text-lg font-semibold text-gray-800">
                  Excluir Função
               </h3>
               {deletingFunc && (
                  <div className="mb-5 space-y-2">
                     <p className="text-sm text-gray-600">
                        Tem certeza que deseja excluir a função:
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
                        Esta ação não pode ser desfeita.
                     </p>
                  </div>
               )}
               <div className="flex justify-center gap-3">
                  <Button color="gray" onClick={onClose} disabled={loading}>
                     Cancelar
                  </Button>
                  <Button color="red" onClick={handleDelete} disabled={loading}>
                     {loading ? (
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
