"use client";

import type { ReactNode } from "react";
import clsx from "clsx";
import { Button, Dropdown, DropdownItem, Spinner } from "flowbite-react";
import {
   HiArrowLeft,
   HiCheck,
   HiDotsVertical,
   HiMenuAlt2,
   HiReply,
   HiTrash,
} from "react-icons/hi";

import { EDITOR_TOP_H } from "./MissaoEditorLayout";

type Props = {
   title: string;
   /** Contexto acima do título (ex.: "Missão 120"), no estilo eyebrow. */
   eyebrow?: string;
   /** Complemento discreto do título (ex.: "/05" = total de etapas). */
   titleSuffix?: string;
   /** Selo ao lado do título (status da etapa). */
   titleBadge?: ReactNode;
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
   eyebrow,
   titleSuffix,
   titleBadge,
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
   const temSecundarias = Boolean(onDeleteEtapa || (dirty && onRevert));

   return (
      // div, não <header>: banner duplicado com o navbar do shell reprova
      // landmark-unique no axe
      <div
         className={clsx(
            "relative flex w-full shrink-0 items-center border-b border-gray-200 bg-white px-3 py-2 sm:px-6 sm:py-3 lg:py-0",
            EDITOR_TOP_H
         )}
      >
         {/* Abaixo de lg a sidebar vira drawer e este passa a ser o canto
             superior esquerdo da página: a espinha do masthead vem para cá */}
         <span
            aria-hidden
            className="bg-primary-600 absolute top-0 left-0 h-full w-1 lg:hidden"
         />
         {/* Grid de 3 colunas em vez de flex-wrap: o título encolhe (truncate)
             para as ações caberem na MESMA linha, em vez de empurrá-las para
             uma faixa própria. Os metadados ocupam a largura toda no mobile e
             só se alinham sob o título a partir de sm, onde voltar e ações
             ocupam as duas linhas (row-span-2) e centram no bloco inteiro. */}
         <div className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-x-2 gap-y-1.5 sm:gap-x-3 sm:gap-y-2">
            <div className="flex items-center gap-1 empty:hidden sm:row-span-2">
               {onBack && (
                  <button
                     type="button"
                     onClick={onBack}
                     aria-label="Voltar"
                     className="focus-visible:outline-primary-500 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-2"
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
                     className="focus-visible:outline-primary-500 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-2 lg:hidden"
                  >
                     <HiMenuAlt2 className="h-5 w-5" />
                  </button>
               )}
            </div>

            <div className="min-w-0">
               {eyebrow && (
                  // no desktop a missão já está no masthead da sidebar, ao lado
                  <p className="text-primary-600 truncate font-mono text-[10px] font-bold tracking-[0.3em] uppercase lg:hidden">
                     {eyebrow}
                  </p>
               )}
               <div className="flex min-w-0 items-center gap-2">
                  <h1 className="truncate text-lg leading-tight font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                     {title}
                     {titleSuffix && (
                        // some no mobile: ali cada px do título conta
                        <span className="hidden font-medium text-gray-500 sm:inline">
                           {titleSuffix}
                        </span>
                     )}
                  </h1>
                  {titleBadge && <span className="shrink-0">{titleBadge}</span>}
                  {dirty && (
                     <>
                        {/* No mobile o pill "Não salvo" rouba a largura do título;
                         o mesmo sinal cabe num ponto, com o texto no title/SR */}
                        <span
                           role="status"
                           aria-label="Alterações não salvas"
                           title="Existem alterações que ainda não foram salvas"
                           className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-amber-500 sm:hidden"
                        />
                        <span
                           className="hidden shrink-0 items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200/80 sm:inline-flex"
                           title="Existem alterações que ainda não foram salvas"
                        >
                           <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                           Não salvo
                        </span>
                     </>
                  )}
               </div>
            </div>

            <div className="flex shrink-0 items-center gap-1 sm:row-span-2 sm:gap-2">
               {/* Abaixo de sm as ações secundárias vão para um kebab: em linha,
                   os três botões estouravam a largura de 360px e empurravam o
                   Salvar para 1px da borda */}
               {temSecundarias && (
                  <Dropdown
                     dismissOnClick
                     placement="bottom-end"
                     className="sm:hidden"
                     renderTrigger={() => (
                        <button
                           type="button"
                           aria-label="Mais ações da etapa"
                           disabled={isSaving}
                           className="focus-visible:outline-primary-500 flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-2 disabled:opacity-50 sm:hidden"
                        >
                           <HiDotsVertical className="h-5 w-5" />
                        </button>
                     )}
                  >
                     {onDeleteEtapa && (
                        <DropdownItem icon={HiTrash} onClick={onDeleteEtapa}>
                           Excluir etapa
                        </DropdownItem>
                     )}
                     {dirty && onRevert && (
                        <DropdownItem icon={HiReply} onClick={onRevert}>
                           Desfazer alterações
                        </DropdownItem>
                     )}
                  </Dropdown>
               )}
               {onDeleteEtapa && (
                  <Button
                     color="light"
                     size="sm"
                     onClick={onDeleteEtapa}
                     disabled={isSaving}
                     title="Excluir etapa"
                     className="hidden sm:flex"
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
                     className="hidden sm:flex"
                  >
                     <HiReply className="mr-2 h-4 w-4" />
                     Desfazer
                  </Button>
               )}
               {saveDisabled && !isSaving ? (
                  // Nada a salvar: estado, não botão desbotado. Mesma largura
                  // do Salvar para a troca não mexer nas vizinhas
                  <span
                     role="status"
                     title="Nenhuma alteração para salvar"
                     className="inline-flex w-24 items-center justify-center gap-1.5 text-sm font-medium text-gray-500 sm:w-32"
                  >
                     <HiCheck aria-hidden className="h-4 w-4 text-green-600" />
                     Salvo
                  </span>
               ) : (
                  <Button
                     color="primary"
                     size="sm"
                     className="w-24 sm:w-32"
                     onClick={onSave}
                     disabled={isSaving}
                     aria-busy={isSaving}
                     title="Salvar (Ctrl+S)"
                  >
                     {isSaving ? (
                        <span className="flex items-center gap-2">
                           <Spinner size="sm" color="white" />
                           Salvando...
                        </span>
                     ) : (
                        saveLabel
                     )}
                  </Button>
               )}
            </div>

            {subtitleTags && (
               <div className="col-span-3 flex flex-wrap items-center gap-2 sm:col-span-1 sm:col-start-2">
                  {subtitleTags}
               </div>
            )}
         </div>
      </div>
   );
}
