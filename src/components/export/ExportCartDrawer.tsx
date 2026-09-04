"use client";

import { createPortal } from "react-dom";
import { Button } from "flowbite-react";
import { HiDownload, HiOutlineInbox, HiX } from "react-icons/hi";
import type { ExportCart } from "./useExportCart";
import { ClearCartButton } from "./ClearCartButton";
import { useDialogFocus } from "./useDialogFocus";
import { usePortalTarget } from "./usePortalTarget";

interface ExportCartDrawerProps<T> {
   show: boolean;
   onClose: () => void;
   cart: ExportCart<T>;
   getId: (item: T) => number;
   /** Linha do item: identificacao em cima, detalhe do dominio embaixo. */
   getLabel: (item: T) => { primary: string; secondary?: string };
   onExport: () => void;
   title?: string;
   /** Substantivo do dominio, para a confirmacao nao dizer "itens". */
   noun?: { one: string; many: string };
}

/**
 * Gaveta de revisao do carrinho.
 *
 * E a peca que a metafora do carrinho traz e que a barra sozinha nao
 * resolve: quando a selecao atravessa varias paginas e trocas de filtro,
 * nao existe nenhuma tela onde o usuario veja tudo o que juntou. Aqui ele
 * confere e remove o engano cometido quatro paginas atras sem precisar
 * caca-lo de volta na tabela.
 */
export function ExportCartDrawer<T>({
   show,
   onClose,
   cart,
   getId,
   getLabel,
   onExport,
   title = "Selecionados",
   noun = { one: "selecionado", many: "selecionados" },
}: ExportCartDrawerProps<T>) {
   const target = usePortalTarget();
   const panelRef = useDialogFocus(show, onClose);

   if (!target || !show) return null;

   return createPortal(
      <>
         {/* z-40: fica sob o navbar (fixed, z-50), que segue acessivel. */}
         <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={onClose}
            aria-hidden
         />
         {/* top-16 = 56px do navbar (raiz do client e 87.5%, 1rem = 14px). */}
         <aside
            ref={panelRef as React.RefObject<HTMLElement>}
            role="dialog"
            aria-modal="true"
            aria-labelledby="export-cart-drawer-title"
            // `tabIndex={-1}` para o painel poder receber o foco inicial sem
            // entrar na ordem de tabulacao.
            tabIndex={-1}
            className="fixed top-16 right-0 bottom-0 z-50 flex w-full max-w-sm flex-col border-l border-slate-200 bg-white shadow-xl outline-none"
         >
            <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
               <div className="min-w-0">
                  <h2
                     id="export-cart-drawer-title"
                     className="truncate text-base font-bold text-slate-900"
                  >
                     {title}
                  </h2>
                  <p role="status" className="text-xs text-slate-500">
                     {cart.count} {cart.count === 1 ? "registro" : "registros"}{" "}
                     no carrinho
                  </p>
               </div>
               <button
                  type="button"
                  onClick={onClose}
                  aria-label="Fechar"
                  className="grid size-8 shrink-0 place-items-center rounded text-slate-500 transition-colors hover:bg-slate-100 pointer-coarse:size-[44px]"
               >
                  <HiX className="h-5 w-5" />
               </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto">
               {cart.isEmpty ? (
                  <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                     <HiOutlineInbox className="h-10 w-10 text-slate-300" />
                     <p className="text-sm font-medium text-slate-600">
                        Carrinho vazio
                     </p>
                     <p className="text-xs text-slate-500">
                        Marque as linhas na tabela. A seleção acompanha você
                        entre as páginas e os filtros.
                     </p>
                  </div>
               ) : (
                  <ul className="divide-y divide-slate-100">
                     {cart.items.map((item) => {
                        const { primary, secondary } = getLabel(item);
                        return (
                           <li
                              key={getId(item)}
                              className="flex items-center gap-2 px-4 py-2"
                           >
                              <div className="min-w-0 flex-1">
                                 <p className="truncate text-sm font-medium text-slate-800 uppercase">
                                    {primary}
                                 </p>
                                 {secondary && (
                                    <p className="truncate text-xs text-slate-500 uppercase">
                                       {secondary}
                                    </p>
                                 )}
                              </div>
                              <button
                                 type="button"
                                 onClick={() => cart.remove(getId(item))}
                                 aria-label={`Remover ${primary}`}
                                 className="grid size-7 shrink-0 place-items-center rounded text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 pointer-coarse:size-[44px]"
                              >
                                 <HiX className="h-4 w-4" />
                              </button>
                           </li>
                        );
                     })}
                  </ul>
               )}
            </div>

            <footer className="flex items-center justify-between gap-2 border-t border-slate-200 px-4 py-3">
               <ClearCartButton
                  count={cart.count}
                  onConfirm={cart.clear}
                  label="Limpar tudo"
                  noun={noun}
               />
               <Button
                  color="primary"
                  size="sm"
                  onClick={onExport}
                  disabled={cart.isEmpty}
               >
                  <HiDownload className="mr-1.5 h-4 w-4" />
                  Exportar
               </Button>
            </footer>
         </aside>
      </>,
      target
   );
}
