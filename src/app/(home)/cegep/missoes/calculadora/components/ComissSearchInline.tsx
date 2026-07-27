"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { Spinner, TextInput } from "flowbite-react";
import { HiSearch } from "react-icons/hi";
import type { ComissList } from "services/routes/cegep/comiss";

/** Texto comparável: sem acento e em minúsculas — "jonatas" acha "jônatas". */
function normalizar(texto: string): string {
   return texto
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase();
}

interface ComissSearchInlineProps {
   /** Comissionamentos abertos ainda não acoplados. */
   disponiveis: ComissList[];
   carregando: boolean;
   onAcoplar: (comiss: ComissList) => void;
}

/**
 * Busca inline de comissionamento aberto, um militar por vez.
 *
 * O filtro é local: a lista de abertos já veio inteira do backend, então
 * cada tecla filtra na hora, sem request e sem debounce. Escolher fecha a
 * lista — o militar acoplado aparece logo abaixo, e é isso que se quer ver
 * no instante seguinte.
 *
 * Navegável por teclado (setas, Home/End, Enter, Escape) com ARIA de
 * combobox: `aria-activedescendant` aponta a opção em foco virtual e o foco
 * real nunca sai do input.
 */
export function ComissSearchInline({
   disponiveis,
   carregando,
   onAcoplar,
}: ComissSearchInlineProps) {
   const [term, setTerm] = useState("");
   const [open, setOpen] = useState(false);
   const [activeIndex, setActiveIndex] = useState(0);
   const containerRef = useRef<HTMLDivElement>(null);
   const listboxId = useId();

   const encontrados = useMemo(() => {
      const alvo = normalizar(term.trim());
      const base = alvo
         ? disponiveis.filter((c) => {
              const u = c.user;
              if (!u) return false;
              return normalizar(
                 `${u.posto?.short ?? u.p_g} ${u.nome_guerra} ${u.nome_completo ?? ""}`
              ).includes(alvo);
           })
         : disponiveis;
      // Teto de itens na lista: o dropdown é para escolher, não para navegar
      // o efetivo inteiro — refinar o termo é mais rápido que rolar 80 linhas.
      return base.slice(0, 8);
   }, [disponiveis, term]);

   useEffect(() => {
      setActiveIndex(0);
   }, [term, open]);

   useEffect(() => {
      if (!open) return;
      function onPointerDown(e: PointerEvent) {
         if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
      }
      document.addEventListener("pointerdown", onPointerDown);
      return () => document.removeEventListener("pointerdown", onPointerDown);
   }, [open]);

   const activeSafe =
      encontrados.length > 0
         ? Math.min(activeIndex, encontrados.length - 1)
         : -1;
   const activeId =
      activeSafe >= 0
         ? `${listboxId}-${encontrados[activeSafe].id}`
         : undefined;

   useEffect(() => {
      if (!open || !activeId) return;
      document.getElementById(activeId)?.scrollIntoView({ block: "nearest" });
   }, [open, activeId]);

   function acoplar(comiss: ComissList) {
      onAcoplar(comiss);
      // Fecha e limpa: com a lista aberta por cima, o militar recém-acoplado
      // ficaria escondido justamente no momento de conferir se entrou.
      setTerm("");
      setActiveIndex(0);
      setOpen(false);
   }

   function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      if (e.key === "Escape") {
         setOpen(false);
         e.currentTarget.blur();
         return;
      }
      if (!open || encontrados.length === 0) return;

      switch (e.key) {
         case "ArrowDown":
            e.preventDefault();
            setActiveIndex(Math.min(activeSafe + 1, encontrados.length - 1));
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
            setActiveIndex(encontrados.length - 1);
            break;
         case "Enter":
            if (activeSafe >= 0) {
               e.preventDefault();
               acoplar(encontrados[activeSafe]);
            }
            break;
      }
   }

   return (
      <div ref={containerRef} className="relative">
         <TextInput
            sizing="sm"
            icon={HiSearch}
            placeholder="Buscar militar comissionado..."
            value={term}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
               setTerm(e.target.value);
               setOpen(true);
            }}
            onKeyDown={handleKeyDown}
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-controls={open ? listboxId : undefined}
            aria-activedescendant={
               open && encontrados.length > 0 ? activeId : undefined
            }
            aria-label="Buscar militar com comissionamento aberto"
         />

         {open && (
            // Filhos do listbox são SEMPRE `option` — nem `ul`/`li` em volta,
            // nem `div` de mensagem solta, senão quebra `aria-required-children`.
            <div
               id={listboxId}
               role="listbox"
               aria-label="Comissionamentos abertos"
               className="absolute top-full right-0 left-0 z-30 mt-1 max-h-72 divide-y divide-slate-100 overflow-y-auto rounded border border-slate-200 bg-white shadow-lg"
            >
               {encontrados.length === 0 ? (
                  <div
                     role="option"
                     aria-disabled="true"
                     aria-selected={false}
                     className="flex items-center justify-center gap-2 px-3 py-4 text-sm text-slate-500"
                  >
                     {carregando ? (
                        <>
                           <Spinner size="sm" color="primary" />
                           Carregando comissionamentos...
                        </>
                     ) : term.trim() ? (
                        "Nenhum comissionamento aberto com esse nome"
                     ) : (
                        "Todos os comissionamentos abertos já estão na simulação"
                     )}
                  </div>
               ) : (
                  encontrados.map((c, i) => (
                     <ComissOption
                        key={c.id}
                        id={`${listboxId}-${c.id}`}
                        comiss={c}
                        ativa={i === activeSafe}
                        onSelect={() => acoplar(c)}
                        onHover={() => setActiveIndex(i)}
                     />
                  ))
               )}
            </div>
         )}
      </div>
   );
}

function ComissOption({
   id,
   comiss,
   ativa,
   onSelect,
   onHover,
}: {
   id: string;
   comiss: ComissList;
   ativa: boolean;
   onSelect: () => void;
   onHover: () => void;
}) {
   const user = comiss.user;
   const isPeriodo = !!comiss.dias_cumprir;

   return (
      <button
         id={id}
         type="button"
         role="option"
         aria-selected={ativa}
         onClick={onSelect}
         onPointerEnter={onHover}
         className={clsx(
            "flex w-full items-center gap-3 px-3 py-2 text-left transition-colors pointer-coarse:min-h-[44px]",
            ativa ? "bg-slate-100" : "bg-white hover:bg-slate-50"
         )}
      >
         <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-slate-800 uppercase">
               {user?.posto?.short ?? user?.p_g} {user?.nome_guerra}
            </span>
            {/* `slate-600`, não `-500`: sobre o `slate-100` da linha ativa o
                500 mede 4,34:1 e reprova o AA (medido no axe). */}
            <span className="mt-0.5 block font-mono text-[10px] tracking-wider text-slate-600 uppercase">
               {isPeriodo ? "período" : "comparativo"}
            </span>
         </span>
         <span className="shrink-0 font-mono text-xs font-semibold text-slate-600 tabular-nums">
            {comiss.completude.toLocaleString("pt-BR")}%
         </span>
      </button>
   );
}
