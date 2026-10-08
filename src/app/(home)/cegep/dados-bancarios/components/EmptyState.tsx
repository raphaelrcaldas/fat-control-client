import { Button } from "flowbite-react";
import { HiOfficeBuilding, HiPlus, HiSearch } from "react-icons/hi";
import { PermBased } from "@/app/(home)/hooks/usePermBased";

interface EmptyStateProps {
   search: string;
   onClear: () => void;
   onCreate: () => void;
}

export function EmptyState({ search, onClear, onCreate }: EmptyStateProps) {
   return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 rounded border border-dashed border-slate-300 bg-slate-50 text-center">
         {search ? (
            <HiSearch className="h-16 w-16 text-slate-400" />
         ) : (
            <HiOfficeBuilding className="h-16 w-16 text-slate-400" />
         )}
         <div className="space-y-1 px-4">
            <p className="text-sm font-semibold break-words text-slate-600">
               {search
                  ? `Nenhum resultado para “${search}”`
                  : "Nenhum dado bancário cadastrado"}
            </p>
            {search && (
               <p className="text-xs text-slate-500">
                  Tente o nome de guerra ou parte do nome completo.
               </p>
            )}
         </div>
         {search ? (
            <Button color="light" size="sm" onClick={onClear}>
               Limpar busca
            </Button>
         ) : (
            <PermBased resource="cegep.dados_bancarios" requiredPerm="create">
               <Button color="primary" size="sm" onClick={onCreate}>
                  <HiPlus className="mr-2 h-4 w-4" />
                  Cadastrar
               </Button>
            </PermBased>
         )}
      </div>
   );
}
