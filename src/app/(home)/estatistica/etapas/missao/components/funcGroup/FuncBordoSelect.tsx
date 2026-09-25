import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { HiChevronDown } from "react-icons/hi2";
import type { FuncaoPosicao } from "services/routes/funcs";

import { usePortalDropdown } from "../../hooks/usePortalDropdown";

// Portal e nao o Dropdown do Flowbite: o card da secao tem overflow-hidden e
// o Dropdown posiciona `absolute` no fluxo, entao a lista sairia cortada.
// O teclado e o ARIA que o Dropdown daria de graca ficam aqui.
export function FuncBordoSelect({
   label,
   value,
   options,
   onChange,
}: {
   /** Nome acessivel do botao (ex.: "Posição a bordo de SILVA"). */
   label: string;
   value: string;
   options: FuncaoPosicao[];
   onChange: (codigo: string) => void;
}) {
   const [open, setOpen] = useState(false);
   const [activeIndex, setActiveIndex] = useState(0);
   const buttonRef = useRef<HTMLButtonElement>(null);
   const dropdownRef = useRef<HTMLUListElement>(null);
   const listboxId = useId();

   const close = useCallback((returnFocus: boolean) => {
      setOpen(false);
      if (returnFocus) buttonRef.current?.focus();
   }, []);
   const pos = usePortalDropdown({
      open,
      anchorRef: buttonRef,
      dropdownRef,
      compute: (rect) => ({
         top: rect.bottom + 2,
         right: window.innerWidth - rect.right,
      }),
      scrollResize: "close",
      closeOnOutside: true,
      onRequestClose: () => close(false),
   });

   // Ao abrir, o foco vai para a opcao marcada: a lista mora no fim do
   // <body> (portal), e sem isso o Tab nunca chegaria nela
   useEffect(() => {
      if (!open || !pos) return;
      dropdownRef.current
         ?.querySelector<HTMLButtonElement>(`[data-index="${activeIndex}"]`)
         // preventScroll: o dropdown fecha em qualquer scroll (scrollResize)
         ?.focus({ preventScroll: true });
   }, [open, pos, activeIndex]);

   const openList = () => {
      const selected = options.findIndex((p) => p.cod === value);
      setActiveIndex(selected >= 0 ? selected : 0);
      setOpen(true);
   };

   const select = (codigo: string) => {
      onChange(codigo);
      close(true);
   };

   const handleListKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
         e.preventDefault();
         setActiveIndex((i) => (i + 1) % options.length);
      } else if (e.key === "ArrowUp") {
         e.preventDefault();
         setActiveIndex((i) => (i - 1 + options.length) % options.length);
      } else if (e.key === "Home") {
         e.preventDefault();
         setActiveIndex(0);
      } else if (e.key === "End") {
         e.preventDefault();
         setActiveIndex(options.length - 1);
      } else if (e.key === "Escape") {
         e.preventDefault();
         close(true);
      } else if (e.key === "Tab") {
         // Tab sai da lista de volta ao fluxo normal a partir do botao
         e.preventDefault();
         close(true);
      }
   };

   return (
      <div className="relative shrink-0">
         <button
            ref={buttonRef}
            type="button"
            aria-label={`${label}: ${value}`}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={open ? listboxId : undefined}
            onClick={() => (open ? close(false) : openList())}
            onKeyDown={(e) => {
               if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                  e.preventDefault();
                  openList();
               }
            }}
            className="focus:border-primary-400 focus:ring-primary-400 flex min-h-7 w-11 items-center justify-between border border-gray-300 bg-gray-50 px-1 py-0.5 text-[10px] font-bold text-gray-700 focus:ring-1 focus:outline-none"
         >
            <span>{value}</span>
            <HiChevronDown className="h-2.5 w-2.5 text-gray-400" />
         </button>
         {open &&
            pos &&
            createPortal(
               <ul
                  ref={dropdownRef}
                  id={listboxId}
                  role="listbox"
                  aria-label={label}
                  onKeyDown={handleListKeyDown}
                  style={{
                     position: "fixed",
                     top: pos.top,
                     right: pos.right,
                  }}
                  className="z-50 min-w-12 overflow-hidden rounded border border-gray-200 bg-white shadow-lg"
               >
                  {options.map((p, index) => {
                     const selected = p.cod === value;
                     return (
                        <li key={p.cod}>
                           <button
                              type="button"
                              role="option"
                              aria-selected={selected}
                              data-index={index}
                              tabIndex={index === activeIndex ? 0 : -1}
                              onClick={() => select(p.cod)}
                              onMouseEnter={() => setActiveIndex(index)}
                              title={p.nome}
                              className={clsx(
                                 "block w-full px-2 py-1 text-left text-[10px] font-bold uppercase focus:outline-none",
                                 selected
                                    ? "bg-primary-50 text-primary-700"
                                    : "text-gray-700 hover:bg-gray-100",
                                 index === activeIndex &&
                                    !selected &&
                                    "bg-gray-100"
                              )}
                           >
                              {p.cod}
                           </button>
                        </li>
                     );
                  })}
               </ul>,
               document.body
            )}
      </div>
   );
}
