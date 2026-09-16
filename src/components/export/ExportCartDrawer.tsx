"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "flowbite-react";
import {
   HiDownload,
   HiOutlineClipboardList,
   HiOutlineInbox,
   HiX,
} from "react-icons/hi";
import clsx from "clsx";
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

   /** Confirmacao do "Limpar tudo" no ar — ver o 3o argumento do hook. */
   const [confirmando, setConfirmando] = useState(false);

   /** Para onde levar o foco depois que uma linha sai. */
   const focoAposRemocao = useRef<number | null>(null);

   /**
    * O painel sobrevive ao `show`: ele continua montado enquanto a animacao
    * de saida roda, senao a gaveta sumiria de um quadro para o outro. Quem
    * encerra a montagem e o `animationend` do proprio painel.
    */
   const [montado, setMontado] = useState(show);

   // `show`, e nao `show && montado`: o alvo de restauracao do foco tem que
   // ser capturado ANTES de a barra do carrinho receber `inert` — um render
   // depois o navegador ja jogou o foco no <body>. O `useDialogFocus` alcanca
   // o painel que monta atrasado por conta propria.
   const panelRef = useDialogFocus(show, onClose, confirmando);

   /**
    * Ids em processo de saida. E um conjunto, e nao um id so, porque nada
    * impede dois cliques rapidos em linhas diferentes — com um unico slot, a
    * primeira linha ficaria a meio caminho e nunca seria removida.
    */
   const [saindo, setSaindo] = useState<ReadonlySet<number>>(new Set());

   useEffect(() => {
      if (show) setMontado(true);
   }, [show]);

   // Foco inicial no painel. Mora aqui, e nao no `useDialogFocus`, porque so
   // este componente sabe em que render o `<aside>` entra na arvore — no
   // primeiro o `montado` ainda e false e o no nem existe.
   useEffect(() => {
      if (show && montado) panelRef.current?.focus();
   }, [show, montado, panelRef]);

   useEffect(() => {
      // 1) Poda os ids presos. A saida de `saindo` e o `animationend` do
      //    <li>, e o <li> pode desmontar antes de a animacao acabar — basta
      //    confirmar "Limpar tudo" durante os 160ms. O id ficaria preso para
      //    sempre e, ao ser re-adicionado ao carrinho, a linha nasceria em
      //    `animate-row-out` e se removeria sozinha, sem sinal nenhum.
      setSaindo((atual) => {
         if (atual.size === 0) return atual;
         const presentes = new Set(cart.items.map(getId));
         const podado = new Set([...atual].filter((id) => presentes.has(id)));
         return podado.size === atual.size ? atual : podado;
      });

      // 2) Devolve o foco depois de uma remocao. O botao acionado sai da
      //    arvore junto com a linha; sem isto o foco cai no <body> e o
      //    teclado recomeca do zero a cada item removido.
      const alvo = focoAposRemocao.current;
      if (alvo === null) return;
      focoAposRemocao.current = null;
      const botao = panelRef.current?.querySelector<HTMLElement>(
         `[data-remover="${alvo}"]`
      );
      (botao ?? panelRef.current)?.focus();
      // `cart.count` e o gatilho: muda exatamente quando uma linha entra ou
      // sai. `cart.items`/`getId` sao lidos do render corrente.
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [cart.count]);

   if (!target || !montado) return null;

   const fechando = !show;

   const pedirRemocao = (id: number) =>
      setSaindo((atual) => new Set(atual).add(id));

   const concluirRemocao = (id: number) => {
      // Vizinho de baixo, ou o de cima quando era o ultimo: e para onde o
      // foco vai depois que esta linha sumir.
      const ids = cart.items.map(getId);
      const posicao = ids.indexOf(id);
      focoAposRemocao.current = ids[posicao + 1] ?? ids[posicao - 1] ?? null;

      setSaindo((atual) => {
         const proximo = new Set(atual);
         proximo.delete(id);
         return proximo;
      });
      cart.remove(id);
   };

   return createPortal(
      <>
         {/* z-40: fica sob o navbar (fixed, z-50), que segue acessivel. */}
         <div
            className={clsx(
               "fixed inset-0 z-40 bg-black/50",
               fechando
                  ? "animate-veil-out pointer-events-none"
                  : "animate-veil-in"
            )}
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
            // `e.target === e.currentTarget`: as animacoes das linhas borbulham
            // ate aqui, e sem o teste a gaveta desmontaria no fim da primeira
            // delas — antes mesmo de terminar de entrar.
            onAnimationEnd={(e) => {
               if (e.target === e.currentTarget && fechando) setMontado(false);
            }}
            className={clsx(
               "fixed top-16 right-0 bottom-0 z-50 flex w-full max-w-sm flex-col border-l border-slate-200 bg-white shadow-xl outline-none",
               fechando ? "animate-drawer-out" : "animate-drawer-in"
            )}
         >
            <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
               <div className="flex min-w-0 items-center gap-2.5">
                  <span
                     aria-hidden
                     className="bg-primary-50 text-primary-600 ring-primary-100 grid size-9 shrink-0 place-items-center rounded-md ring-1 ring-inset"
                  >
                     <HiOutlineClipboardList className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                     <h2
                        id="export-cart-drawer-title"
                        className="truncate text-base leading-tight font-bold text-slate-900"
                     >
                        {title}
                     </h2>
                     <p role="status" className="text-xs text-slate-500">
                        <span className="font-semibold text-slate-700 tabular-nums">
                           {cart.count}
                        </span>{" "}
                        {cart.count === 1 ? "registro" : "registros"} no
                        carrinho
                     </p>
                  </div>
               </div>
               <button
                  type="button"
                  onClick={onClose}
                  aria-label="Fechar"
                  className="grid size-8 shrink-0 place-items-center rounded text-slate-500 transition-colors duration-150 hover:bg-slate-100"
               >
                  <HiX className="h-5 w-5" />
               </button>
            </header>

            <div className="scroll-rail min-h-0 flex-1 overflow-y-auto">
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
                     {cart.items.map((item, i) => {
                        const id = getId(item);
                        const { primary, secondary } = getLabel(item);
                        const removendo = saindo.has(id);
                        return (
                           <li
                              key={id}
                              // `--i` escalona a entrada: a lista se MONTA em
                              // vez de piscar pronta (teto de 5 passos no
                              // proprio utilitario).
                              style={{ "--i": i } as React.CSSProperties}
                              onAnimationEnd={(e) => {
                                 if (
                                    e.target === e.currentTarget &&
                                    removendo
                                 ) {
                                    concluirRemocao(id);
                                 }
                              }}
                              className={clsx(
                                 "group flex items-center gap-2 px-4 py-2 transition-colors duration-150",
                                 removendo
                                    ? "animate-row-out"
                                    : "animate-enter pointer-fine:hover:bg-slate-50"
                              )}
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
                                 data-remover={id}
                                 onClick={() => pedirRemocao(id)}
                                 disabled={removendo}
                                 aria-label={`Remover ${primary}`}
                                 // Discreto no repouso e forte no hover: numa
                                 // lista de 40, quarenta X vermelhos gritariam
                                 // mais que os nomes.
                                 className="grid size-7 shrink-0 place-items-center rounded text-slate-300 transition-colors duration-150 hover:bg-red-50 hover:text-red-600 pointer-coarse:text-slate-400 pointer-fine:group-hover:text-slate-500"
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
                  onOpenChange={setConfirmando}
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
