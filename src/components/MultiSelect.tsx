"use client";

import { useState, useRef, useEffect, useId } from "react";
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
   disabled?: boolean;
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
   disabled = false,
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
   const [activeIndex, setActiveIndex] = useState(0);
   const listboxId = useId();
   const aberto = isOpen && !disabled;

   const activeSafe =
      options.length > 0 ? Math.min(activeIndex, options.length - 1) : -1;
   const optionId = (i: number) => `${listboxId}-opt-${i}`;
   const activeId = activeSafe >= 0 ? optionId(activeSafe) : undefined;

   // Ao abrir: foco no listbox (a lista mora num portal no fim do `body` —
   // sem isto o Tab pulava as opções) e foco virtual na 1ª marcada.
   useEffect(() => {
      if (!aberto) return;
      const primeira = options.findIndex((o) => selected.includes(o.value));
      setActiveIndex(Math.max(primeira, 0));
      setTimeout(() => dropdownRef.current?.focus({ preventScroll: true }), 0);
      // Só ao abrir: marcar/desmarcar com a lista aberta não move o destaque.
   }, [aberto]);

   // Rola só a lista (não `scrollIntoView`, que pode rolar o documento e
   // disparar o fechamento por rolagem logo ao abrir).
   useEffect(() => {
      if (!aberto || !activeId) return;
      const lista = dropdownRef.current;
      const el = document.getElementById(activeId);
      if (!lista || !el) return;
      if (el.offsetTop < lista.scrollTop) {
         lista.scrollTop = el.offsetTop;
      } else if (
         el.offsetTop + el.offsetHeight >
         lista.scrollTop + lista.clientHeight
      ) {
         lista.scrollTop = el.offsetTop + el.offsetHeight - lista.clientHeight;
      }
   }, [aberto, activeId]);

   // Desabilitado com a lista aberta: fecha de vez — senão ela reapareceria
   // sozinha (roubando o foco) quando `disabled` voltasse a falso.
   useEffect(() => {
      if (disabled) setIsOpen(false);
   }, [disabled]);

   // Escape fecha SÓ a lista, inclusive dentro de Modal `dismissible`: o
   // `useDismiss` do Flowbite escuta `keydown` no `document` e ignora
   // `defaultPrevented` — fechava o modal inteiro (e descartava o
   // formulário). Captura em `window` roda antes dele e do React.
   useEffect(() => {
      if (!aberto) return;
      function onKeyDown(e: KeyboardEvent) {
         if (e.key !== "Escape") return;
         if (!dropdownRef.current?.contains(e.target as Node)) return;
         e.preventDefault();
         e.stopPropagation();
         setIsOpen(false);
         buttonRef.current?.focus();
      }
      window.addEventListener("keydown", onKeyDown, true);
      return () => window.removeEventListener("keydown", onKeyDown, true);
   }, [aberto]);

   // Fecha ao clicar fora e ao rolar a página (a lista é `fixed`: ficaria
   // solta no lugar, longe do gatilho).
   useEffect(() => {
      if (!aberto) return;

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
   }, [aberto]);

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

   function closeToTrigger() {
      setIsOpen(false);
      buttonRef.current?.focus();
   }

   function handleTriggerKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
      if (!aberto && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
         e.preventDefault();
         openDropdown();
      }
   }

   // Foco real no listbox; as setas movem o foco virtual
   // (`aria-activedescendant`). Espaço/Enter marcam sem fechar — é seleção
   // múltipla.
   function handleListKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
      switch (e.key) {
         case "Tab":
            // Devolver o foco ao gatilho ANTES do Tab padrão: o próximo campo
            // passa a ser o vizinho do gatilho, não o fim da página.
            closeToTrigger();
            return;
      }
      if (options.length === 0) return;
      switch (e.key) {
         case "ArrowDown":
            e.preventDefault();
            setActiveIndex(Math.min(activeSafe + 1, options.length - 1));
            break;
         case "ArrowUp":
            e.preventDefault();
            setActiveIndex(Math.max(activeSafe - 1, 0));
            break;
         case "Home":
            e.preventDefault();
            setActiveIndex(0);
            break;
         case "End":
            e.preventDefault();
            setActiveIndex(options.length - 1);
            break;
         case " ":
         case "Enter":
            e.preventDefault();
            if (activeSafe >= 0) toggleOption(options[activeSafe].value);
            break;
      }
   }

   const displayText =
      selected.length === 0
         ? placeholder
         : selected.length === 1
           ? // catalogo assincrono: enquanto as opcoes nao chegam, o proprio
             // valor no lugar do rotulo — em branco o controle parecia vazio
             (options.find((opt) => opt.value === selected[0])?.label ??
             selected[0])
           : `${selected.length} selecionados`;

   const dropdownContent = aberto && (
      // Filhos do listbox são SEMPRE `option` — a mensagem de vazio também,
      // desabilitada (`aria-required-children`).
      <div
         ref={dropdownRef}
         id={listboxId}
         role="listbox"
         aria-multiselectable="true"
         aria-label={ariaLabel ?? placeholder}
         aria-activedescendant={activeId}
         tabIndex={0}
         onKeyDown={handleListKeyDown}
         className="fixed z-9999 max-h-60 overflow-auto rounded border border-gray-300 bg-white py-1 shadow-xl outline-none"
         style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
         }}
      >
         {options.length === 0 ? (
            <div
               role="option"
               aria-disabled="true"
               aria-selected={false}
               className="px-3 py-2 text-center text-sm text-gray-500"
            >
               Nenhuma opção disponível
            </div>
         ) : (
            options.map((option, i) => {
               const isSelected = selected.includes(option.value);
               const ativa = i === activeSafe;
               return (
                  <div
                     key={option.value}
                     id={optionId(i)}
                     role="option"
                     aria-selected={isSelected}
                     // mousedown não tira o foco do listbox (o teclado segue
                     // valendo depois de um clique).
                     onMouseDown={(e) => e.preventDefault()}
                     onClick={() => toggleOption(option.value)}
                     onMouseMove={() => setActiveIndex(i)}
                     className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 ${
                        isSelected
                           ? ativa
                              ? "bg-primary-100"
                              : "bg-primary-50"
                           : ativa
                             ? "bg-gray-100"
                             : ""
                     } ${
                        // Barra à esquerda: só o fundo (gray-100 sobre
                        // branco) não se via como foco de teclado.
                        ativa
                           ? "shadow-[inset_2px_0_0_var(--color-primary-600)]"
                           : ""
                     }`}
                  >
                     <div
                        aria-hidden
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${
                           isSelected
                              ? "border-primary-600 bg-primary-600"
                              : "border-gray-300 bg-white"
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
                     <span
                        className={`flex-1 text-sm select-none ${
                           isSelected
                              ? "text-primary-700 font-medium"
                              : "text-gray-700"
                        }`}
                     >
                        {option.label}
                     </span>
                  </div>
               );
            })
         )}
      </div>
   );

   return (
      <div className={`relative ${className}`} ref={containerRef}>
         <button
            ref={buttonRef}
            type="button"
            onClick={toggleDropdown}
            onKeyDown={handleTriggerKeyDown}
            disabled={disabled}
            aria-label={ariaLabel}
            aria-haspopup="listbox"
            aria-expanded={aberto}
            aria-controls={aberto ? listboxId : undefined}
            title={displayText}
            style={{ transform: "translateZ(0)" }}
            /* Foco visivel so no TECLADO (`focus-visible`), nunca no clique
               de mouse — era o incomodo do `focus:ring-2` antigo. O estilo e a
               largura vao explicitos porque um `focus:outline-none` na mesma
               regra vence o `outline-style` e o contorno nao chega a pintar.
               2px e o piso de area do WCAG 2.4.11; borda de 1px trocando de
               cor nao alcanca 3:1 entre os dois estados. */
            className={`flex w-full items-center justify-between gap-2 rounded border bg-white disabled:cursor-not-allowed disabled:opacity-50 ${SIZING_CLASSES[sizing]} focus-visible:outline-primary-600 outline-none focus-visible:outline-[2px] focus-visible:outline-offset-[2px] focus-visible:[outline-style:solid] ${
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
               aria-hidden
               className={`h-4 w-4 shrink-0 text-gray-500 ${aberto ? "rotate-180" : ""}`}
            />
         </button>

         {typeof window !== "undefined" &&
            createPortal(dropdownContent, document.body)}
      </div>
   );
}
