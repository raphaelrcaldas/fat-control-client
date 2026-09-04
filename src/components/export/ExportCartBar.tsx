"use client";

import { createPortal } from "react-dom";
import { Button } from "flowbite-react";
import clsx from "clsx";
import { HiDownload, HiOutlineViewList } from "react-icons/hi";
import type { ExportCart } from "./useExportCart";
import { ClearCartButton } from "./ClearCartButton";
import { usePortalTarget } from "./usePortalTarget";

const MAX_CHIPS = 3;

interface ExportCartBarProps<T> {
   cart: ExportCart<T>;
   /** Rotulo curto do item no chip, ex.: "1S SILVA". */
   getLabel: (item: T) => string;
   getId: (item: T) => number;
   onReview: () => void;
   onExport: () => void;
   /** Substantivo do dominio, para o contador nao dizer "itens". */
   noun?: { one: string; many: string };
   /**
    * Some enquanto a gaveta ou o modal estao abertos. Os dois ja trazem as
    * proprias acoes, e a barra ficaria sob o overlay — escurecida e
    * parcialmente encoberta, parecendo defeito.
    */
   hidden?: boolean;
}

/**
 * Barra contextual do carrinho de exportacao.
 *
 * Nasce no primeiro item selecionado e acompanha a rolagem. E o que sustenta
 * a confianca na selecao que atravessa paginas: sem um contador sempre
 * visivel, o usuario nao sabe se ainda tem 40 itens ou se perdeu tudo ao
 * trocar de pagina.
 */
export function ExportCartBar<T>({
   cart,
   getLabel,
   getId,
   onReview,
   onExport,
   noun = { one: "selecionado", many: "selecionados" },
   hidden = false,
}: ExportCartBarProps<T>) {
   const target = usePortalTarget();

   if (!target || cart.isEmpty) return null;

   const chips = cart.items.slice(0, MAX_CHIPS);
   const overflow = cart.count - chips.length;

   return createPortal(
      // Sem `-translate-x-1/2` para centralizar: translate no proprio no
      // criaria bloco conteiner para qualquer fixed descendente.
      //
      // Escondida, a barra continua MONTADA (opacidade + `inert`, nunca
      // `return null`): quem abriu a gaveta clicou num botao daqui, e
      // desmontar a barra apaga justamente o elemento para onde o foco tem
      // que voltar quando ela fecha — o foco cairia no `<body>`.
      <div
         inert={hidden}
         className={clsx(
            "pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-3 transition-opacity",
            hidden && "opacity-0"
         )}
      >
         <div className="pointer-events-auto flex w-full max-w-3xl flex-wrap items-center gap-x-4 gap-y-2 rounded border border-slate-200 bg-white px-4 py-3 shadow-lg">
            <div className="flex min-w-0 flex-1 items-center gap-3">
               {/* role=status: a mudanca do contador precisa ser anunciada a
                   quem usa leitor de tela, nao so vista. */}
               <p
                  role="status"
                  className="shrink-0 text-sm font-semibold text-slate-900"
               >
                  <span className="text-primary-600 text-lg">{cart.count}</span>{" "}
                  {cart.count === 1 ? noun.one : noun.many}
               </p>

               <ul className="hidden min-w-0 flex-wrap items-center gap-1 sm:flex">
                  {chips.map((item) => (
                     <li
                        key={getId(item)}
                        className="max-w-40 truncate rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600 uppercase"
                     >
                        {getLabel(item)}
                     </li>
                  ))}
                  {overflow > 0 && (
                     <li className="text-xs font-medium text-slate-500">
                        +{overflow}
                     </li>
                  )}
               </ul>
            </div>

            <div className="flex shrink-0 items-center gap-2">
               <ClearCartButton
                  count={cart.count}
                  onConfirm={cart.clear}
                  label="Limpar"
                  noun={noun}
                  withIcon
               />
               <Button color="light" size="sm" onClick={onReview}>
                  <HiOutlineViewList className="mr-1.5 h-4 w-4" />
                  Revisar
               </Button>
               <Button color="primary" size="sm" onClick={onExport}>
                  <HiDownload className="mr-1.5 h-4 w-4" />
                  Exportar
               </Button>
            </div>
         </div>
      </div>,
      target
   );
}
