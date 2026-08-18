"use client";

import { Button, Modal, ModalBody, ModalHeader } from "flowbite-react";

interface SairSemSalvarModalProps {
   /** Destino pendente; `null` mantém o modal fechado. */
   href: string | null;
   onClose: () => void;
   onConfirm: () => void;
}

/**
 * Guarda de saída do sandbox. Vale para TODA navegação para fora (voltar,
 * "Editar Teto", "Cadastrar teto") — o `beforeunload` da página só cobre
 * F5/fechar aba, e sair por um link levava o rascunho junto em silêncio.
 */
export function SairSemSalvarModal({
   href,
   onClose,
   onConfirm,
}: SairSemSalvarModalProps) {
   return (
      <Modal show={!!href} size="md" popup dismissible onClose={onClose}>
         <ModalHeader>Sair sem salvar?</ModalHeader>
         <ModalBody>
            <div className="px-2 pb-2 text-center">
               <p className="mb-6 text-sm text-slate-600">
                  A proposta tem alterações que ainda não foram salvas. Se sair
                  agora, elas serão perdidas.
               </p>
               <div className="flex justify-center gap-3">
                  <Button color="red" onClick={onConfirm}>
                     Sair sem salvar
                  </Button>
                  <Button color="light" onClick={onClose}>
                     Continuar editando
                  </Button>
               </div>
            </div>
         </ModalBody>
      </Modal>
   );
}
