"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button, TextInput } from "flowbite-react";
import { TbSearch, TbX } from "react-icons/tb";
import clsx from "clsx";
import { getGroupColor } from "../constants";
import { ProgramRow } from "./ProgramRow";
import type { HistPrograma } from "services/routes/estatistica/esfAer";

/** Corta a query exibida no vazio da busca (com `title` para o texto todo). */
function cortarQuery(value: string, max = 24): string {
   return value.length > max ? `${value.slice(0, max)}…` : value;
}

/** Folga (px) para não acender o fade por arredondamento de subpixel. */
const OVERFLOW_EPS = 8;

interface ProgramRailProps {
   programas: HistPrograma[];
   /** Cores por programa, derivadas UMA vez na página (mesma fonte do gráfico). */
   programColors: Map<number, string>;
   /** Visibilidade por programa (`esfaer_id → visível`; ausente = oculto). */
   toggled: Record<number, boolean>;
   /** Quando preenchido, só Total + este programa ficam visíveis. */
   isolated: number | null;
   query: string;
   onQueryChange: (q: string) => void;
   onTogglePrograma: (id: number) => void;
   onIsolate: (id: number) => void;
}

/**
 * Rail lateral de programas: cabeçalho com contagem, busca (nome/descrição/
 * grupo), e lista rolável de `ProgramRow`.
 *
 * Não força largura fixa nem altura: a page controla o grid (~330px) e o teto
 * da lista é o `max-h` — `h-full` aqui seria inerte, porque o wrapper do grid
 * não propaga altura.
 */
export function ProgramRail({
   programas,
   programColors,
   toggled,
   isolated,
   query,
   onQueryChange,
   onTogglePrograma,
   onIsolate,
}: ProgramRailProps) {
   const q = query.trim().toLowerCase();
   const filtered = useMemo(() => {
      if (!q) return programas;
      return programas.filter(
         (p) =>
            p.nome.toLowerCase().includes(q) ||
            p.descricao.toLowerCase().includes(q) ||
            p.grupo.toLowerCase().includes(q)
      );
   }, [programas, q]);

   /**
    * Fade no rodapé só quando ainda HÁ conteúdo abaixo. Fade incondicional
    * esmaeceria a última linha de uma lista curta, sugerindo corte onde não há.
    * Mede o próprio elemento (não o viewport): `max-h` é fixo, então não há o
    * loop de realimentação que o ResizeObserver causou no chart desta tela.
    */
   const listRef = useRef<HTMLDivElement>(null);
   const [hasMore, setHasMore] = useState(false);

   useEffect(() => {
      const el = listRef.current;
      if (!el) return;

      const update = () =>
         setHasMore(
            el.scrollHeight - el.scrollTop - el.clientHeight > OVERFLOW_EPS
         );

      update();
      el.addEventListener("scroll", update, { passive: true });

      // Sem observar o tamanho, encolher a janela criava overflow com o fade
      // apagado. Observar a LISTA é seguro: o `max-h` é fixo, então medir não
      // realimenta altura (a armadilha do ResizeObserver foi no chart).
      const ro = new ResizeObserver(update);
      ro.observe(el);

      return () => {
         el.removeEventListener("scroll", update);
         ro.disconnect();
      };
   }, [filtered]);

   /**
    * Traz o programa isolado para a área visível. Sem isto, isolar um item que
    * está fora do recorte do scroll não dá retorno algum no rail: o gráfico
    * muda e a lista parece inerte. `block: "nearest"` não mexe no scroll
    * quando a linha já está visível.
    */
   useEffect(() => {
      if (isolated == null) return;
      listRef.current
         ?.querySelector(`[data-esfaer-id="${isolated}"]`)
         ?.scrollIntoView({ block: "nearest" });
   }, [isolated]);

   return (
      <div className="flex flex-col rounded border border-slate-200 bg-white p-4 shadow-sm">
         <div className="flex shrink-0 items-baseline justify-between gap-2">
            <h2 className="font-mono text-[11px] font-bold tracking-[0.2em] text-slate-500 uppercase">
               {/* Sob busca a contagem é "N de M": exibir só o total mentiria
                   sobre o tamanho da lista que está logo abaixo. */}
               Programas ({q ? `${filtered.length} de ` : ""}
               {programas.length})
            </h2>
            <span className="text-[10px] text-slate-500">
               clique no nome p/ isolar
            </span>
         </div>

         <div className="relative mt-3 shrink-0">
            <TextInput
               type="text"
               icon={TbSearch}
               placeholder="Buscar esforço..."
               value={query}
               onChange={(e) => onQueryChange(e.target.value)}
               sizing="sm"
               // Sem isto o texto digitado passa por baixo do botão de
               // limpar. Vai em `input.base` (o tema CONCATENA): o slot
               // `withIcon.on` é o `pl-10` da lupa à esquerda — sobrescrevê-lo
               // colocaria o texto sob o ícone de busca. `withRightIcon` não
               // serve: só é aplicado quando existe a prop `rightIcon`.
               theme={{ field: { input: { base: "pr-9" } } }}
            />
            {query && (
               <button
                  type="button"
                  onClick={() => onQueryChange("")}
                  aria-label="Limpar busca"
                  // w-7: alvo de 28px de largura — acima dos 24px do WCAG
                  // 2.5.8 para mouse (esta rota não é exposta no mobile).
                  className="absolute inset-y-0 right-0 flex w-7 items-center justify-center text-slate-500 hover:text-slate-700"
               >
                  <TbX className="h-4 w-4" />
               </button>
            )}
         </div>

         {/* Teto fixo + scroll interno: o grid da página é content-sized, então
             a lista não pode definir a altura da linha (rolaria a página toda
             com muitos programas). */}
         <div
            ref={listRef}
            className={clsx(
               "mt-3 max-h-[420px] space-y-2 overflow-auto pr-1",
               hasMore &&
                  "mask-[linear-gradient(to_bottom,black_calc(100%-24px),transparent_100%)]"
            )}
         >
            {filtered.length === 0 ? (
               <div className="flex flex-col items-center gap-2 px-1 py-6 text-center">
                  <p className="text-sm text-slate-500">
                     {/* A query entra truncada: sem o corte, uma busca longa
                         (ou colada) estoura a largura do rail. */}
                     Nenhum esforço encontrado para{" "}
                     <span className="font-medium text-slate-700" title={query}>
                        &quot;{cortarQuery(query)}&quot;
                     </span>
                  </p>
                  <Button
                     color="light"
                     size="xs"
                     onClick={() => onQueryChange("")}
                  >
                     Limpar busca
                  </Button>
               </div>
            ) : (
               filtered.map((p) => {
                  const isolatedRow = isolated === p.esfaer_id;
                  const checked =
                     isolated != null
                        ? isolatedRow
                        : toggled[p.esfaer_id] === true;
                  const dimmed = isolated != null && !isolatedRow;
                  const color =
                     programColors.get(p.esfaer_id) ?? getGroupColor(p.grupo);
                  return (
                     <ProgramRow
                        key={p.esfaer_id}
                        programa={p}
                        color={color}
                        checked={checked}
                        isolated={isolatedRow}
                        dimmed={dimmed}
                        onToggle={() => onTogglePrograma(p.esfaer_id)}
                        onIsolate={() => onIsolate(p.esfaer_id)}
                     />
                  );
               })
            )}
         </div>
      </div>
   );
}
