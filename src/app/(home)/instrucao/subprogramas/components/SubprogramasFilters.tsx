"use client";

import clsx from "clsx";
import type { ReactNode } from "react";
import { TextInput } from "flowbite-react";
import { IoMdSearch } from "react-icons/io";
import { MdClose } from "react-icons/md";
import type {
   Subprograma,
   TipoSubprograma,
} from "services/routes/instrucao/subprogramas";

export interface SubprogramasFiltersState {
   q: string;
   tipo: TipoSubprograma | null;
   func: string | null;
}

export const FILTROS_VAZIOS: SubprogramasFiltersState = {
   q: "",
   tipo: null,
   func: null,
};

interface Props {
   value: SubprogramasFiltersState;
   onChange: (next: SubprogramasFiltersState) => void;
   /** Lista completa da unidade — as opções saem dela, não de constante. */
   subprogramas: Subprograma[];
   /** Quantos sobraram depois do filtro. */
   visiveis: number;
}

export function SubprogramasFilters({
   value,
   onChange,
   subprogramas,
   visiveis,
}: Props) {
   function patch(p: Partial<SubprogramasFiltersState>) {
      onChange({ ...value, ...p });
   }

   // Só entra no filtro o que existe no cadastro: tipo sem subprograma
   // nenhum vira botão que zera a lista, e função idem.
   const tipos = contar(subprogramas, (s) => s.tipo);
   const funcs = contar(subprogramas, (s) => s.func);

   const temFiltro =
      value.q.trim() !== "" || value.tipo !== null || value.func !== null;

   return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded border border-slate-200 bg-slate-50/70 p-2">
         <div className="w-full sm:w-72">
            <TextInput
               icon={IoMdSearch}
               placeholder="buscar por código ou descrição…"
               value={value.q}
               onChange={(e) => patch({ q: e.target.value })}
               sizing="sm"
            />
         </div>

         <span className="hidden h-7 w-px bg-slate-200 lg:block" aria-hidden />

         <Grupo rotulo="Tipo">
            <Chip
               active={value.tipo === null}
               onClick={() => patch({ tipo: null })}
            >
               Todos
            </Chip>
            {tipos.map(([tipo, n]) => (
               <Chip
                  key={tipo}
                  active={value.tipo === tipo}
                  onClick={() =>
                     patch({ tipo: value.tipo === tipo ? null : tipo })
                  }
                  count={n}
               >
                  {tipo}
               </Chip>
            ))}
         </Grupo>

         <span className="hidden h-7 w-px bg-slate-200 lg:block" aria-hidden />

         <Grupo rotulo="Função">
            <Chip
               active={value.func === null}
               onClick={() => patch({ func: null })}
            >
               Todas
            </Chip>
            {funcs.map(([func, n]) => (
               <Chip
                  key={func}
                  active={value.func === func}
                  onClick={() =>
                     patch({ func: value.func === func ? null : func })
                  }
                  count={n}
               >
                  <span className="font-mono uppercase">{func}</span>
               </Chip>
            ))}
         </Grupo>

         <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-slate-500 tabular-nums">
               {visiveis} de {subprogramas.length}
            </span>
            {temFiltro && (
               <button
                  type="button"
                  onClick={() => onChange(FILTROS_VAZIOS)}
                  className="flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 hover:text-slate-800 pointer-coarse:min-h-[44px]"
               >
                  <MdClose className="size-3.5" />
                  Limpar
               </button>
            )}
         </div>
      </div>
   );
}

/** Contagem por chave, mais frequente primeiro (empate: ordem alfabética). */
function contar<T extends string>(
   subprogramas: Subprograma[],
   chave: (s: Subprograma) => T
): [T, number][] {
   const mapa = new Map<T, number>();
   for (const subprograma of subprogramas) {
      const k = chave(subprograma);
      mapa.set(k, (mapa.get(k) ?? 0) + 1);
   }
   return [...mapa.entries()].sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
   );
}

function Grupo({ rotulo, children }: { rotulo: string; children: ReactNode }) {
   return (
      <div className="flex w-full items-center gap-1.5 sm:w-auto">
         <span className="shrink-0 font-mono text-[9px] font-bold tracking-[0.2em] text-slate-500 uppercase">
            {rotulo}
         </span>
         <div className="flex flex-1 items-center gap-0.5 overflow-x-auto rounded-md bg-slate-200/70 p-0.5 sm:flex-initial">
            {children}
         </div>
      </div>
   );
}

function Chip({
   active,
   count,
   onClick,
   children,
}: {
   active: boolean;
   count?: number;
   onClick: () => void;
   children: ReactNode;
}) {
   return (
      <button
         type="button"
         onClick={onClick}
         className={clsx(
            "flex shrink-0 items-center gap-1 rounded px-2 py-1 text-xs font-semibold whitespace-nowrap transition-colors pointer-coarse:min-h-[44px]",
            active
               ? "bg-white text-slate-900 shadow-sm"
               : "text-slate-600 hover:text-slate-900"
         )}
      >
         {children}
         {count !== undefined && (
            <span
               className={clsx(
                  "rounded-full px-1 text-[10px] font-bold tabular-nums",
                  active ? "bg-slate-100 text-slate-600" : "text-slate-500"
               )}
            >
               {count}
            </span>
         )}
      </button>
   );
}
