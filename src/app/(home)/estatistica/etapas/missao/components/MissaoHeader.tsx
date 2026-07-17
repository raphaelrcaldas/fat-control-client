"use client";

import type { ReactNode } from "react";
import { Button, Spinner } from "flowbite-react";
import { HiArrowLeft, HiMenuAlt2, HiReply, HiTrash } from "react-icons/hi";

type Props = {
   title: string;
   subtitleTags?: ReactNode;
   onBack?: () => void;
   onSave: () => void;
   onRevert?: () => void;
   onDeleteEtapa?: () => void;
   // Abre a sidebar de etapas em drawer nas telas < lg
   onOpenSidebar?: () => void;
   saveLabel?: string;
   isSaving?: boolean;
   dirty?: boolean;
   saveDisabled?: boolean;
};

export function MissaoHeader({
   title,
   subtitleTags,
   onBack,
   onSave,
   onRevert,
   onDeleteEtapa,
   onOpenSidebar,
   saveLabel = "Salvar",
   isSaving = false,
   dirty = false,
   saveDisabled = false,
}: Props) {
   return (
      // div, não <header>: banner duplicado com o navbar do shell reprova
      // landmark-unique no axe
      <div className="flex w-full flex-col gap-3 border-b border-gray-200 bg-white px-6 py-4">
         <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
               {onBack && (
                  <button
                     type="button"
                     onClick={onBack}
                     aria-label="Voltar"
                     className="focus-visible:outline-primary-500 mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-2 pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px]"
                  >
                     <HiArrowLeft className="h-5 w-5" />
                  </button>
               )}
               {onOpenSidebar && (
                  <button
                     type="button"
                     onClick={onOpenSidebar}
                     aria-label="Abrir painel de etapas"
                     title="Etapas da missão"
                     className="focus-visible:outline-primary-500 mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-2 lg:hidden pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px]"
                  >
                     <HiMenuAlt2 className="h-5 w-5" />
                  </button>
               )}
               <div className="flex min-w-0 flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                     <h1 className="text-2xl font-semibold text-gray-900">
                        {title}
                     </h1>
                     {dirty && (
                        <span
                           className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200/80"
                           title="Existem alterações que ainda não foram salvas"
                        >
                           <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                           Não salvo
                        </span>
                     )}
                  </div>
                  {subtitleTags && (
                     <div className="flex flex-wrap items-center gap-2">
                        {subtitleTags}
                     </div>
                  )}
               </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
               {onDeleteEtapa && (
                  <Button
                     color="light"
                     size="sm"
                     onClick={onDeleteEtapa}
                     disabled={isSaving}
                     title="Excluir etapa"
                  >
                     <HiTrash className="mr-2 h-4 w-4 text-red-600" />
                     Excluir etapa
                  </Button>
               )}
               {dirty && onRevert && (
                  <Button
                     color="light"
                     size="sm"
                     onClick={onRevert}
                     disabled={isSaving}
                     title="Desfazer todas as alterações desde a última carga"
                  >
                     <HiReply className="mr-2 h-4 w-4" />
                     Desfazer
                  </Button>
               )}
               <Button
                  color="primary"
                  size="sm"
                  className="w-32"
                  onClick={onSave}
                  disabled={isSaving || saveDisabled}
                  title={
                     saveDisabled
                        ? "Nenhuma alteração para salvar"
                        : "Salvar (Ctrl+S)"
                  }
               >
                  {isSaving ? (
                     <span className="flex items-center gap-2">
                        <Spinner size="sm" color="primary" />
                        Salvando...
                     </span>
                  ) : (
                     saveLabel
                  )}
               </Button>
            </div>
         </div>
      </div>
   );
}
