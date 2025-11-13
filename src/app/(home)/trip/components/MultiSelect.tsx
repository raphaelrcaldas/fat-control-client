"use client";

import { useState, useRef, useEffect } from "react";
import { HiChevronDown } from "react-icons/hi";

type MultiSelectProps = {
   options: { value: string; label: string }[];
   selected: string[];
   onChange: (values: string[]) => void;
   placeholder?: string;
   className?: string;
};

export function MultiSelect({
   options,
   selected,
   onChange,
   placeholder = "Selecione...",
   className = "",
}: MultiSelectProps) {
   const [isOpen, setIsOpen] = useState(false);
   const [isAnimating, setIsAnimating] = useState(false);
   const containerRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
         if (
            containerRef.current &&
            !containerRef.current.contains(event.target as Node)
         ) {
            setIsOpen(false);
         }
      }

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
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

   return (
      <div className={`relative ${className}`} ref={containerRef}>
         <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm bg-white border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
               selected.length > 0
                  ? "text-gray-900 border-red-300 bg-red-50 hover:bg-red-100"
                  : "text-gray-900 border-gray-300 hover:bg-gray-50"
            } ${isAnimating ? "scale-[0.98]" : ""}`}
         >
            <span className={`flex items-center gap-1.5 ${selected.length === 0 ? "text-gray-500" : ""}`}>
               {displayText}
               {selected.length > 1 && (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold text-white bg-red-600 rounded-full animate-in zoom-in-95 duration-200">
                     {selected.length}
                  </span>
               )}
            </span>
            <HiChevronDown
               className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
               }`}
            />
         </button>

         {isOpen && (
            <div
               className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-auto"
               style={{
                  animation: "fadeSlideIn 0.2s ease-out"
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
                  <div className="px-3 py-2 text-sm text-gray-500 text-center">
                     Nenhuma opção disponível
                  </div>
               ) : (
                  <div className="py-1">
                     {options.map((option) => {
                        const isSelected = selected.includes(option.value);
                        return (
                           <label
                              key={option.value}
                              className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-all duration-150 hover:bg-gray-50 ${
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
                                    className={`w-5 h-5 border-2 rounded transition-all duration-200 flex items-center justify-center ${
                                       isSelected
                                          ? "bg-red-600 border-red-600 scale-100"
                                          : "bg-white border-gray-300 hover:border-red-400"
                                    }`}
                                 >
                                    {isSelected && (
                                       <svg
                                          className="w-3 h-3 text-white animate-in zoom-in-90 duration-200"
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
                                 className={`flex-1 text-sm select-none transition-colors duration-150 ${
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
         )}
      </div>
   );
}
