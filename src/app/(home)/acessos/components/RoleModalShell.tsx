"use client";

import type { ReactNode } from "react";
import {
   Alert,
   Button,
   Modal,
   ModalBody,
   ModalFooter,
   ModalHeader,
   Spinner,
} from "flowbite-react";
import type { IconType } from "react-icons";
import { FaExclamationTriangle } from "react-icons/fa";

interface RoleModalShellProps {
   show: boolean;
   onClose: () => void;
   icon: IconType;
   title: string;
   subtitle?: string;
   error?: string;
   isSaving: boolean;
   confirmLabel: string;
   confirmIcon: IconType;
   savingLabel?: string;
   confirmDisabled?: boolean;
   onConfirm: () => void;
   children: ReactNode;
}

/** Casca compartilhada dos modais de perfil (adicionar/editar). */
export function RoleModalShell({
   show,
   onClose,
   icon: Icon,
   title,
   subtitle,
   error,
   isSaving,
   confirmLabel,
   confirmIcon: ConfirmIcon,
   savingLabel = "Salvando...",
   confirmDisabled,
   onConfirm,
   children,
}: RoleModalShellProps) {
   return (
      <Modal show={show} size="lg" onClose={onClose} dismissible>
         <ModalHeader className="border-b">
            <div className="flex items-center gap-3">
               <div className="bg-primary-100 flex h-10 w-10 items-center justify-center rounded-full">
                  <Icon className="text-primary-600" />
               </div>
               <div>
                  <h3 className="text-xl font-semibold">{title}</h3>
                  {subtitle && (
                     <p className="mt-1 text-sm font-normal text-gray-500">
                        {subtitle}
                     </p>
                  )}
               </div>
            </div>
         </ModalHeader>

         <ModalBody>
            <div className="flex flex-col gap-3">
               {error && (
                  <Alert color="failure" icon={FaExclamationTriangle}>
                     <span className="font-medium">Erro:</span> {error}
                  </Alert>
               )}
               {children}
            </div>
         </ModalBody>

         <ModalFooter className="border-t">
            <div className="flex w-full gap-2 sm:ml-auto sm:w-auto">
               <Button
                  color="light"
                  onClick={onClose}
                  disabled={isSaving}
                  className="flex-1 sm:flex-none"
               >
                  Cancelar
               </Button>
               <Button
                  color="primary"
                  onClick={onConfirm}
                  disabled={isSaving || confirmDisabled}
                  className="flex-1 sm:flex-none"
               >
                  {isSaving ? (
                     <div className="flex items-center gap-2">
                        <Spinner color="primary" size="sm" />
                        <span>{savingLabel}</span>
                     </div>
                  ) : (
                     <div className="flex items-center gap-2">
                        <ConfirmIcon />
                        <span>{confirmLabel}</span>
                     </div>
                  )}
               </Button>
            </div>
         </ModalFooter>
      </Modal>
   );
}
