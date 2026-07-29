import { HiPencil, HiTrash } from "react-icons/hi";
import { SoldoPublic } from "services/routes/admin/soldos";
import { SystemAdminOnly } from "../../../hooks/useSystemAdmin";

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
            <SystemAdminOnly>
               <button
                  type="button"
                  onClick={() => onEdit(soldo)}
                  className="flex items-center gap-1 rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 pointer-coarse:min-h-[44px]"
               >
                  <HiPencil className="h-4 w-4" />
                  Editar
               </button>
               <button
                  type="button"
                  onClick={() => onDelete(soldo)}
                  className="flex items-center gap-1 rounded px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 pointer-coarse:min-h-[44px]"
               >
                  <HiTrash className="h-4 w-4" />
                  Excluir
               </button>
            </SystemAdminOnly>
         </div>
      );
   }

   return (
      <div className="flex justify-center gap-2">
         <SystemAdminOnly>
            <button
               type="button"
               onClick={() => onEdit(soldo)}
               className="inline-flex items-center justify-center rounded p-2 text-gray-600 transition-colors hover:bg-slate-100 hover:text-slate-700 pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px]"
               aria-label="Editar soldo"
               title="Editar"
            >
               <HiPencil className="h-5 w-5" />
            </button>
            <button
               type="button"
               onClick={() => onDelete(soldo)}
               className="inline-flex items-center justify-center rounded p-2 text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600 pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px]"
               aria-label="Excluir soldo"
               title="Excluir"
            >
               <HiTrash className="h-5 w-5" />
            </button>
         </SystemAdminOnly>
      </div>
   );
}
