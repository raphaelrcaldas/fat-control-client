import { Button, Spinner } from "flowbite-react";
import { FaRegClone } from "react-icons/fa";

interface MissionActionBarProps {
   editMode: boolean;
   isNew: boolean;
   isChanged: boolean;
   isLoading: boolean;
   onEdit: () => void;
   onCancelEdit: () => void;
   onSave: () => void;
   onClone?: () => void;
   onDelete: () => void;
}

export function MissionActionBar({
   editMode,
   isNew,
   isChanged,
   isLoading,
   onEdit,
   onCancelEdit,
   onSave,
   onClone,
   onDelete,
}: MissionActionBarProps) {
   return (
      <div className="rounded border border-slate-200 bg-white p-4 shadow-sm">
         <div className="flex w-full justify-center gap-3">
            {!editMode ? (
               <>
                  <Button
                     color="blue"
                     onClick={onEdit}
                     className="px-6 py-2.5 font-semibold"
                  >
                     Editar
                  </Button>
                  {onClone && (
                     <Button
                        color="gray"
                        onClick={onClone}
                        className="px-6 py-2.5 font-semibold"
                     >
                        <FaRegClone className="mr-2" />
                        Clonar
                     </Button>
                  )}
                  <Button
                     color="red"
                     onClick={onDelete}
                     className="px-6 py-2.5 font-semibold"
                  >
                     Deletar
                  </Button>
               </>
            ) : (
               <>
                  {!isNew && (
                     <Button
                        onClick={onCancelEdit}
                        color="alternative"
                        className="px-6 py-2.5 font-semibold"
                     >
                        Cancelar
                     </Button>
                  )}
                  <Button
                     onClick={onSave}
                     color="blue"
                     disabled={!isChanged || isLoading}
                     className="px-8 py-2.5 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                  >
                     {isLoading ? (
                        <div className="flex items-center gap-2">
                           <Spinner size="sm" color="failure" />
                           <span>Salvando...</span>
                        </div>
                     ) : isNew ? (
                        "Criar Missão"
                     ) : (
                        "Salvar Alterações"
                     )}
                  </Button>
               </>
            )}
         </div>
      </div>
   );
}
