"use client";

import {
   Modal,
   ModalHeader,
   ModalBody,
   Button,
   Spinner,
   type ButtonProps,
} from "flowbite-react";
import { useId, useRef, type ReactNode } from "react";
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
   // Foco inicial no Cancelar: Enter/Espaço logo após abrir não pode disparar
   // a ação destrutiva do botão de confirmar.
   const cancelRef = useRef<HTMLButtonElement>(null);
   const descId = useId();

   const handleClose = () => {
      if (!isLoading) onClose();
   };

   // O spinner casa com o botão: claro nos preenchidos, primário nos claros.
   const botaoClaro = ["light", "alternative", "gray"].includes(
      String(confirmButtonColor)
   );

   return (
      <Modal
         show={show}
         onClose={handleClose}
         size="md"
         popup
         dismissible={!isLoading}
         initialFocus={isLoading ? 0 : cancelRef}
         aria-describedby={description ? descId : undefined}
      >
         {/*
          * O header guarda o icone e o titulo visiveis. O Modal do Flowbite crava
          * `aria-labelledby` no id do titulo do header (o `h3`), entao esse e o
          * unico heading e o que da o nome acessivel ao dialogo. O icone fica
          * dentro do `h3` porque o `ModalHeader` so aceita `children` dentro do
          * elemento titulo; como e `aria-hidden`, nao entra no nome.
          *
          * `theme` faz merge (twMerge) com o do Flowbite e com o global; o merge
          * so acrescenta ou substitui classes em conflito, nunca remove. No
          * header, `popup` vira a coluna centralizada e o X sai do fluxo
          * (`absolute end-2 top-2`, ocupa de 7px a 35px do topo): `pt-10`
          * (35px) comeca o icone exatamente onde o X termina; o que os separa
          * e a posicao horizontal (X no canto `end-2`, icone centralizado), e o
          * X nao desloca o conteudo. O toque fora fecha no celular gracas ao
          * tema global (`modal.root`/`modal.content` em `context/theme.tsx`).
          *
          * `dismissible={!isLoading}`: Escape, clique fora e X fecham, exceto
          * enquanto processa — sem a prop o `useDismiss` fica desligado. Nada no
          * header muda com `isLoading`, entao a altura do modal nao salta.
          * Com loading ja na abertura, o Cancelar esta desabilitado e nao pode
          * receber foco: `initialFocus={0}` mantem o foco dentro do dialogo.
          */}
         <ModalHeader
            theme={{
               base: "relative",
               popup: "p-6 pt-10 pb-0",
               title: "mb-2 flex w-full flex-col items-center text-center text-lg font-semibold text-gray-900 dark:text-white",
               close: { base: "absolute end-2 top-2" },
            }}
         >
            <Icon
               aria-hidden="true"
               className={`mx-auto mb-4 h-14 w-14 ${iconColor}`}
            />
            {title}
         </ModalHeader>
         <ModalBody>
            <div className="text-center">
               {description && (
                  <div
                     id={descId}
                     className="mb-5 text-sm text-gray-500 dark:text-gray-400"
                  >
                     {description}
                  </div>
               )}
               <div className="flex justify-center gap-4">
                  <Button
                     color={confirmButtonColor}
                     onClick={onConfirm}
                     disabled={isLoading}
                     aria-busy={isLoading}
                     // Em voo o rótulo visível muda para "Processando…"; manter
                     // o aria-label antigo divergiria do texto na tela.
                     aria-label={isLoading ? undefined : confirmButtonText}
                  >
                     {isLoading ? (
                        <>
                           <Spinner
                              size="sm"
                              color={botaoClaro ? "primary" : "white"}
                              className="mr-2"
                           />
                           Processando…
                        </>
                     ) : (
                        confirmButtonText
                     )}
                  </Button>
                  <Button
                     ref={cancelRef}
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
