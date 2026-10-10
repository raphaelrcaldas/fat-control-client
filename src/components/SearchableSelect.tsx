"use client";

import { useState, useRef, useEffect, useMemo, useId } from "react";
import { createPortal } from "react-dom";
import { HiChevronDown, HiX } from "react-icons/hi";
import clsx from "clsx";

type FlowbiteSizing = "sm" | "md" | "lg";

const SIZING_CLASSES: Record<FlowbiteSizing, string> = {
   sm: "p-2 sm:text-xs",
   md: "p-2.5 text-sm",
   lg: "p-4 sm:text-base",
};

// O "x" de limpar é IRMÃO do gatilho (interativo dentro de `<button>` é HTML
// inválido), sobreposto à esquerda da seta: padding do tamanho + seta
// (`h-4`) + respiro. Cabe no `gap-2` + `pr-6` que o rótulo reserva.
const CLEAR_RIGHT: Record<FlowbiteSizing, string> = {
   sm: "right-[28px]",
   md: "right-[30px]",
   lg: "right-[36px]",
};

type SearchableSelectProps = {
   options: { value: string; label: string }[];
   value: string;
   onChange: (value: string) => void;
   placeholder?: string;
   className?: string;
   sizing?: FlowbiteSizing;
   clearable?: boolean;
   /** id do botao, para um `<Label htmlFor>` apontar para o campo. */
   id?: string;
   /** Borda de erro (campo obrigatorio vazio, por ex.). */
   invalid?: boolean;
   /** Opcoes ainda carregando: skeleton no lugar do texto, sem abrir. */
   loading?: boolean;
};

export function SearchableSelect({
   options,
   value,
   onChange,
   placeholder = "Selecione...",
   className = "",
   sizing = "md",
   clearable = false,
   id,
   invalid = false,
   loading = false,
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
   const listRef = useRef<HTMLDivElement>(null);
   const [activeIndex, setActiveIndex] = useState(0);
   const listboxId = useId();

   const selectedOption = options.find((o) => o.value === value);
   const showClear = clearable && !!value && !loading;

   const filtered = useMemo(() => {
      if (!search) return options;
      const term = search.toLowerCase();
      return options.filter((o) => o.label.toLowerCase().includes(term));
   }, [options, search]);

   // Ao abrir, a opção ativa é a selecionada (como no `<select>` nativo); ao
   // filtrar, volta para a primeira.
   useEffect(() => {
      if (!isOpen) return;
      const atual = filtered.findIndex((o) => o.value === value);
      setActiveIndex(search ? 0 : Math.max(atual, 0));
      // Só ao abrir e ao filtrar: `filtered`/`value` mudando com a lista
      // aberta não devem arrastar o destaque.
   }, [isOpen, search]);

   const activeSafe =
      filtered.length > 0 ? Math.min(activeIndex, filtered.length - 1) : -1;
   const optionId = (i: number) => `${listboxId}-opt-${i}`;
   const activeId = activeSafe >= 0 ? optionId(activeSafe) : undefined;

   // Rola só a lista (não `scrollIntoView`, que pode rolar o documento e
   // disparar o fechamento por rolagem logo ao abrir).
   useEffect(() => {
      if (!isOpen || !activeId) return;
      const lista = listRef.current;
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
   }, [isOpen, activeId]);

   useEffect(() => {
      if (isOpen) {
         setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 0);
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

   // Escape fecha SÓ a lista, inclusive dentro de Modal `dismissible`: o
   // `useDismiss` do Flowbite escuta `keydown` no `document` e ignora
   // `defaultPrevented` — fechava o modal inteiro (e descartava o
   // formulário). Captura em `window` roda antes dele e do React.
   useEffect(() => {
      if (!isOpen) return;
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
   }, [isOpen]);

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

   function handleSelect(opt: { value: string }, viaMouse = false) {
      onChange(opt.value);
      setIsOpen(false);
      // O foco volta ao gatilho (senão cairia no `body`). No clique, sem
      // anel: ele herdaria o `:focus-visible` do input de busca.
      buttonRef.current?.focus({ focusVisible: !viaMouse });
   }

   function handleClear() {
      onChange("");
      setIsOpen(false);
      // O "x" desmonta ao limpar; sem isto o foco cairia no `body`.
      buttonRef.current?.focus();
   }

   function handleTriggerKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
      if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
         e.preventDefault();
         openDropdown();
      }
   }

   // Foco real fica na busca; as setas movem o foco virtual
   // (`aria-activedescendant`) pelas opções.
   function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      switch (e.key) {
         case "Tab":
            // A lista mora num portal no fim do `body`: devolver o foco ao
            // gatilho ANTES do Tab padrão faz o próximo campo ser o vizinho
            // do gatilho, não o fim da página.
            setIsOpen(false);
            buttonRef.current?.focus();
            return;
      }
      if (filtered.length === 0) return;
      switch (e.key) {
         case "ArrowDown":
            e.preventDefault();
            setActiveIndex(Math.min(activeSafe + 1, filtered.length - 1));
            break;
         case "ArrowUp":
            e.preventDefault();
            setActiveIndex(Math.max(activeSafe - 1, 0));
            break;
         // Home/End ficam com o texto da busca (cursor), como no exemplo de
         // combobox editável da APG.
         case "Enter":
            e.preventDefault();
            if (activeSafe >= 0) handleSelect(filtered[activeSafe]);
            break;
      }
   }

   const dropdownContent = isOpen && (
      <div
         ref={dropdownRef}
         className="fixed z-9999 overflow-hidden rounded border border-gray-300 bg-white shadow-xl"
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
               onKeyDown={handleSearchKeyDown}
               role="combobox"
               aria-expanded
               aria-autocomplete="list"
               aria-controls={listboxId}
               aria-activedescendant={activeId}
               aria-label="Buscar opção"
               placeholder="Buscar..."
               className="focus:border-primary-400 focus:ring-primary-400 w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-1"
            />
         </div>
         {/* Filhos do listbox são SEMPRE `option` — a mensagem de vazio
             também, desabilitada (`aria-required-children`). */}
         <div
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label={placeholder}
            className="relative max-h-60 overflow-y-auto py-1"
         >
            {filtered.length === 0 ? (
               <div
                  role="option"
                  aria-disabled="true"
                  aria-selected={false}
                  className="px-3 py-2 text-center text-sm text-gray-500"
               >
                  Nenhum resultado
               </div>
            ) : (
               filtered.map((option, i) => {
                  const isSelected = option.value === value;
                  return (
                     <div
                        key={option.value}
                        id={optionId(i)}
                        role="option"
                        aria-selected={isSelected}
                        // mousedown não rouba o foco da busca (mantém o
                        // teclado vivo se o clique for cancelado).
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelect(option, true)}
                        onMouseMove={() => setActiveIndex(i)}
                        className={clsx(
                           "cursor-pointer px-3 py-2.5 text-sm",
                           // Fundo exclusivo (sem tailwind-merge, duas
                           // classes `bg-*` brigariam pela ordem do CSS).
                           isSelected
                              ? i === activeSafe
                                 ? "bg-primary-100"
                                 : "bg-primary-50"
                              : i === activeSafe && "bg-gray-100",
                           isSelected && "text-primary-700 font-medium",
                           // Barra à esquerda: só o fundo (gray-100 sobre
                           // branco) não se via como foco de teclado.
                           i === activeSafe &&
                              "shadow-[inset_2px_0_0_var(--color-primary-600)]"
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
            id={id}
            type="button"
            aria-invalid={invalid || undefined}
            aria-busy={loading || undefined}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-controls={isOpen ? listboxId : undefined}
            disabled={loading}
            onClick={toggleDropdown}
            onKeyDown={handleTriggerKeyDown}
            style={{ transform: "translateZ(0)" }}
            /* Foco visivel so no TECLADO (`focus-visible`), nunca no clique
               de mouse — era o incomodo do `focus:ring-2` antigo. O estilo e a
               largura vao explicitos porque um `focus:outline-none` na mesma
               regra vence o `outline-style` e o contorno nao chega a pintar.
               2px e o piso de area do WCAG 2.4.11; borda de 1px trocando de
               cor nao alcanca 3:1 entre os dois estados. */
            className={clsx(
               "focus-visible:outline-primary-600 flex w-full cursor-pointer items-center justify-between gap-2 rounded border outline-none focus-visible:outline-[2px] focus-visible:outline-offset-[2px] focus-visible:[outline-style:solid] disabled:cursor-wait",
               SIZING_CLASSES[sizing],
               invalid
                  ? "border-red-500 bg-red-50 text-red-900 hover:bg-red-100"
                  : value
                    ? "border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
                    : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
            )}
         >
            {loading ? (
               // texto transparente: mantem a altura da linha, zero shift
               <span className="w-2/3 animate-pulse truncate rounded bg-slate-200 text-transparent">
                  Carregando
               </span>
            ) : (
               // `pr-6` reserva o lugar do "x" sobreposto, que não ocupa
               // espaço no fluxo: o campo não cresce ao receber valor.
               <span className={clsx("truncate", showClear && "pr-6")}>
                  {selectedOption?.label || placeholder}
               </span>
            )}
            <HiChevronDown
               aria-hidden
               className={clsx(
                  "h-4 w-4 shrink-0 text-gray-500",
                  isOpen && "rotate-180"
               )}
            />
         </button>

         {showClear && (
            <button
               type="button"
               onClick={handleClear}
               aria-label="Limpar seleção"
               className={clsx(
                  "focus-visible:outline-primary-600 absolute top-1/2 grid min-h-[24px] min-w-[24px] -translate-y-1/2 place-items-center rounded text-gray-400 outline-none hover:bg-gray-200 hover:text-gray-600 focus-visible:outline-[2px] focus-visible:[outline-style:solid]",
                  CLEAR_RIGHT[sizing]
               )}
            >
               <HiX className="h-3.5 w-3.5" aria-hidden />
            </button>
         )}

         {typeof window !== "undefined" &&
            createPortal(dropdownContent, document.body)}
      </div>
   );
}
