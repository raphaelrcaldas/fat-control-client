"use client";

import type { ReactNode } from "react";
import { Button, Dropdown, DropdownItem, Spinner } from "flowbite-react";
import {
   HiArrowLeft,
   HiDotsVertical,
   HiMenuAlt2,
   HiReply,
   HiTrash,
} from "react-icons/hi";

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
   const temSecundarias = Boolean(onDeleteEtapa || (dirty && onRevert));

   return (
      // div, não <header>: banner duplicado com o navbar do shell reprova
      // landmark-unique no axe
      <div className="w-full border-b border-gray-200 bg-white px-3 py-2 sm:px-6 sm:py-4">
         {/* Grid de 3 colunas em vez de flex-wrap: o título encolhe (truncate)
             para as ações caberem na MESMA linha, em vez de empurrá-las para
             uma faixa própria. Os metadados ocupam a largura toda no mobile e
             só se alinham sob o título a partir de sm. */}
         <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-2 gap-y-1.5 sm:gap-x-3 sm:gap-y-2">
            <div className="flex items-center gap-1 empty:hidden">
               {onBack && (
                  <button
                     type="button"
                     onClick={onBack}
                     aria-label="Voltar"
                     className="focus-visible:outline-primary-500 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-2 pointer-coarse:min-h-11 pointer-coarse:min-w-11"
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
                     className="focus-visible:outline-primary-500 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-2 lg:hidden pointer-coarse:min-h-11 pointer-coarse:min-w-11"
                  >
                     <HiMenuAlt2 className="h-5 w-5" />
                  </button>
               )}
            </div>

            <div className="flex min-w-0 items-center gap-2">
               <h1 className="truncate text-lg font-semibold text-gray-900 sm:text-2xl">
                  {title}
               </h1>
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

            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
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
                           className="focus-visible:outline-primary-500 flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-2 disabled:opacity-50 sm:hidden pointer-coarse:min-h-11 pointer-coarse:min-w-11"
                        >
                           <HiDotsVertical className="h-5 w-5" />
                        </button>
                     )}
                  >
                     {onDeleteEtapa && (
                        <DropdownItem
                           icon={HiTrash}
                           onClick={onDeleteEtapa}
                           className="pointer-coarse:min-h-11"
                        >
                           Excluir etapa
                        </DropdownItem>
                     )}
                     {dirty && onRevert && (
                        <DropdownItem
                           icon={HiReply}
                           onClick={onRevert}
                           className="pointer-coarse:min-h-11"
                        >
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
               <Button
                  color="primary"
                  size="sm"
                  className="w-24 sm:w-32"
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

            {subtitleTags && (
               <div className="col-span-3 flex flex-wrap items-center gap-2 sm:col-span-2 sm:col-start-2">
                  {subtitleTags}
               </div>
            )}
         </div>
      </div>
   );
}
