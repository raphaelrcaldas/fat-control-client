import { TextInput } from "flowbite-react";
import { HiSearch, HiX } from "react-icons/hi";

interface DadosBancariosToolbarProps {
   search: string;
   onSearchChange: (value: string) => void;
   total: number;
   isLoading: boolean;
   isError: boolean;
}

export function DadosBancariosToolbar({
   search,
   onSearchChange,
   total,
   isLoading,
   isError,
}: DadosBancariosToolbarProps) {
   return (
      <div className="flex items-center gap-3 rounded border border-slate-200 bg-white p-3 shadow-sm">
         <div className="relative min-w-0 flex-1">
            <TextInput
               id="dados-bancarios-busca"
               type="text"
               icon={HiSearch}
               aria-label="Buscar militar por nome de guerra ou nome completo"
               placeholder="Buscar militar..."
               value={search}
               onChange={(e) => onSearchChange(e.target.value)}
               onKeyDown={(e) => {
                  if (e.key === "Escape" && search) onSearchChange("");
               }}
               autoComplete="off"
               // Espaço para o botão de limpar; vai em `input.base` porque o
               // `withIcon.on` é o `pl-10` da lupa (ver ProgramRail).
               theme={{ field: { input: { base: "pr-9" } } }}
            />
            {search && (
               <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  aria-label="Limpar busca"
                  className="absolute inset-y-0 right-0 flex w-8 items-center justify-center text-slate-500 hover:text-slate-700"
               >
                  <HiX className="h-4 w-4" />
               </button>
            )}
         </div>

         <span className="shrink-0 text-sm text-slate-600">
            Total:{" "}
            {isLoading ? (
               <span className="inline-block h-4 w-6 animate-pulse rounded bg-slate-200 align-middle" />
            ) : isError ? (
               // Falha de carga não é "0 registros".
               <strong className="text-slate-900">—</strong>
            ) : (
               <strong className="text-slate-900 tabular-nums">{total}</strong>
            )}
         </span>
      </div>
   );
}
