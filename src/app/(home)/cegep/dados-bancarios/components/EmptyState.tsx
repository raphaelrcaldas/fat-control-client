import { HiOfficeBuilding } from "react-icons/hi";

interface EmptyStateProps {
   search: string;
   onClear: () => void;
}

export function EmptyState({ search, onClear }: EmptyStateProps) {
   return (
      <div className="flex h-64 flex-col items-center justify-center rounded border border-dashed border-slate-300 bg-slate-50 text-center">
         <HiOfficeBuilding className="mb-4 h-16 w-16 text-slate-400" />
         <p className="text-sm font-semibold text-slate-600">
            {search
               ? "Nenhum resultado encontrado"
               : "Nenhum dado bancário cadastrado"}
         </p>
         {search && (
            <button
               type="button"
               onClick={onClear}
               className="text-primary-600 hover:text-primary-700 mt-2 text-sm"
            >
               Limpar busca
            </button>
         )}
      </div>
   );
}
