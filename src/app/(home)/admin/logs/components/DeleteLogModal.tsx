"use client";

import { Button, Modal, ModalBody, ModalHeader, Spinner } from "flowbite-react";
import { MdClose, MdDelete, MdWarning } from "react-icons/md";
import { UserActionLog } from "services/routes/logs";
import { formatDateTimeFull } from "@/../utils/dateHandler";

interface DeleteLogModalProps {
   log: UserActionLog;
   show: boolean;
   isPending: boolean;
   onClose: () => void;
   onConfirm: () => void;
}

export function DeleteLogModal({
   log,
   show,
   isPending,
   onClose,
   onConfirm,
}: DeleteLogModalProps) {
   const userName = `${log.user.p_g} ${log.user.nome_guerra}`;
   const timestamp = formatDateTimeFull(log.timestamp);

   return (
      <Modal size="lg" show={show} onClose={onClose} dismissible={!isPending}>
         <ModalHeader className="border-b border-slate-200">
            <div className="flex items-center gap-3">
               <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-red-50 text-red-600 ring-1 ring-red-100 ring-inset">
                  <MdWarning className="size-6" />
               </div>
               <span className="text-lg font-bold text-slate-900">
                  Confirmar exclusão
               </span>
            </div>
         </ModalHeader>
         <ModalBody>
            <div className="space-y-5">
               <div className="space-y-1 rounded border-l-4 border-red-500 bg-red-50 p-4">
                  <p className="font-medium text-gray-800">
                     Tem certeza que deseja excluir este log?
                  </p>
                  <p className="text-sm text-gray-600">
                     Esta ação não pode ser desfeita. O registro será removido
                     permanentemente.
                  </p>
               </div>

               <div className="space-y-3 rounded border border-slate-200 bg-slate-50 p-4">
                  <h4 className="text-sm font-semibold text-gray-700">
                     Detalhes do log
                  </h4>
                  <dl className="space-y-2">
                     <div className="flex items-center gap-2">
                        <dt className="text-sm text-gray-600">ID:</dt>
                        <dd className="font-semibold text-gray-800">
                           #{log.id}
                        </dd>
                     </div>
                     <div className="flex items-center gap-2">
                        <dt className="text-sm text-gray-600">Usuário:</dt>
                        <dd className="font-semibold text-gray-800 uppercase">
                           {userName}
                        </dd>
                     </div>
                     <div className="flex items-center gap-2">
                        <dt className="text-sm text-gray-600">Data/Hora:</dt>
                        <dd className="font-mono text-sm font-semibold text-gray-800">
                           {timestamp}
                        </dd>
                     </div>
                  </dl>
               </div>

               <div className="flex justify-center gap-3">
                  <Button
                     color="gray"
                     className="w-32"
                     onClick={onClose}
                     type="button"
                     disabled={isPending}
                  >
                     <MdClose className="mr-2 size-5" />
                     Cancelar
                  </Button>

                  <Button
                     color="red"
                     className="w-32"
                     onClick={onConfirm}
                     type="button"
                     disabled={isPending}
                  >
                     {isPending ? (
                        <>
                           <Spinner
                              size="sm"
                              color="failure"
                              className="mr-2"
                           />
                           Excluindo...
                        </>
                     ) : (
                        <>
                           <MdDelete className="mr-2 size-5" />
                           Excluir
                        </>
                     )}
                  </Button>
               </div>
            </div>
         </ModalBody>
      </Modal>
   );
}
