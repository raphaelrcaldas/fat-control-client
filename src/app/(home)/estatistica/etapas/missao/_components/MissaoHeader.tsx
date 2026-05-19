"use client";

import type { ReactNode } from "react";
import { Button, Spinner } from "flowbite-react";
import { HiArrowLeft, HiReply, HiTrash } from "react-icons/hi";

type Props = {
   title: string;
   subtitleTags?: ReactNode;
   onBack?: () => void;
   onSave: () => void;
   onRevert?: () => void;
   onDeleteEtapa?: () => void;
   saveLabel?: string;
   isSaving?: boolean;
   dirty?: boolean;
};

export function MissaoHeader({
   title,
   subtitleTags,
   onBack,
   onSave,
   onRevert,
   onDeleteEtapa,
   saveLabel = "Salvar",
   isSaving = false,
   dirty = false,
}: Props) {
   return (
      <header className="flex w-full flex-col gap-3 border-b border-gray-200 bg-white px-6 py-4">
         <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
               {onBack && (
                  <button
                     type="button"
                     onClick={onBack}
                     aria-label="Voltar"
                     className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-red-500"
                  >
                     <HiArrowLeft className="h-5 w-5" />
                  </button>
               )}
               <div className="flex min-w-0 flex-col gap-2">
                  <h1 className="text-2xl font-semibold text-gray-900">
                     {title}
                  </h1>
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
               {dirty && (
                  <span className="hidden text-xs font-medium text-amber-600 sm:inline">
                     • Mudanças não salvas
                  </span>
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
                  color="red"
                  size="sm"
                  onClick={onSave}
                  disabled={isSaving}
               >
                  {isSaving ? (
                     <span className="flex items-center gap-2">
                        <Spinner size="sm" color="failure" />
                        Salvando...
                     </span>
                  ) : (
                     saveLabel
                  )}
               </Button>
            </div>
         </div>
      </header>
   );
}
