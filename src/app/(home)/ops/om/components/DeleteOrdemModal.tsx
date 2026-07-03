"use client";

import { ConfirmModal } from "@/components/ConfirmModal";
import { formatDateForDisplay } from "utils/dateHandler";

interface DeleteOrdemModalProps {
   isOpen: boolean;
   ordemNumero: string;
   ordemUae: string;
   ordemDataSaida: string;
   ordemStatus?: string;
   onConfirm: () => void;
   onCancel: () => void;
   isDeleting?: boolean;
}

export function DeleteOrdemModal({
   isOpen,
   ordemNumero,
   ordemUae,
   ordemDataSaida,
   ordemStatus,
   onConfirm,
   onCancel,
   isDeleting = false,
}: DeleteOrdemModalProps) {
   const isDraft = ordemStatus === "rascunho";
   const modalTitle = isDraft ? "Excluir Rascunho" : "Excluir Ordem de Missão";
   const confirmText = isDraft ? "o rascunho" : "a ordem de missão";
   // Rascunho pode não ter data_saida: omite partes vazias em vez de
   // renderizar barras sobrando (ex: "AUTO/1GT/")
   const ordemIdentificacao = [
      ordemNumero,
      ordemUae,
      formatDateForDisplay(ordemDataSaida),
   ]
      .filter(Boolean)
      .join("/");

   return (
      <ConfirmModal
         show={isOpen}
         onClose={onCancel}
         onConfirm={onConfirm}
         title={modalTitle}
         confirmLabel="Sim, excluir"
         iconColor="text-red-400"
         isLoading={isDeleting}
         message={
            <>
               <p className="mb-3 text-sm text-gray-500">
                  Tem certeza que deseja excluir {confirmText}{" "}
                  <span className="font-mono text-xl font-bold text-gray-900 uppercase">
                     {ordemIdentificacao}
                  </span>
                  ?
               </p>
               <p className="text-sm text-red-400">
                  Esta ação não pode ser desfeita.
               </p>
            </>
         }
      />
   );
}
