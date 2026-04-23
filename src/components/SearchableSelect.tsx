"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { HiChevronDown, HiX } from "react-icons/hi";
import clsx from "clsx";

type FlowbiteSizing = "sm" | "md" | "lg";

const SIZING_CLASSES: Record<FlowbiteSizing, string> = {
   sm: "p-2 sm:text-xs",
   md: "p-2.5 text-sm",
   lg: "p-4 sm:text-base",
};

type SearchableSelectProps = {
   options: { value: string; label: string }[];
   value: string;
   onChange: (value: string) => void;
   placeholder?: string;
   className?: string;
   sizing?: FlowbiteSizing;
   clearable?: boolean;
};

export function SearchableSelect({
   options,
   value,
   onChange,
   placeholder = "Selecione...",
   className = "",
   sizing = "md",
   clearable = false,
}: SearchableSelectProps) {
   const [isOpen, setIsOpen] = useState(false);
   const [search, setSearch] = useState("");
   const [dropdownPosition, setDropdownPosition] = useState({
      top: 0,
      left: 0,
      width: 0,
   });
   const containerRef = useRef<HTMLDivElement>(null);
   const buttonRef = useRef<HTMLButtonElement>(null);
   const dropdownRef = useRef<HTMLDivElement>(null);
   const inputRef = useRef<HTMLInputElement>(null);

   const selectedOption = options.find((o) => o.value === value);

   const filtered = useMemo(() => {
      if (!search) return options;
      const term = search.toLowerCase();
      return options.filter((o) => o.label.toLowerCase().includes(term));
   }, [options, search]);

   useEffect(() => {
      if (isOpen) {
         setTimeout(() => inputRef.current?.focus(), 0);
      } else {
         setSearch("");
      }
   }, [isOpen]);

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

   // Close on outside click or scroll
   useEffect(() => {
      if (!isOpen) return;

      function handleClickOutside(event: MouseEvent) {
         const target = event.target as Node;
         const clickedInContainer = containerRef.current?.contains(target);
         const clickedInDropdown = dropdownRef.current?.contains(target);

         if (!clickedInContainer && !clickedInDropdown) {
            setIsOpen(false);
         }
      }

      function handleScroll(event: Event) {
         if (dropdownRef.current?.contains(event.target as Node)) return;
         setIsOpen(false);
      }

      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("scroll", handleScroll, true);
      return () => {
         document.removeEventListener("mousedown", handleClickOutside);
         document.removeEventListener("scroll", handleScroll, true);
      };
   }, [isOpen]);

   function handleSelect(opt: { value: string }) {
      onChange(opt.value);
      setIsOpen(false);
   }

   const dropdownContent = isOpen && (
      <div
         ref={dropdownRef}
         className="fixed z-9999 overflow-hidden rounded-lg border border-gray-300 bg-white shadow-xl"
         style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
         }}
      >
         <div className="border-b border-gray-200 p-2">
            <input
               ref={inputRef}
               type="text"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               placeholder="Buscar..."
               className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
            />
         </div>
         <div className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 ? (
               <div className="px-3 py-2 text-center text-sm text-gray-500">
                  Nenhum resultado
               </div>
            ) : (
               filtered.map((option) => {
                  const isSelected = option.value === value;
                  return (
                     <div
                        key={option.value}
                        onClick={() => handleSelect(option)}
                        className={clsx(
                           "cursor-pointer px-3 py-2.5 text-sm hover:bg-gray-50",
                           isSelected && "bg-red-50 font-medium text-red-700"
                        )}
                     >
                        {option.label}
                     </div>
                  );
               })
            )}
         </div>
      </div>
   );

   return (
      <div className={`relative ${className}`} ref={containerRef}>
         <button
            ref={buttonRef}
            type="button"
            onClick={toggleDropdown}
            style={{ transform: "translateZ(0)" }}
            className={clsx(
               "flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:outline-none",
               SIZING_CLASSES[sizing],
               value
                  ? "border-gray-300 text-gray-900 hover:bg-gray-50"
                  : "border-gray-300 text-gray-500 hover:bg-gray-50"
            )}
         >
            <span className="truncate">
               {selectedOption?.label || placeholder}
            </span>
            <span className="flex shrink-0 items-center gap-0.5">
               {clearable && value && (
                  <span
                     role="button"
                     tabIndex={0}
                     onClick={(e) => {
                        e.stopPropagation();
                        onChange("");
                        setIsOpen(false);
                     }}
                     onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                           e.preventDefault();
                           e.stopPropagation();
                           onChange("");
                           setIsOpen(false);
                        }
                     }}
                     className="rounded p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                  >
                     <HiX className="h-3.5 w-3.5" />
                  </span>
               )}
               <HiChevronDown
                  className={clsx(
                     "h-4 w-4 text-gray-500",
                     isOpen && "rotate-180"
                  )}
               />
            </span>
         </button>

         {typeof window !== "undefined" &&
            createPortal(dropdownContent, document.body)}
      </div>
   );
}
