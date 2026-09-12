"use client";

import { Button, Spinner } from "flowbite-react";

interface IndispDeleteConfirmProps {
   isDeleting: boolean;
   onConfirm: () => void;
   onCancel: () => void;
}

export function IndispDeleteConfirm({
   isDeleting,
   onConfirm,
   onCancel,
}: IndispDeleteConfirmProps) {
   return (
      <>
         <span
            role="status"
            className="w-full text-sm font-medium text-slate-700"
         >
            {isDeleting ? "Excluindo..." : "Confirmar exclusão?"}
         </span>
         <Button
            color="red"
            size="md"
            onClick={onConfirm}
            disabled={isDeleting}
         >
            {isDeleting ? (
               <>
                  <Spinner size="sm" aria-hidden className="mr-2" />
                  Excluindo…
               </>
            ) : (
               "Excluir registro"
            )}
         </Button>
         <Button
            color="light"
            size="md"
            onClick={onCancel}
            disabled={isDeleting}
         >
            Cancelar
         </Button>
      </>
   );
}
