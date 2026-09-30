import clsx from "clsx";
import { Label } from "flowbite-react";
import { useFuncoes } from "@/hooks/queries";
import type { EscalaFiltersState } from "../../types";

interface FuncChipsProps {
   value: EscalaFiltersState;
   onChange: (next: EscalaFiltersState) => void;
   disabled?: boolean;
}

export function FuncChips({
   value,
   onChange,
   disabled = false,
}: FuncChipsProps) {
   const { principais, isLoading, isError, refetch } = useFuncoes();

   const toggleFunc = (f: string) => {
      const next = value.funcs.includes(f)
         ? value.funcs.filter((x) => x !== f)
         : [...value.funcs, f];
      onChange({ ...value, funcs: next });
   };

   return (
      <div className="md:col-span-12">
         <Label className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">
            Funções
         </Label>
         {isLoading ? (
            <div role="status" className="mt-1 flex flex-wrap gap-1.5">
               <span className="sr-only">Carregando funções…</span>
               {[0, 1, 2, 3, 4].map((i) => (
                  <div
                     key={i}
                     aria-hidden
                     className="h-6.5 w-14 animate-pulse rounded bg-slate-200"
                  />
               ))}
            </div>
         ) : isError ? (
            <p role="alert" className="mt-1 text-xs text-red-700">
               Não foi possível carregar as funções.{" "}
               <button
                  type="button"
                  onClick={() => refetch()}
                  className="font-semibold underline underline-offset-2"
               >
                  Tentar novamente
               </button>
            </p>
         ) : (
            <div className="mt-1 flex flex-wrap gap-1.5">
               {principais.map(({ cod, nome_curto }) => {
                  const checked = value.funcs.includes(cod);
                  return (
                     <button
                        key={cod}
                        type="button"
                        onClick={() => toggleFunc(cod)}
                        disabled={disabled}
                        aria-pressed={checked}
                        className={clsx(
                           // Chip de seleção segue o tema da org (`primary-*`):
                           // `red-*` fica reservado a perigo/exclusão, e cravado
                           // virava a única mancha vermelha numa org de tema
                           // azul. Hover sob `pointer-fine` porque no dedo o
                           // estado gruda depois do toque.
                           // Anel de foco em slate-900 com offset, não em
                           // `primary-*`: no chip SELECIONADO o preenchimento já é
                           // primary, e o anel padrão sumia — medido, a diferença
                           // de pixel entre focado e não-focado era ZERO. O offset
                           // joga o anel sobre o branco da página, então serve aos
                           // dois estados.
                           "inline-flex items-center justify-center gap-1.5 rounded-md border px-2.5 py-1 transition-colors select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:opacity-50",
                           checked
                              ? "border-primary-700 bg-primary-600 pointer-fine:hover:bg-primary-700 text-white shadow-sm"
                              : "border-slate-300 bg-white text-slate-700 pointer-fine:hover:border-slate-400 pointer-fine:hover:bg-slate-50"
                        )}
                     >
                        <span className="font-mono text-[10px] font-bold tracking-widest uppercase">
                           {nome_curto}
                        </span>
                     </button>
                  );
               })}
            </div>
         )}
      </div>
   );
}
