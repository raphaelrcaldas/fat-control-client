import { Button, Spinner } from "flowbite-react";
import { FaRegClone } from "react-icons/fa";
import { PermBased } from "@/app/(home)/hooks/usePermBased";

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
                  <PermBased resource="missoes_cegep" requiredPerm="create">
                     <Button
                        color="primary"
                        onClick={onEdit}
                        className="px-6 py-2.5 font-semibold"
                     >
                        Editar
                     </Button>
                  </PermBased>
                  {onClone && (
                     <PermBased resource="missoes_cegep" requiredPerm="create">
                        <Button
                           color="gray"
                           onClick={onClone}
                           className="px-6 py-2.5 font-semibold"
                        >
                           <FaRegClone className="mr-2" />
                           Clonar
                        </Button>
                     </PermBased>
                  )}
                  <PermBased resource="missoes_cegep" requiredPerm="delete">
                     <Button
                        color="red"
                        onClick={onDelete}
                        className="px-6 py-2.5 font-semibold"
                     >
                        Deletar
                     </Button>
                  </PermBased>
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
                  <PermBased resource="missoes_cegep" requiredPerm="create">
                     <Button
                        onClick={onSave}
                        color="primary"
                        disabled={!isChanged || isLoading}
                        className="px-8 py-2.5 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                     >
                        {isLoading ? (
                           <div className="flex items-center gap-2">
                              <Spinner size="sm" color="primary" />
                              <span>Salvando...</span>
                           </div>
                        ) : isNew ? (
                           "Criar Missão"
                        ) : (
                           "Salvar Alterações"
                        )}
                     </Button>
                  </PermBased>
               </>
            )}
         </div>
      </div>
   );
}
