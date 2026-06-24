import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { HiChevronDown } from "react-icons/hi2";
import type { PosicaoABordo } from "@/constants/tripulantes/funcoes";

import { usePortalDropdown } from "../../hooks/usePortalDropdown";

export function FuncBordoSelect({
   value,
   options,
   onChange,
}: {
   value: string;
   options: PosicaoABordo[];
   onChange: (codigo: string) => void;
}) {
   const [open, setOpen] = useState(false);
   const buttonRef = useRef<HTMLButtonElement>(null);
   const dropdownRef = useRef<HTMLUListElement>(null);

   const close = useCallback(() => setOpen(false), []);
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
      closeOnEscape: true,
      onRequestClose: close,
   });

   return (
      <div className="relative shrink-0">
         <button
            ref={buttonRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex w-12 items-center justify-between border border-gray-300 bg-gray-50 px-1 py-0.5 text-[10px] font-bold text-gray-700 focus:border-red-400 focus:ring-1 focus:ring-red-400 focus:outline-none"
         >
            <span>{value}</span>
            <HiChevronDown className="h-2.5 w-2.5 text-gray-400" />
         </button>
         {open &&
            pos &&
            createPortal(
               <ul
                  ref={dropdownRef}
                  role="listbox"
                  style={{
                     position: "fixed",
                     top: pos.top,
                     right: pos.right,
                  }}
                  className="z-50 min-w-12 overflow-hidden rounded border border-gray-200 bg-white shadow-lg"
               >
                  {options.map((p) => {
                     const selected = p.codigo === value;
                     return (
                        <li key={p.codigo}>
                           <button
                              type="button"
                              role="option"
                              aria-selected={selected}
                              onClick={() => {
                                 onChange(p.codigo);
                                 setOpen(false);
                              }}
                              title={p.label}
                              className={clsx(
                                 "block w-full px-2 py-1 text-left text-[10px] font-bold uppercase",
                                 selected
                                    ? "bg-red-50 text-red-700"
                                    : "text-gray-700 hover:bg-gray-100"
                              )}
                           >
                              {p.codigo}
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
