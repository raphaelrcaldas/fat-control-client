"use client";

import { useRef } from "react";
import { HiChevronDown, HiChevronLeft, HiChevronRight } from "react-icons/hi";
import clsx from "clsx";
import { useScrollAnchor } from "@/hooks/useScrollAnchor";

/**
 * Teto de opcoes no seletor de salto do modo compacto.
 *
 * Uma listagem de logs pode ter milhares de paginas, e materializar um
 * `<option>` para cada uma congelaria a barra. Passando disto o centro vira
 * texto puro — perde-se o salto, que no dedo e o gesto raro, e preserva-se o
 * avancar, que e o comum.
 */
const MAX_OPCOES_SALTO = 200;

interface PaginationProps {
   currentPage: number;
   totalPages: number;
   onPageChange: (page: number) => void;
}

export function Pagination({
   currentPage,
   totalPages,
   onPageChange,
}: PaginationProps) {
   const getPageNumbers = () => {
      const pages: (number | string)[] = [];
      const maxVisible = 5;

      if (totalPages <= maxVisible + 2) {
         for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else {
         pages.push(1);

         if (currentPage > 3) pages.push("...");

         const start = Math.max(2, currentPage - 1);
         const end = Math.min(totalPages - 1, currentPage + 1);

         for (let i = start; i <= end; i++) pages.push(i);

         if (currentPage < totalPages - 2) pages.push("...");

         pages.push(totalPages);
      }

      return pages;
   };

   const podeSaltar = totalPages <= MAX_OPCOES_SALTO;

   // Duas variantes, uma visivel por vez: `getClientRects()` vem vazio para a
   // que esta em `display:none`, e e assim que se sabe qual medir.
   const compactoRef = useRef<HTMLDivElement>(null);
   const numeradoRef = useRef<HTMLUListElement>(null);
   const visivel = () => {
      const compacto = compactoRef.current;
      if (compacto && compacto.getClientRects().length > 0) return compacto;
      const numerado = numeradoRef.current;
      if (numerado && numerado.getClientRects().length > 0) return numerado;
      return null;
   };

   const ancorar = useScrollAnchor(currentPage, visivel);

   /**
    * Marca onde o controle esta na tela ANTES de navegar, para ele continuar
    * ali depois. Ver `useScrollAnchor`: a ultima pagina costuma ser mais curta
    * e o navegador corta a rolagem sem avisar.
    */
   const irPara = (destino: number) => {
      if (destino === currentPage || destino < 1 || destino > totalPages) {
         return;
      }
      ancorar();
      onPageChange(destino);
   };

   const btnBase =
      "flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px]";
   const btnNav =
      "flex items-center justify-center h-full py-1.5 px-3 text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500 pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px]";
   // O 44px vai no BOTAO, nao so na pastilha: a borda de 1px do container fica
   // dentro do `min-h` dele, e o filho esticado herdava 42px — 2px abaixo da
   // regua de dedo, justamente no controle mais usado da barra no celular.
   const btnCompacto =
      "grid w-14 shrink-0 place-items-center border-slate-200 text-slate-600 transition-colors duration-150 active:bg-slate-100 disabled:text-slate-300 disabled:active:bg-transparent pointer-coarse:min-h-[44px]";
   const btnActive =
      "flex items-center justify-center text-sm z-10 py-2 px-3 leading-tight text-primary-600 bg-primary-50 border border-primary-300 hover:bg-primary-100 hover:text-primary-700 pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px]";

   return (
      <>
         {/*
            Ate `sm` o paginador numerado NAO CABE: sao ate 9 alvos de 44px
            (dois navegadores, dois extremos, tres vizinhos, duas reticencias)
            = 388px num viewport de 360. O excesso era recortado pelo
            container, e quem sumia era justamente o "Proximo" — a acao mais
            usada da barra ficava inalcancavel no celular.

            Aqui ele vira UM controle, e nao tres pecas soltas: uma pastilha
            com as duas zonas de toque nas BORDAS (onde o polegar chega) e o
            estado no meio. O centro e um `<select>` nativo transparente sobre
            o rotulo — no celular ele abre o seletor do proprio sistema, que e
            de longe o melhor jeito de pular 40 paginas com o dedo. Sem ele o
            modo compacto so andaria de um em um.

            `<select>` cru e nao o do Flowbite de proposito: aqui ele nao pode
            ter aparencia nenhuma, e so a superficie invisivel que captura o
            toque. Quem desenha o estado e o `<span>` embaixo.
         */}
         <div
            ref={compactoRef}
            className={clsx(
               "relative flex w-full items-stretch overflow-hidden rounded border border-slate-200 bg-white shadow-sm sm:hidden",
               "min-h-10 pointer-coarse:min-h-[44px]"
            )}
         >
            <button
               type="button"
               onClick={() => irPara(currentPage - 1)}
               disabled={currentPage === 1}
               className={btnCompacto + " border-r"}
            >
               <span className="sr-only">Página anterior</span>
               <HiChevronLeft className="h-5 w-5" />
            </button>

            {/* `has-[select:focus-visible]`: o <select> e invisivel por
                construcao, entao quem desenha o foco dele e este container.
                Sem isto o Tab pousa num controle sem nenhum indicador. */}
            <div className="focus-visible:outline-primary-600 relative min-w-0 flex-1 has-[select:focus-visible]:outline-2 has-[select:focus-visible]:-outline-offset-2 has-[select:focus-visible]:outline-current">
               <span
                  aria-hidden
                  className="flex h-full items-center justify-center gap-1 px-2 text-sm whitespace-nowrap text-slate-500"
               >
                  Página
                  <strong className="font-semibold text-slate-900 tabular-nums">
                     {currentPage}
                  </strong>
                  de
                  <strong className="font-semibold text-slate-900 tabular-nums">
                     {totalPages}
                  </strong>
                  {podeSaltar && (
                     <HiChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  )}
               </span>

               {/* Sem o <select>, o rotulo `aria-hidden` deixaria a pastilha
                   sem NENHUM portador acessivel da pagina atual — sobrariam
                   dois botoes e nenhuma nocao de onde se esta. */}
               {!podeSaltar && (
                  <span role="status" className="sr-only">
                     Página {currentPage} de {totalPages}
                  </span>
               )}

               {podeSaltar && (
                  <select
                     aria-label="Ir para a página"
                     value={currentPage}
                     onChange={(e) => irPara(Number(e.target.value))}
                     className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
                  >
                     {Array.from({ length: totalPages }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                           Página {i + 1} de {totalPages}
                        </option>
                     ))}
                  </select>
               )}
            </div>

            <button
               type="button"
               onClick={() => irPara(currentPage + 1)}
               disabled={currentPage === totalPages}
               className={btnCompacto + " border-l"}
            >
               <span className="sr-only">Próxima página</span>
               <HiChevronRight className="h-5 w-5" />
            </button>

            {/* Onde se esta no total, sem gastar linha de texto: o numero diz
                a pagina, o trilho diz o quanto falta. Na escala `primary-*`,
                tematizada por organizacao via `data-org-theme` — nunca uma cor
                cravada. */}
            <span
               aria-hidden
               className="absolute inset-x-0 bottom-0 h-0.5 bg-slate-100"
            >
               <span
                  className="bg-primary-500 block h-full transition-[width] duration-300 ease-out"
                  style={{ width: `${(currentPage / totalPages) * 100}%` }}
               />
            </span>
         </div>

         <ul
            ref={numeradoRef}
            className="hidden items-stretch -space-x-px sm:inline-flex"
         >
            {/* Anterior */}
            <li>
               <button
                  onClick={() => irPara(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`${btnNav} rounded-l`}
                  title="Página anterior"
               >
                  <span className="sr-only">Anterior</span>
                  <HiChevronLeft className="h-5 w-5" />
               </button>
            </li>

            {/* Números */}
            {getPageNumbers().map((page, idx) => (
               <li key={typeof page === "number" ? page : `ellipsis-${idx}`}>
                  {page === "..." ? (
                     <span className={btnBase}>...</span>
                  ) : (
                     <button
                        onClick={() => irPara(page as number)}
                        className={currentPage === page ? btnActive : btnBase}
                        aria-current={currentPage === page ? "page" : undefined}
                     >
                        {page}
                     </button>
                  )}
               </li>
            ))}

            {/* Próximo */}
            <li>
               <button
                  onClick={() => irPara(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`${btnNav} rounded-r`}
                  title="Próxima página"
               >
                  <span className="sr-only">Próximo</span>
                  <HiChevronRight className="h-5 w-5" />
               </button>
            </li>
         </ul>
      </>
   );
}
