import { HiPencil, HiTrash } from "react-icons/hi";
import { SoldoPublic } from "services/routes/cegep/soldos";

interface SoldoRowActionsProps {
   soldo: SoldoPublic;
   onEdit: (soldo: SoldoPublic) => void;
   onDelete: (soldo: SoldoPublic) => void;
   variant?: "icon" | "labeled";
}

/** Ações de editar/excluir de um soldo. `icon` (desktop) ou `labeled` (mobile). */
export default function SoldoRowActions({
   soldo,
   onEdit,
   onDelete,
   variant = "icon",
}: SoldoRowActionsProps) {
   if (variant === "labeled") {
      return (
         <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
            <button
               type="button"
               onClick={() => onEdit(soldo)}
               className="flex items-center gap-1 rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
            >
               <HiPencil className="h-4 w-4" />
               Editar
            </button>
            <button
               type="button"
               onClick={() => onDelete(soldo)}
               className="flex items-center gap-1 rounded px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
            >
               <HiTrash className="h-4 w-4" />
               Excluir
            </button>
         </div>
      );
   }

   return (
      <div className="flex justify-center gap-2">
         <button
            type="button"
            onClick={() => onEdit(soldo)}
            className="text-gray-600 hover:text-red-600"
            aria-label="Editar soldo"
            title="Editar"
         >
            <HiPencil className="h-5 w-5" />
         </button>
         <button
            type="button"
            onClick={() => onDelete(soldo)}
            className="text-gray-600 hover:text-red-600"
            aria-label="Excluir soldo"
            title="Excluir"
         >
            <HiTrash className="h-5 w-5" />
         </button>
      </div>
   );
}
