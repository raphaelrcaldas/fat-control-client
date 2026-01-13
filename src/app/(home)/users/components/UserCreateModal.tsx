"use client";

/**
 * Modal simplificado para criação de novo usuário
 */

import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import { UserForm } from "./UserForm";

// ========================================
// Tipos
// ========================================

interface UserCreateModalProps {
   show: boolean;
   setShow: (v: boolean) => void;
}

// ========================================
// Componente Principal
// ========================================

export function UserCreateModal({ show, setShow }: UserCreateModalProps) {
   const handleClose = () => {
      setShow(false);
   };

   return (
      <Modal show={show} size="4xl" onClose={handleClose} dismissible>
         <ModalHeader>Cadastrar novo usuário</ModalHeader>
         <ModalBody>
            <UserForm userId={null} onSuccess={handleClose} />
         </ModalBody>
      </Modal>
   );
}
