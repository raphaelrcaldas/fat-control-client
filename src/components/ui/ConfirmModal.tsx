"use client";

import {
   Modal,
   ModalHeader,
   ModalBody,
   Button,
   Spinner,
   type ButtonProps,
} from "flowbite-react";
import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import { FaTriangleExclamation } from "react-icons/fa6";

interface ConfirmModalProps {
   show: boolean;
   title: string;
   /**
    * Corpo da confirmacao. Aceita texto simples ou JSX (ex: destacar o alvo da
    * exclusao, listar detalhes do item) — por isso o wrapper e uma `div`, e nao
    * um `p`, que invalidaria conteudo de bloco aninhado.
    */
   description?: ReactNode;
   isLoading?: boolean;
   onClose: () => void;
   onConfirm: () => void;
   icon?: IconType;
   iconColor?: string;
   confirmButtonColor?: ButtonProps["color"];
   confirmButtonText?: string;
   cancelButtonText?: string;
}

export function ConfirmModal({
   show,
   title,
   description,
   isLoading = false,
   onClose,
   onConfirm,
   icon: Icon = FaTriangleExclamation,
   iconColor = "text-red-400 dark:text-red-300",
   confirmButtonColor = "red",
   confirmButtonText = "Confirmar",
   cancelButtonText = "Cancelar",
}: ConfirmModalProps) {
   const handleClose = () => {
      if (!isLoading) onClose();
   };

   return (
      <Modal show={show} onClose={handleClose} size="md" popup>
         {/*
          * O header (so o X, no modo `popup`) fica SEMPRE montado: escondido
          * durante o loading, o modal encolhia a altura dele e o conteudo
          * saltava. Em vez disso ele e neutralizado no lugar — `inert` o tira
          * do foco por teclado e do leitor de tela, e o `handleClose` do Modal
          * ja barra o fechamento enquanto carrega.
          */}
         <ModalHeader
            inert={isLoading}
            className={isLoading ? "opacity-50" : undefined}
         />
         <ModalBody>
            <div className="text-center">
               <Icon className={`mx-auto mb-4 h-14 w-14 ${iconColor}`} />
               <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  {title}
               </h3>
               {description && (
                  <div className="mb-5 text-sm text-gray-500 dark:text-gray-400">
                     {description}
                  </div>
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
                              color="primary"
                              className="mr-2"
                           />
                           Processando...
                        </>
                     ) : (
                        confirmButtonText
                     )}
                  </Button>
                  <Button
                     color="gray"
                     onClick={handleClose}
                     disabled={isLoading}
                  >
                     {cancelButtonText}
                  </Button>
               </div>
            </div>
         </ModalBody>
      </Modal>
   );
}
