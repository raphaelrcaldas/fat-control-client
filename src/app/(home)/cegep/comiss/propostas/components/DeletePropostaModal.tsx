"use client";

import { HiOutlineTrash } from "react-icons/hi";
import { ConfirmModal } from "@/components/ConfirmModal";
import type { PropostaListItem } from "services/routes/cegep/propostas";

interface DeletePropostaModalProps {
   /** Proposta em vias de exclusão; `null` mantém o modal fechado. */
   proposta: PropostaListItem | null;
   isDeleting: boolean;
   onClose: () => void;
   onConfirm: () => void;
}

/**
 * Confirmação de exclusão de proposta. Compõe o `ConfirmModal` vigente —
 * só monta a mensagem específica do domínio.
 */
export function DeletePropostaModal({
   proposta,
   isDeleting,
   onClose,
   onConfirm,
}: DeletePropostaModalProps) {
   return (
      <ConfirmModal
         show={!!proposta}
         onClose={onClose}
         onConfirm={onConfirm}
         title="Excluir proposta"
         icon={HiOutlineTrash}
         iconColor="text-red-500"
         confirmColor="red"
         confirmLabel="Sim, excluir"
         isLoading={isDeleting}
         message={
            <>
               <p>
                  A proposta{" "}
                  <span className="font-semibold text-slate-900">
                     {proposta?.nome}
                  </span>{" "}
                  e seus{" "}
                  <span className="font-semibold text-slate-900">
                     {proposta?.cenarios_count ?? 0}{" "}
                     {proposta?.cenarios_count === 1 ? "cenário" : "cenários"}
                  </span>{" "}
                  serão removidos.
               </p>
               <p className="mt-2 text-sm text-red-600">
                  Esta ação não pode ser desfeita.
               </p>
            </>
         }
      />
   );
}
