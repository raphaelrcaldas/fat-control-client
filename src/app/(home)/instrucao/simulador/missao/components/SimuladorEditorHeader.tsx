"use client";

import type { RefObject } from "react";
import { Button, Spinner } from "flowbite-react";
import { HiArrowLeft, HiMenuAlt2, HiOutlineTrash } from "react-icons/hi";
import clsx from "clsx";
import { EDITOR_TOP_H } from "@/app/(home)/estatistica/etapas/missao/components/MissaoEditorLayout";

interface SimuladorEditorHeaderProps {
   title: string;
   subtitle: string;
   formId?: string;
   canDelete: boolean;
   canSave: boolean;
   isSaving: boolean;
   /** Por que "Salvar" esta bloqueado (ex.: sessao incompleta); uma linha. */
   blockedReason?: string | null;
   onSave?: () => void;
   /** Rotulo do botao primario; o padrao serve a edicao de sessao. */
   saveLabel?: string;
   onBack: () => void;
   /** Abre o drawer da lista de sessoes (criacao e edicao o passam). */
   onOpenSidebar?: () => void;
   /** Gatilho do drawer: recebe o foco de volta ao fechar. */
   sidebarTriggerRef?: RefObject<HTMLButtonElement | null>;
   sidebarOpen?: boolean;
   /** `id` do painel aberto pelo gatilho (`aria-controls`). */
   sidebarId?: string;
   onDelete?: () => void;
}

export function SimuladorEditorHeader({
   title,
   subtitle,
   formId,
   canDelete,
   canSave,
   isSaving,
   blockedReason,
   onSave,
   saveLabel = "Salvar sessão",
   onBack,
   onOpenSidebar,
   sidebarTriggerRef,
   sidebarOpen = false,
   sidebarId,
   onDelete,
}: SimuladorEditorHeaderProps) {
   const showBlockedReason = Boolean(blockedReason) && !canSave && !isSaving;
   return (
      <div
         className={clsx(
            "grid shrink-0 grid-cols-[auto_1fr_auto] items-center gap-2 border-b border-slate-200 bg-white px-3 py-2 sm:px-5 sm:py-3",
            EDITOR_TOP_H
         )}
      >
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
                  ref={sidebarTriggerRef}
                  type="button"
                  onClick={onOpenSidebar}
                  aria-label="Abrir painel de sessões"
                  aria-haspopup="dialog"
                  aria-expanded={sidebarOpen}
                  aria-controls={sidebarId}
                  className="focus-visible:outline-primary-500 grid size-9 place-items-center rounded text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 lg:hidden"
               >
                  <HiMenuAlt2 className="h-5 w-5" />
               </button>
            )}
         </div>

         <div className="min-w-0">
            <h1
               title={title}
               className="truncate text-lg font-semibold text-slate-900 sm:text-xl"
            >
               {title}
            </h1>
            <p
               title={subtitle}
               className="truncate text-xs text-slate-500 sm:text-sm"
            >
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
            {formId && (
               <Button
                  type={onSave ? "button" : "submit"}
                  onClick={onSave}
                  form={formId}
                  color="primary"
                  size="sm"
                  disabled={!canSave || isSaving}
                  aria-busy={isSaving}
               >
                  {isSaving ? (
                     <>
                        <Spinner size="sm" color="white" className="mr-2" />
                        Salvando...
                     </>
                  ) : (
                     saveLabel
                  )}
               </Button>
            )}
         </div>

         {showBlockedReason && (
            // Segunda linha, à direita e sob o botão: no celular não disputa
            // espaço com o título. Uma linha só, truncada, com o texto inteiro
            // no `title`.
            <p
               title={blockedReason!}
               className="col-span-3 truncate text-right text-xs font-medium text-amber-700 dark:text-amber-400"
            >
               {blockedReason}
            </p>
         )}
      </div>
   );
}
