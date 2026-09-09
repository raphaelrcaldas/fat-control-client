"use client";

import { HiArrowLeft } from "react-icons/hi";

interface ComissDetailHeaderProps {
   title: string;
   onClose: () => void;
   /** Comandos à direita (exportar/editar/excluir ou salvar/cancelar). */
   actions?: React.ReactNode;
}

/**
 * Barra de comando superior do detalhe de comissionamento (padrão `ops/om`):
 * voltar + título à esquerda, ações à direita. A identidade do militar fica em
 * um componente independente abaixo desta barra.
 */
export function ComissDetailHeader({
   title,
   onClose,
   actions,
}: ComissDetailHeaderProps) {
   return (
      <header className="flex items-center justify-between gap-3 rounded border border-slate-200 bg-white px-3 py-2.5 shadow-sm sm:px-4">
         <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <button
               onClick={onClose}
               title="Voltar"
               /* `h-9` são 31,5px, não 36: a raiz do client é 87,5%
                  (1rem = 14px). O reforço é em px cravado e só no ponteiro
                  grosso — no mouse os 31,5px já passam dos 24px exigidos. */
               className="flex h-9 w-9 shrink-0 items-center justify-center rounded text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 pointer-coarse:h-[44px] pointer-coarse:w-[44px]"
            >
               <HiArrowLeft size={20} />
            </button>
            <h1 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
               {title}
            </h1>
         </div>
         {actions && (
            <div className="ml-auto flex shrink-0 items-center gap-2">
               {actions}
            </div>
         )}
      </header>
   );
}
