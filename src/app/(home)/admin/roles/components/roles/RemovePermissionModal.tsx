"use client";

import clsx from "clsx";
import { Button, Modal, ModalBody, ModalHeader, Spinner } from "flowbite-react";
import { FaTriangleExclamation, FaXmark } from "react-icons/fa6";
import { getActionChipTheme } from "@/constants/admin/roles";
import type { PermissionDetail } from "services/routes/security/roles";

interface RemovePermissionModalProps {
   show: boolean;
   roleLabel: string;
   permission: PermissionDetail;
   isPending: boolean;
   onClose: () => void;
   onConfirm: () => void;
}

export function RemovePermissionModal({
   show,
   roleLabel,
   permission,
   isPending,
   onClose,
   onConfirm,
}: RemovePermissionModalProps) {
   const chip = getActionChipTheme(permission.action);

   return (
      <Modal size="lg" show={show} onClose={onClose} dismissible={!isPending}>
         <ModalHeader className="border-b border-slate-200">
            <div className="flex items-center gap-3">
               <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-red-50 text-red-600 ring-1 ring-red-100 ring-inset">
                  <FaTriangleExclamation className="size-5" />
               </div>
               <span className="text-lg font-bold text-slate-900">
                  Remover permissão
               </span>
            </div>
         </ModalHeader>
         <ModalBody>
            <div className="space-y-5">
               <div className="space-y-1 rounded border-l-4 border-red-500 bg-red-50 p-4">
                  <p className="font-medium text-gray-800">
                     Tem certeza que deseja remover esta permissão do perfil?
                  </p>
                  <p className="text-sm text-gray-600">
                     O perfil deixará de ter acesso a esta ação. É possível
                     concedê-la novamente depois.
                  </p>
               </div>

               <div className="space-y-3 rounded border border-slate-200 bg-slate-50 p-4">
                  <h4 className="text-sm font-semibold text-gray-700">
                     Detalhes
                  </h4>
                  <dl className="space-y-2">
                     <div className="flex items-center gap-2">
                        <dt className="text-sm text-gray-600">Perfil:</dt>
                        <dd className="font-semibold text-gray-800">
                           {roleLabel}
                        </dd>
                     </div>
                     <div className="flex items-center gap-2">
                        <dt className="text-sm text-gray-600">Permissão:</dt>
                        <dd className="flex items-center gap-1.5">
                           <span className="font-mono text-sm font-semibold text-gray-800">
                              {permission.resource}
                           </span>
                           <span className="text-gray-400">.</span>
                           <span
                              className={clsx(
                                 "inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-xs font-medium",
                                 chip.bg,
                                 chip.text,
                                 chip.border
                              )}
                           >
                              {permission.action}
                           </span>
                        </dd>
                     </div>
                  </dl>
                  {permission.description && (
                     <p className="text-sm text-gray-500">
                        {permission.description}
                     </p>
                  )}
               </div>

               <div className="flex justify-center gap-3">
                  <Button
                     color="gray"
                     className="w-32"
                     onClick={onClose}
                     type="button"
                     disabled={isPending}
                  >
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
                           Removendo...
                        </>
                     ) : (
                        <>
                           <FaXmark className="mr-2 size-4" />
                           Remover
                        </>
                     )}
                  </Button>
               </div>
            </div>
         </ModalBody>
      </Modal>
   );
}
