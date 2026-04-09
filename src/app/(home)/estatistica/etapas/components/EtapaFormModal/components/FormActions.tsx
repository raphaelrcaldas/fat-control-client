import { Button, Spinner } from "flowbite-react";
import { HiTrash } from "react-icons/hi";

interface FormActionsProps {
   onClose: () => void;
   isSubmitting: boolean;
   isEdit: boolean;
   disabled: boolean;
   onSubmit?: (e?: any) => void;
   onDelete?: () => void;
   isDeleting?: boolean;
   confirmDelete?: boolean;
}

export function FormActions({
   onClose,
   isSubmitting,
   isEdit,
   disabled,
   onSubmit,
   onDelete,
   isDeleting,
   confirmDelete,
}: FormActionsProps) {
   const busy = isSubmitting || !!isDeleting;

   return (
      <div className="flex w-full items-center justify-between">
         {isEdit && onDelete && (
            <Button
               color="red"
               outline={!confirmDelete}
               onClick={onDelete}
               disabled={busy}
            >
               {isDeleting ? (
                  <div className="flex items-center gap-2">
                     <Spinner size="sm" color="failure" />
                     <span>Excluindo...</span>
                  </div>
               ) : confirmDelete ? (
                  <div className="flex items-center gap-2">
                     <HiTrash className="h-4 w-4" />
                     <span>Confirmar exclusão</span>
                  </div>
               ) : (
                  <div className="flex items-center gap-2">
                     <HiTrash className="h-4 w-4" />
                     <span>Excluir</span>
                  </div>
               )}
            </Button>
         )}
         <div className="ml-auto flex gap-3">
            <Button color="gray" onClick={onClose} disabled={busy}>
               Cancelar
            </Button>
            <Button
               type="button"
               color="red"
               onClick={onSubmit}
               disabled={disabled || busy}
            >
               {isSubmitting ? (
                  <div className="flex items-center gap-2">
                     <Spinner size="sm" color="failure" />
                     <span>Salvando...</span>
                  </div>
               ) : isEdit ? (
                  "Salvar Alterações"
               ) : (
                  "Criar Etapa"
               )}
            </Button>
         </div>
      </div>
   );
}
