"use client";

import { Button } from "flowbite-react";
import { HiArrowLeft, HiMenuAlt2, HiOutlineTrash } from "react-icons/hi";

interface SimuladorEditorHeaderProps {
   title: string;
   subtitle: string;
   formId?: string;
   canDelete: boolean;
   canSave: boolean;
   isSaving: boolean;
   /** Sobe so a observacao quando nenhum campo da sessao mudou. */
   onSaveObsOnly?: () => void;
   /** Rotulo do botao primario; o padrao serve a edicao de sessao. */
   saveLabel?: string;
   onBack: () => void;
   /** Ausente na criacao: nao ha lista de sessoes para abrir no drawer. */
   onOpenSidebar?: () => void;
   onDelete?: () => void;
}

export function SimuladorEditorHeader({
   title,
   subtitle,
   formId,
   canDelete,
   canSave,
   isSaving,
   onSaveObsOnly,
   saveLabel = "Salvar sessão",
   onBack,
   onOpenSidebar,
   onDelete,
}: SimuladorEditorHeaderProps) {
   return (
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 border-b border-slate-200 bg-white px-3 py-2 sm:px-5 sm:py-3">
         <div className="flex items-center gap-1">
            <button
               type="button"
               onClick={onBack}
               aria-label="Voltar para o simulador"
               className="focus-visible:outline-primary-500 grid size-9 place-items-center rounded text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2"
            >
               <HiArrowLeft className="h-5 w-5" />
            </button>
            {onOpenSidebar && (
               <button
                  type="button"
                  onClick={onOpenSidebar}
                  aria-label="Abrir painel de sessões"
                  className="focus-visible:outline-primary-500 grid size-9 place-items-center rounded text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 lg:hidden"
               >
                  <HiMenuAlt2 className="h-5 w-5" />
               </button>
            )}
         </div>

         <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-slate-900 sm:text-xl">
               {title}
            </h1>
            <p className="truncate text-xs text-slate-500 sm:text-sm">
               {subtitle}
            </p>
         </div>

         <div className="flex shrink-0 items-center gap-2">
            {canDelete && onDelete && (
               <Button
                  color="light"
                  size="sm"
                  onClick={onDelete}
                  disabled={isSaving}
                  aria-label="Excluir sessão"
                  title="Excluir sessão"
               >
                  <HiOutlineTrash className="h-4 w-4 text-red-600 sm:mr-2" />
                  <span className="sr-only sm:not-sr-only">Excluir</span>
               </Button>
            )}
            {formId &&
               (onSaveObsOnly ? (
                  // So a observacao mudou: o submit do form esta bloqueado
                  // (`canSubmit` falso), entao ela sobe por um caminho proprio.
                  <Button
                     type="button"
                     color="primary"
                     size="sm"
                     onClick={onSaveObsOnly}
                     disabled={isSaving}
                  >
                     {isSaving ? "Salvando..." : "Salvar observação"}
                  </Button>
               ) : (
                  <Button
                     type="submit"
                     form={formId}
                     color="primary"
                     size="sm"
                     disabled={!canSave || isSaving}
                  >
                     {isSaving ? "Salvando..." : saveLabel}
                  </Button>
               ))}
         </div>
      </div>
   );
}
