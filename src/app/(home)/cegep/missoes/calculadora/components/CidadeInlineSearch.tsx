"use client";

import clsx from "clsx";
import { Spinner, TextInput } from "flowbite-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaMapMarkerAlt } from "react-icons/fa";
import { IoMdSearch } from "react-icons/io";
import type { Cidade } from "services/routes/cities";
import {
   cidadePernoiteKeys,
   getCidadesPernoite,
} from "services/routes/cegep/missoes";
import {
   type RankedCidade,
   useCitySearch,
} from "@/components/location/useCitySearch";

interface CidadeInlineSearchProps {
   value: Cidade | undefined;
   onSelect: (cidade: Cidade) => void;
   className?: string;
}

/**
 * Combobox assíncrono de cidade, inline (sem modal) — reusa `useCitySearch`
 * com a fonte ranqueada de pernoites (`getCidadesPernoite`), igual ao
 * `SearchLocal` do formulário original, mas como dropdown ancorado ao input.
 *
 * O dropdown é renderizado em portal com posição `fixed` (mesmo padrão do
 * `SearchableSelect`): a tabela de pernoites vive dentro de um wrapper
 * `overflow-x-auto` que, por regra do CSS, também recorta o eixo Y — um
 * dropdown `absolute` seria cortado na última linha. O portal escapa desse
 * clipping. Fecha ao clicar fora (input + dropdown) ou no Escape; ao rolar a
 * página ou redimensionar a janela, a posição é recalculada em vez de
 * fechar. Navegável por teclado (setas, Home/End, Enter) com ARIA de
 * combobox completo (aria-activedescendant / aria-selected).
 */
export function CidadeInlineSearch({
   value,
   onSelect,
   className,
}: CidadeInlineSearchProps) {
   const [open, setOpen] = useState(false);
   const [term, setTerm] = useState("");
   const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
   const [activeIndex, setActiveIndex] = useState(0);
   const containerRef = useRef<HTMLDivElement>(null);
   const dropdownRef = useRef<HTMLDivElement>(null);
   const listboxId = useId();

   const { maisUsadas, demais, total, hasRanking, isFetching, canSearch } =
      useCitySearch(term, {
         fetcher: getCidadesPernoite,
         queryKey: cidadePernoiteKeys.search,
         allowEmpty: true,
         enabled: open,
      });

   // Lista achatada, na ordem visual (mais usadas primeiro, depois as
   // demais), usada para navegação por teclado e para o id ativo do ARIA.
   const flat: RankedCidade[] = [...maisUsadas, ...demais];
   const activeIndexSafe =
      flat.length > 0 ? Math.min(activeIndex, flat.length - 1) : -1;
   const activeId =
      activeIndexSafe >= 0
         ? `${listboxId}-${flat[activeIndexSafe].codigo}`
         : undefined;

   // Reseta o item ativo sempre que o termo muda ou o dropdown abre/fecha.
   useEffect(() => {
      setActiveIndex(0);
   }, [term, open]);

   // Mantém a opção ativa visível ao navegar por teclado (e no hover, sem
   // efeito perceptível já que o mouse já está sobre ela).
   useEffect(() => {
      if (!open || !activeId) return;
      document.getElementById(activeId)?.scrollIntoView({ block: "nearest" });
   }, [open, activeId]);

   // Recalcula a posição `fixed` a partir do input — usada tanto ao abrir
   // quanto para acompanhar scroll/resize enquanto o dropdown está aberto.
   const updatePos = useCallback(() => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
         setPos({
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width,
         });
      }
   }, []);

   // Fecha ao clicar fora (input ou dropdown) ou no Escape. Ao rolar a
   // página (scroll de qualquer container, exceto o próprio dropdown) ou
   // redimensionar a janela, apenas reposiciona — com throttle via rAF para
   // não recalcular a cada evento de scroll.
   useEffect(() => {
      if (!open) return;

      function onMouseDown(e: MouseEvent) {
         const target = e.target as Node;
         if (
            !containerRef.current?.contains(target) &&
            !dropdownRef.current?.contains(target)
         ) {
            setOpen(false);
         }
      }

      let rafId: number | null = null;
      function scheduleUpdatePos() {
         if (rafId !== null) cancelAnimationFrame(rafId);
         rafId = requestAnimationFrame(() => {
            rafId = null;
            updatePos();
         });
      }
      function onScroll(e: Event) {
         if (dropdownRef.current?.contains(e.target as Node)) return;
         scheduleUpdatePos();
      }

      document.addEventListener("mousedown", onMouseDown);
      window.addEventListener("scroll", onScroll, true);
      window.addEventListener("resize", scheduleUpdatePos);
      return () => {
         document.removeEventListener("mousedown", onMouseDown);
         window.removeEventListener("scroll", onScroll, true);
         window.removeEventListener("resize", scheduleUpdatePos);
         if (rafId !== null) cancelAnimationFrame(rafId);
      };
   }, [open, updatePos]);

   function openDropdown() {
      updatePos();
      setTerm("");
      setOpen(true);
   }

   function handleSelect(cidade: RankedCidade) {
      onSelect(cidade);
      setTerm("");
      setOpen(false);
   }

   function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      if (e.key === "Escape") {
         setOpen(false);
         e.currentTarget.blur();
         return;
      }

      if (!open) return;

      // Lista vazia: setas/Enter não fazem nada.
      switch (e.key) {
         case "ArrowDown":
            if (flat.length > 0) {
               e.preventDefault();
               setActiveIndex((i) => Math.min(i + 1, flat.length - 1));
            }
            break;
         case "ArrowUp":
            if (flat.length > 0) {
               e.preventDefault();
               setActiveIndex((i) => Math.max(i - 1, 0));
            }
            break;
         case "Home":
            if (flat.length > 0) {
               e.preventDefault();
               setActiveIndex(0);
            }
            break;
         case "End":
            if (flat.length > 0) {
               e.preventDefault();
               setActiveIndex(flat.length - 1);
            }
            break;
         case "Enter":
            if (activeIndexSafe >= 0) {
               e.preventDefault();
               handleSelect(flat[activeIndexSafe]);
            }
            break;
      }
   }

   const displayValue = open ? term : value ? `${value.nome}, ${value.uf}` : "";

   const dropdown = open && (
      <div
         ref={dropdownRef}
         id={listboxId}
         role="listbox"
         style={{ top: pos.top, left: pos.left, width: pos.width }}
         className={clsx(
            "fixed z-9999 max-h-64 min-w-56 overflow-y-auto rounded border border-slate-200 bg-white shadow-lg transition-opacity",
            isFetching && "opacity-50"
         )}
      >
         {total === 0 ? (
            <div className="flex items-center justify-center gap-2 px-3 py-4 text-sm text-slate-500">
               {isFetching ? (
                  <>
                     <Spinner size="sm" color="primary" />
                     Procurando...
                  </>
               ) : canSearch ? (
                  "Nenhuma cidade encontrada"
               ) : (
                  "Digite para buscar"
               )}
            </div>
         ) : (
            <div className="divide-y divide-slate-100">
               {hasRanking && (
                  <p className="bg-amber-100/60 px-3 py-1 text-[10px] font-bold tracking-wide text-amber-700 uppercase">
                     Mais usadas
                  </p>
               )}
               {maisUsadas.map((c) => (
                  <CidadeOption
                     key={c.codigo}
                     id={`${listboxId}-${c.codigo}`}
                     cidade={c}
                     isActive={c.codigo === flat[activeIndexSafe]?.codigo}
                     onSelect={() => handleSelect(c)}
                     onMouseEnter={() =>
                        setActiveIndex(
                           flat.findIndex((f) => f.codigo === c.codigo)
                        )
                     }
                  />
               ))}
               {hasRanking && demais.length > 0 && (
                  <p className="bg-slate-100 px-3 py-1 text-[10px] font-bold tracking-wide text-slate-500 uppercase">
                     Demais cidades
                  </p>
               )}
               {demais.map((c) => (
                  <CidadeOption
                     key={c.codigo}
                     id={`${listboxId}-${c.codigo}`}
                     cidade={c}
                     isActive={c.codigo === flat[activeIndexSafe]?.codigo}
                     onSelect={() => handleSelect(c)}
                     onMouseEnter={() =>
                        setActiveIndex(
                           flat.findIndex((f) => f.codigo === c.codigo)
                        )
                     }
                  />
               ))}
            </div>
         )}
      </div>
   );

   return (
      <div ref={containerRef} className={clsx("relative", className)}>
         <TextInput
            sizing="sm"
            icon={IoMdSearch}
            placeholder="Buscar cidade..."
            value={displayValue}
            onFocus={openDropdown}
            onChange={(e) => setTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-controls={listboxId}
            aria-activedescendant={open ? activeId : undefined}
         />

         {typeof document !== "undefined" &&
            dropdown &&
            createPortal(dropdown, document.body)}
      </div>
   );
}

function CidadeOption({
   id,
   cidade,
   isActive,
   onSelect,
   onMouseEnter,
}: {
   id: string;
   cidade: RankedCidade;
   isActive: boolean;
   onSelect: () => void;
   onMouseEnter: () => void;
}) {
   const destaque = cidade.mais_usada;

   return (
      <button
         id={id}
         type="button"
         role="option"
         aria-selected={isActive}
         onClick={onSelect}
         onMouseEnter={onMouseEnter}
         className={clsx(
            "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors pointer-coarse:min-h-[44px]",
            isActive
               ? "bg-slate-100"
               : destaque
                 ? "bg-amber-50 hover:bg-amber-100"
                 : "bg-white hover:bg-slate-50"
         )}
      >
         <FaMapMarkerAlt
            className={clsx(
               "size-3 shrink-0",
               destaque ? "text-amber-500" : "text-slate-400"
            )}
         />
         <span className="flex-1 truncate font-medium text-slate-800">
            {cidade.nome}
         </span>
         <span className="rounded bg-slate-200 px-1.5 py-0.5 text-xs font-medium text-slate-600">
            {cidade.uf}
         </span>
      </button>
   );
}
