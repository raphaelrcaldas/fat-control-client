"use client";

import {
   Modal,
   ModalHeader,
   ModalBody,
   Button,
   Spinner,
   type ButtonProps,
} from "flowbite-react";
import type { IconType } from "react-icons";
import { FaTriangleExclamation } from "react-icons/fa6";

interface ConfirmModalProps {
   show: boolean;
   title: string;
   description?: string;
   isLoading: boolean;
   onClose: () => void;
   onConfirm: () => void;
   icon?: IconType;
   iconColor?: string;
   confirmButtonColor?: ButtonProps["color"];
   confirmButtonText?: string;
}

export function ConfirmModal({
   show,
   title,
   description,
   isLoading,
   onClose,
   onConfirm,
   icon: Icon = FaTriangleExclamation,
   iconColor = "text-red-400 dark:text-red-300",
   confirmButtonColor = "red",
   confirmButtonText = "Confirmar",
}: ConfirmModalProps) {
   const handleClose = () => {
      if (!isLoading) onClose();
   };

   return (
      <Modal show={show} onClose={handleClose} size="md" popup>
         {!isLoading && <ModalHeader />}
         <ModalBody>
            <div className="text-center">
               <Icon className={`mx-auto mb-4 h-14 w-14 ${iconColor}`} />
               <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  {title}
               </h3>
               {description && (
                  <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
                     {description}
                  </p>
               )}
               <div className="flex justify-center gap-4">
                  <Button
                     color={confirmButtonColor}
                     onClick={onConfirm}
                     disabled={isLoading}
                     aria-label={confirmButtonText}
                  >
                     {isLoading ? (
                        <>
                           <Spinner
                              size="sm"
                              color="failure"
                              className="mr-2"
                           />
                           Processando...
                        </>
                     ) : (
                        confirmButtonText
                     )}
                  </Button>
                  <Button color="gray" onClick={onClose} disabled={isLoading}>
                     Cancelar
                  </Button>
               </div>
            </div>
         </ModalBody>
      </Modal>
   );
}
