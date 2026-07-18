"use client";

import clsx from "clsx";
import { Spinner, TextInput } from "flowbite-react";
import { useEffect, useRef, useState } from "react";
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
 * clipping. Fecha ao clicar fora (input + dropdown), no Escape ou no scroll.
 */
export function CidadeInlineSearch({
   value,
   onSelect,
   className,
}: CidadeInlineSearchProps) {
   const [open, setOpen] = useState(false);
   const [term, setTerm] = useState("");
   const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
   const containerRef = useRef<HTMLDivElement>(null);
   const dropdownRef = useRef<HTMLDivElement>(null);

   const { maisUsadas, demais, total, hasRanking, isFetching, canSearch } =
      useCitySearch(term, {
         fetcher: getCidadesPernoite,
         queryKey: cidadePernoiteKeys.search,
         allowEmpty: true,
         enabled: open,
      });

   // Fecha ao clicar fora (input ou dropdown) e ao rolar a página, exceto
   // scroll dentro do próprio dropdown (lista de resultados).
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
      function onScroll(e: Event) {
         if (dropdownRef.current?.contains(e.target as Node)) return;
         setOpen(false);
      }

      document.addEventListener("mousedown", onMouseDown);
      document.addEventListener("scroll", onScroll, true);
      return () => {
         document.removeEventListener("mousedown", onMouseDown);
         document.removeEventListener("scroll", onScroll, true);
      };
   }, [open]);

   function openDropdown() {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
         setPos({
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width,
         });
      }
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
      }
   }

   const displayValue = open ? term : value ? `${value.nome}, ${value.uf}` : "";

   const dropdown = open && (
      <div
         ref={dropdownRef}
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
                     cidade={c}
                     onSelect={() => handleSelect(c)}
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
                     cidade={c}
                     onSelect={() => handleSelect(c)}
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
         />

         {typeof document !== "undefined" &&
            dropdown &&
            createPortal(dropdown, document.body)}
      </div>
   );
}

function CidadeOption({
   cidade,
   onSelect,
}: {
   cidade: RankedCidade;
   onSelect: () => void;
}) {
   const destaque = cidade.mais_usada;

   return (
      <button
         type="button"
         role="option"
         aria-selected={false}
         onClick={onSelect}
         className={clsx(
            "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors pointer-coarse:min-h-[44px]",
            destaque
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
