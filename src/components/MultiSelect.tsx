"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { HiChevronDown } from "react-icons/hi";

type FlowbiteSizing = "sm" | "md" | "lg";

const SIZING_CLASSES: Record<FlowbiteSizing, string> = {
   sm: "p-2 sm:text-xs",
   md: "p-2.5 text-sm",
   lg: "p-4 sm:text-base",
};

type MultiSelectProps = {
   options: { value: string; label: string }[];
   selected: string[];
   onChange: (values: string[]) => void;
   placeholder?: string;
   className?: string;
   sizing?: FlowbiteSizing;
   /**
    * Nome acessível do controle. É um `<button>` com dropdown, não um campo
    * nativo, então um `<label htmlFor>` não o alcança — o rótulo visível ao
    * lado precisa ser repetido aqui.
    */
   ariaLabel?: string;
};

export function MultiSelect({
   options,
   selected,
   onChange,
   placeholder = "Selecione...",
   className = "",
   sizing = "md",
   ariaLabel,
}: MultiSelectProps) {
   const [isOpen, setIsOpen] = useState(false);
   const [dropdownPosition, setDropdownPosition] = useState({
      top: 0,
      left: 0,
      width: 0,
   });
   const containerRef = useRef<HTMLDivElement>(null);
   const buttonRef = useRef<HTMLButtonElement>(null);
   const dropdownRef = useRef<HTMLDivElement>(null);

   // Fecha ao clicar fora
   useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
         const target = event.target as Node;
         const clickedInContainer = containerRef.current?.contains(target);
         const clickedInDropdown = dropdownRef.current?.contains(target);

         if (!clickedInContainer && !clickedInDropdown) {
            setIsOpen(false);
         }
      }

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
         document.removeEventListener("mousedown", handleClickOutside);
   }, []);

   function openDropdown() {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
         top: rect.bottom + 4,
         left: rect.left,
         width: rect.width,
      });
      setIsOpen(true);
   }

   function toggleDropdown() {
      if (isOpen) {
         setIsOpen(false);
      } else {
         openDropdown();
      }
   }

   const toggleOption = (value: string) => {
      const newSelected = selected.includes(value)
         ? selected.filter((v) => v !== value)
         : [...selected, value];
      onChange(newSelected);
   };

   const displayText =
      selected.length === 0
         ? placeholder
         : selected.length === 1
           ? // catalogo assincrono: enquanto as opcoes nao chegam, o proprio
             // valor no lugar do rotulo — em branco o controle parecia vazio
             (options.find((opt) => opt.value === selected[0])?.label ??
             selected[0])
           : `${selected.length} selecionados`;

   const dropdownContent = isOpen && (
      <div
         ref={dropdownRef}
         className="fixed z-9999 max-h-60 overflow-auto rounded border border-gray-300 bg-white shadow-xl"
         style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
         }}
      >
         {options.length === 0 ? (
            <div className="px-3 py-2 text-center text-sm text-gray-500">
               Nenhuma opção disponível
            </div>
         ) : (
            <div className="py-1">
               {options.map((option) => {
                  const isSelected = selected.includes(option.value);
                  return (
                     <label
                        key={option.value}
                        className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-gray-50 ${
                           isSelected ? "bg-primary-50" : ""
                        }`}
                     >
                        <div className="relative flex items-center justify-center">
                           <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleOption(option.value)}
                              className="peer sr-only"
                           />
                           <div
                              className={`flex h-5 w-5 items-center justify-center rounded border-2 ${
                                 isSelected
                                    ? "border-primary-600 bg-primary-600"
                                    : "hover:border-primary-400 border-gray-300 bg-white"
                              }`}
                           >
                              {isSelected && (
                                 <svg
                                    className="h-3 w-3 text-white"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="3"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                 >
                                    <path d="M5 13l4 4L19 7" />
                                 </svg>
                              )}
                           </div>
                        </div>
                        <span
                           className={`flex-1 text-sm select-none ${
                              isSelected
                                 ? "text-primary-700 font-medium"
                                 : "text-gray-700"
                           }`}
                        >
                           {option.label}
                        </span>
                     </label>
                  );
               })}
            </div>
         )}
      </div>
   );

   return (
      <div className={`relative ${className}`} ref={containerRef}>
         <button
            ref={buttonRef}
            type="button"
            onClick={toggleDropdown}
            aria-label={ariaLabel}
            aria-expanded={isOpen}
            title={displayText}
            style={{ transform: "translateZ(0)" }}
            /* Foco visivel so no TECLADO (`focus-visible`), nunca no clique
               de mouse — era o incomodo do `focus:ring-2` antigo. O estilo e a
               largura vao explicitos porque um `focus:outline-none` na mesma
               regra vence o `outline-style` e o contorno nao chega a pintar.
               2px e o piso de area do WCAG 2.4.11; borda de 1px trocando de
               cor nao alcanca 3:1 entre os dois estados. */
            className={`flex w-full items-center justify-between gap-2 rounded border bg-white ${SIZING_CLASSES[sizing]} focus-visible:outline-primary-600 outline-none focus-visible:outline-[2px] focus-visible:outline-offset-[2px] focus-visible:[outline-style:solid] ${
               selected.length > 0
                  ? "border-primary-300 bg-primary-50 hover:bg-primary-100 text-gray-900"
                  : "border-gray-300 text-gray-900 hover:bg-gray-50"
            }`}
         >
            {/* `min-w-0` + `truncate`: sem eles o rotulo de varias selecoes
                quebrava em duas linhas e o controle crescia, desalinhando a
                barra de filtros inteira. */}
            <span
               className={`flex min-w-0 items-center gap-1.5 ${selected.length === 0 ? "text-gray-500" : ""}`}
            >
               <span className="truncate">{displayText}</span>
               {selected.length > 1 && (
                  <span className="bg-primary-600 inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-xs font-semibold text-white">
                     {selected.length}
                  </span>
               )}
            </span>
            <HiChevronDown
               className={`h-4 w-4 shrink-0 text-gray-500 ${isOpen ? "rotate-180" : ""}`}
            />
         </button>

         {typeof window !== "undefined" &&
            createPortal(dropdownContent, document.body)}
      </div>
   );
}
