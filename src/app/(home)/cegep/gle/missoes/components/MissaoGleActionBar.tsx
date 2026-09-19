import { Button, Spinner } from "flowbite-react";
import { HiCheck, HiTrash } from "react-icons/hi";

import { PermBased } from "@/app/(home)/hooks/usePermBased";

interface MissaoGleActionBarProps {
   isNew: boolean;
   isLoading: boolean;
   onSave: () => void;
   onDelete: () => void;
}

/**
 * Ações do editor de GLE, mantidas no cabeçalho.
 *
 * GLE não tem modo de visualização, edição separada ou clonagem: o editor é
 * sempre editável e oferece somente salvar e, quando aplicável, excluir.
 */
export function MissaoGleActionBar({
   isNew,
   isLoading,
   onSave,
   onDelete,
}: MissaoGleActionBarProps) {
   return (
      <>
         {/* Sem permissão, o controle some em vez de virar um botão desabilitado
             que sugere uma ação disponível e só falharia no backend. */}
         <PermBased
            resource="cegep.gle"
            requiredPerm={isNew ? "create" : "update"}
         >
            <Button
               color="primary"
               size="sm"
               onClick={onSave}
               disabled={isLoading}
               aria-label={isNew ? "Criar missão" : "Salvar missão"}
               className="disabled:cursor-not-allowed disabled:opacity-50"
            >
               {isLoading ? (
                  <Spinner size="sm" color="primary" className="sm:mr-2" />
               ) : (
                  <HiCheck className="size-4 sm:mr-2" />
               )}
               <span className="hidden sm:inline">
                  {isLoading
                     ? "Salvando..."
                     : isNew
                       ? "Criar missão"
                       : "Salvar"}
               </span>
            </Button>
         </PermBased>

         {!isNew && (
            <PermBased resource="cegep.gle" requiredPerm="delete">
               <Button
                  color="red"
                  outline
                  size="sm"
                  onClick={onDelete}
                  disabled={isLoading}
                  aria-label="Excluir missão"
                  className="disabled:cursor-not-allowed disabled:opacity-50"
               >
                  <HiTrash className="size-4 sm:mr-2" />
                  <span className="hidden sm:inline">Excluir</span>
               </Button>
            </PermBased>
         )}
      </>
   );
}
