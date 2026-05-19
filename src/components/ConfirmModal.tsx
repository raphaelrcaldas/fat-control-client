"use client";

import type { ReactNode } from "react";
import { Button, Modal, ModalBody, ModalHeader, Spinner } from "flowbite-react";
import { HiExclamationCircle } from "react-icons/hi";
import type { IconType } from "react-icons";

type ConfirmColor = "red" | "amber" | "blue";

interface ConfirmModalProps {
   show: boolean;
   onClose: () => void;
   onConfirm: () => void;
   title: string;
   message: ReactNode;
   confirmLabel?: string;
   cancelLabel?: string;
   confirmColor?: ConfirmColor;
   icon?: IconType;
   iconColor?: string;
   isLoading?: boolean;
}

export function ConfirmModal({
   show,
   onClose,
   onConfirm,
   title,
   message,
   confirmLabel = "Confirmar",
   cancelLabel = "Cancelar",
   confirmColor = "red",
   icon: Icon = HiExclamationCircle,
   iconColor = "text-amber-400",
   isLoading = false,
}: ConfirmModalProps) {
   return (
      <Modal show={show} onClose={onClose} size="md" popup>
         <ModalHeader>{title}</ModalHeader>
         <ModalBody>
            <div className="text-center">
               <Icon className={`mx-auto mb-4 h-14 w-14 ${iconColor}`} />
               <div className="mb-2 text-base text-gray-600">{message}</div>
               <div className="flex justify-center gap-3 pt-4">
                  <Button color="gray" onClick={onClose} disabled={isLoading}>
                     {cancelLabel}
                  </Button>
                  <Button
                     color={confirmColor}
                     onClick={onConfirm}
                     disabled={isLoading}
                  >
                     {isLoading ? (
                        <div className="flex items-center gap-2">
                           <Spinner size="sm" color="failure" />
                           <span>Processando...</span>
                        </div>
                     ) : (
                        confirmLabel
                     )}
                  </Button>
               </div>
            </div>
         </ModalBody>
      </Modal>
   );
}
