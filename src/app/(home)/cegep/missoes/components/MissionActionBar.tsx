import { Button, Spinner } from "flowbite-react";
import { FaRegClone } from "react-icons/fa";
import { HiCheck, HiPencilAlt, HiTrash, HiX } from "react-icons/hi";
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

/**
 * Ações da missão, dentro do MissionHeader.
 *
 * Sem moldura própria: o cabeçalho já é o cartão. No celular o rótulo some e
 * fica só o ícone (`hidden sm:inline`, com `aria-label` no botão para não
 * perder o nome acessível) — mesmo padrão do cabeçalho do comissionamento. É
 * o que mantém título e ações na MESMA linha a 360px: com os rótulos, ou o
 * grupo quebrava para baixo ou espremia o "OM 104" até sumir.
 */
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
      <>
         {!editMode ? (
            <>
               <PermBased resource="cegep.missoes" requiredPerm="create">
                  <Button
                     color="primary"
                     size="sm"
                     aria-label="Editar missão"
                     onClick={onEdit}
                  >
                     <HiPencilAlt className="size-4 sm:mr-2" />
                     <span className="hidden sm:inline">Editar</span>
                  </Button>
               </PermBased>
               {onClone && (
                  <PermBased resource="cegep.missoes" requiredPerm="create">
                     <Button
                        color="gray"
                        size="sm"
                        aria-label="Clonar missão"
                        onClick={onClone}
                     >
                        <FaRegClone className="size-4 sm:mr-2" />
                        <span className="hidden sm:inline">Clonar</span>
                     </Button>
                  </PermBased>
               )}
               <PermBased resource="cegep.missoes" requiredPerm="delete">
                  {/* `outline`: sólido, o Deletar ficava do mesmo vermelho do
                      Editar em organização de tema vermelho — a ação
                      destrutiva e a primária viravam o mesmo botão. */}
                  <Button
                     color="red"
                     outline
                     size="sm"
                     aria-label="Deletar missão"
                     onClick={onDelete}
                  >
                     <HiTrash className="size-4 sm:mr-2" />
                     <span className="hidden sm:inline">Deletar</span>
                  </Button>
               </PermBased>
            </>
         ) : (
            <>
               {!isNew && (
                  <Button
                     onClick={onCancelEdit}
                     color="alternative"
                     size="sm"
                     aria-label="Cancelar edição"
                  >
                     <HiX className="size-4 sm:mr-2" />
                     <span className="hidden sm:inline">Cancelar</span>
                  </Button>
               )}
               <PermBased resource="cegep.missoes" requiredPerm="create">
                  <Button
                     onClick={onSave}
                     color="primary"
                     size="sm"
                     aria-label={isNew ? "Criar missão" : "Salvar alterações"}
                     disabled={!isChanged || isLoading}
                     className="disabled:cursor-not-allowed disabled:opacity-50"
                  >
                     {isLoading ? (
                        <Spinner
                           size="sm"
                           color="primary"
                           className="sm:mr-2"
                        />
                     ) : (
                        <HiCheck className="size-4 sm:mr-2" />
                     )}
                     <span className="hidden sm:inline">
                        {isLoading
                           ? "Salvando..."
                           : isNew
                             ? "Criar Missão"
                             : "Salvar Alterações"}
                     </span>
                  </Button>
               </PermBased>
            </>
         )}
      </>
   );
}
