"use client";

import { Select, TextInput } from "flowbite-react";
import { HiFilter, HiSearch } from "react-icons/hi";

interface LogsFiltersProps {
   searchTerm: string;
   onSearchChange: (value: string) => void;
   actionFilter: string;
   onActionChange: (value: string) => void;
}

export function LogsFilters({
   searchTerm,
   onSearchChange,
   actionFilter,
   onActionChange,
}: LogsFiltersProps) {
   return (
      <div className="space-y-3 rounded border border-slate-200 bg-white p-4 shadow-sm">
         <div className="flex items-center gap-2">
            <HiFilter className="text-gray-600" />
            <h3 className="font-medium text-gray-700">Filtros</h3>
         </div>
         <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <TextInput
               icon={HiSearch}
               placeholder="Buscar por usuário, data ou ação..."
               value={searchTerm}
               onChange={(e) => onSearchChange(e.target.value)}
            />
            <Select
               value={actionFilter}
               disabled
               onChange={(e) => onActionChange(e.target.value)}
            >
               <option value="login">Login</option>
               <option value="logout">Logout</option>
               <option value="create">Criar</option>
               <option value="update">Atualizar</option>
               <option value="delete">Deletar</option>
               <option value="">Todas as ações</option>
            </Select>
         </div>
      </div>
   );
}
