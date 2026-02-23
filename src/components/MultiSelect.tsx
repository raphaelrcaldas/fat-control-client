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
};

export function MultiSelect({
   options,
   selected,
   onChange,
   placeholder = "Selecione...",
   className = "",
   sizing = "md",
}: MultiSelectProps) {
   const [isOpen, setIsOpen] = useState(false);
   const [isAnimating, setIsAnimating] = useState(false);
   const [dropdownPosition, setDropdownPosition] = useState({
      top: 0,
      left: 0,
      width: 0,
   });
   const containerRef = useRef<HTMLDivElement>(null);
   const buttonRef = useRef<HTMLButtonElement>(null);
   const dropdownRef = useRef<HTMLDivElement>(null);

   // Calcula a posição do dropdown quando abre
   useEffect(() => {
      if (isOpen && buttonRef.current) {
         const rect = buttonRef.current.getBoundingClientRect();
         setDropdownPosition({
            top: rect.bottom + window.scrollY + 4,
            left: rect.left + window.scrollX,
            width: rect.width,
         });
      }
   }, [isOpen]);

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

   const toggleOption = (value: string) => {
      setIsAnimating(true);
      const newSelected = selected.includes(value)
         ? selected.filter((v) => v !== value)
         : [...selected, value];
      onChange(newSelected);

      setTimeout(() => setIsAnimating(false), 300);
   };

   const displayText =
      selected.length === 0
         ? placeholder
         : selected.length === 1
           ? options.find((opt) => opt.value === selected[0])?.label || ""
           : `${selected.length} selecionados`;

   const dropdownContent = isOpen && (
      <div
         ref={dropdownRef}
         className="fixed z-9999 max-h-60 overflow-auto rounded-lg border border-gray-300 bg-white shadow-xl"
         style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            animation: "fadeSlideIn 0.2s ease-out",
         }}
      >
         <style jsx>{`
            @keyframes fadeSlideIn {
               from {
                  opacity: 0;
                  transform: translateY(-8px);
               }
               to {
                  opacity: 1;
                  transform: translateY(0);
               }
            }
         `}</style>
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
                        className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-all duration-150 hover:bg-gray-50 ${
                           isSelected ? "bg-red-50" : ""
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
                              className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-all duration-200 ${
                                 isSelected
                                    ? "scale-100 border-red-600 bg-red-600"
                                    : "border-gray-300 bg-white hover:border-red-400"
                              }`}
                           >
                              {isSelected && (
                                 <svg
                                    className="animate-in zoom-in-90 h-3 w-3 text-white duration-200"
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
                           className={`flex-1 text-sm transition-colors duration-150 select-none ${
                              isSelected
                                 ? "font-medium text-red-600"
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
            onClick={() => setIsOpen(!isOpen)}
            className={`flex w-full items-center justify-between gap-2 rounded-lg border bg-white ${SIZING_CLASSES[sizing]} transition-all duration-200 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:outline-none ${
               selected.length > 0
                  ? "border-red-300 bg-red-50 text-gray-900 hover:bg-red-100"
                  : "border-gray-300 text-gray-900 hover:bg-gray-50"
            } ${isAnimating ? "scale-[0.98]" : ""}`}
         >
            <span
               className={`flex items-center gap-1.5 ${selected.length === 0 ? "text-gray-500" : ""}`}
            >
               {displayText}
               {selected.length > 1 && (
                  <span className="animate-in zoom-in-95 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-semibold text-white duration-200">
                     {selected.length}
                  </span>
               )}
            </span>
            <HiChevronDown
               className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
               }`}
            />
         </button>

         {typeof window !== "undefined" &&
            createPortal(dropdownContent, document.body)}
      </div>
   );
}
