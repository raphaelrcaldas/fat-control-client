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
         <span className="text-sm font-medium text-gray-700">
            {isDeleting ? "Excluindo..." : "Confirmar exclusão?"}
         </span>
         <Button
            color="red"
            size="md"
            onClick={onConfirm}
            disabled={isDeleting}
         >
            {isDeleting ? <Spinner color="primary" size="sm" /> : "Sim"}
         </Button>
         <Button
            color="gray"
            size="md"
            onClick={onCancel}
            disabled={isDeleting}
         >
            Não
         </Button>
      </>
   );
}
