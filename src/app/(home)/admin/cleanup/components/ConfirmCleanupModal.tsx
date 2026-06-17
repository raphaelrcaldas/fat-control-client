"use client";

import {
   Badge,
   Button,
   Modal,
   ModalBody,
   ModalHeader,
   Spinner,
} from "flowbite-react";
import { FaTriangleExclamation } from "react-icons/fa6";
import { MdClose, MdDelete } from "react-icons/md";
import type { CleanupTaskPreview } from "services/routes/cleanup";

interface ConfirmCleanupModalProps {
   show: boolean;
   total: number;
   tasks: CleanupTaskPreview[];
   isPending: boolean;
   onConfirm: () => void;
   onClose: () => void;
}

export function ConfirmCleanupModal({
   show,
   total,
   tasks,
   isPending,
   onConfirm,
   onClose,
}: ConfirmCleanupModalProps) {
   return (
      <Modal size="lg" show={show} onClose={onClose} dismissible={!isPending}>
         <ModalHeader className="border-b border-slate-200">
            <div className="flex items-center gap-3">
               <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-red-50 text-red-600 ring-1 ring-red-100 ring-inset">
                  <FaTriangleExclamation className="size-5" />
               </div>
               <span className="text-lg font-bold text-slate-900">
                  Confirmar Limpeza
               </span>
            </div>
         </ModalHeader>
         <ModalBody>
            <div className="space-y-5">
               <div className="space-y-1 rounded border-l-4 border-red-500 bg-red-50 p-4">
                  <p className="font-medium text-gray-800">
                     Esta ação removerá permanentemente{" "}
                     <span className="font-bold text-red-700">
                        {total.toLocaleString("pt-BR")}
                     </span>{" "}
                     registros do banco de dados.
                  </p>
                  <p className="text-sm text-gray-600">
                     Não é possível desfazer esta operação.
                  </p>
               </div>

               <div className="space-y-3 rounded border border-slate-200 bg-slate-50 p-4">
                  <h4 className="text-sm font-semibold text-gray-700">
                     Tarefas a executar
                  </h4>
                  <div className="space-y-2">
                     {tasks.map((task) => (
                        <div
                           key={task.task_name}
                           className="flex items-center justify-between gap-3"
                        >
                           <span className="text-sm text-gray-600">
                              {task.description}
                           </span>
                           <Badge color={task.count > 0 ? "red" : "green"}>
                              {task.count}{" "}
                              {task.count === 1 ? "registro" : "registros"}
                           </Badge>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="flex justify-center gap-3">
                  <Button
                     color="gray"
                     className="w-32"
                     onClick={onClose}
                     disabled={isPending}
                  >
                     <MdClose className="mr-2 size-5" />
                     Cancelar
                  </Button>
                  <Button
                     color="red"
                     className="w-36"
                     onClick={onConfirm}
                     disabled={isPending}
                  >
                     {isPending ? (
                        <>
                           <Spinner
                              size="sm"
                              color="failure"
                              className="mr-2"
                           />
                           Executando...
                        </>
                     ) : (
                        <>
                           <MdDelete className="mr-2 size-5" />
                           Confirmar
                        </>
                     )}
                  </Button>
               </div>
            </div>
         </ModalBody>
      </Modal>
   );
}
