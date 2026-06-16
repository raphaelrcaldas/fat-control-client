"use client";

import { Button, Modal, ModalHeader, ModalBody, Spinner } from "flowbite-react";
import { HiExclamation } from "react-icons/hi";
import { MdDeleteOutline } from "react-icons/md";
import { formatNaiveDate } from "utils/dateHandler";
import { ComissWithMiss, DeletePreview } from "services/routes/cegep/comiss";

interface DeleteComissModalProps {
   show: boolean;
   comiss: ComissWithMiss;
   deletePreview: DeletePreview | null;
   isDeleting: boolean;
   onConfirm: () => void;
   onCancel: () => void;
}

export function DeleteComissModal({
   show,
   comiss,
   deletePreview,
   isDeleting,
   onConfirm,
   onCancel,
}: DeleteComissModalProps) {
   return (
      <Modal show={show} size="2xl" onClose={onCancel} popup>
         <ModalHeader />
         <ModalBody>
            <div className="px-4 py-2 text-center">
               <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                  <MdDeleteOutline className="h-9 w-9 text-red-600" />
               </div>

               <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  Excluir Comissionamento
               </h3>

               <div className="mb-6 space-y-3">
                  <p className="text-base text-gray-600">
                     Voce está prestes a excluir o comissionamento de:
                  </p>
                  <div className="rounded border border-gray-200 bg-gray-50 p-4">
                     <p className="text-lg font-bold text-gray-900 uppercase">
                        {comiss.user.posto.mid} {comiss.user.esp}{" "}
                        {comiss.user.nome_guerra}
                     </p>
                     <p className="mt-1 text-sm text-gray-600 capitalize">
                        {comiss.user.nome_completo}
                     </p>
                  </div>

                  {/* Preview de missoes afetadas */}
                  {deletePreview && (
                     <div className="space-y-2 text-left">
                        <div className="flex items-center gap-2 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                           <HiExclamation className="h-5 w-5 shrink-0" />
                           <span>
                              Este comissionamento possui{" "}
                              <strong>
                                 {deletePreview.missoes_count} missão(ões)
                              </strong>{" "}
                              vinculada(s). O militar será desvinculado e
                              missões órfãs serão removidas.
                           </span>
                        </div>

                        <div className="max-h-48 overflow-y-auto rounded border border-gray-200">
                           {deletePreview.missoes.map((m) => (
                              <div
                                 key={m.id}
                                 className="flex items-center justify-between border-b border-gray-100 px-3 py-2 text-sm last:border-b-0"
                              >
                                 <span className="font-medium text-nowrap text-gray-900 uppercase">
                                    {m.tipo_doc} {m.n_doc}
                                 </span>
                                 <span className="truncate px-2 text-left text-gray-600 uppercase">
                                    {m.desc}
                                 </span>
                                 <span className="shrink-0 font-mono text-xs text-gray-500">
                                    {formatNaiveDate(m.afast)}
                                 </span>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  <div className="flex items-center justify-center gap-2 text-sm font-medium text-red-600">
                     <HiExclamation className="h-5 w-5" />
                     Esta acão não pode ser desfeita
                  </div>
               </div>

               <div className="flex justify-center gap-3">
                  <Button
                     color="red"
                     onClick={onConfirm}
                     disabled={isDeleting}
                     className="px-6"
                  >
                     {isDeleting ? (
                        <div className="flex items-center gap-2">
                           <Spinner color="failure" size="sm" />
                           <span>Excluindo...</span>
                        </div>
                     ) : deletePreview ? (
                        `Confirmar exclusao de ${deletePreview.missoes_count} missao(oes)`
                     ) : (
                        "Sim, excluir"
                     )}
                  </Button>
                  <Button
                     color="gray"
                     onClick={onCancel}
                     disabled={isDeleting}
                     className="px-6"
                  >
                     Cancelar
                  </Button>
               </div>
            </div>
         </ModalBody>
      </Modal>
   );
}
