"use client";

import { Label, Select, TextInput } from "flowbite-react";
import { HiFilter, HiSearch } from "react-icons/hi";

interface LogsFiltersProps {
   searchTerm: string;
   onSearchChange: (value: string) => void;
   actionFilter: string;
   onActionChange: (value: string) => void;
   dateStart: string;
   onDateStartChange: (value: string) => void;
   dateEnd: string;
   onDateEndChange: (value: string) => void;
}

export function LogsFilters({
   searchTerm,
   onSearchChange,
   actionFilter,
   onActionChange,
   dateStart,
   onDateStartChange,
   dateEnd,
   onDateEndChange,
}: LogsFiltersProps) {
   return (
      <div className="space-y-3 rounded border border-slate-200 bg-white p-4 shadow-sm">
         <div className="flex items-center gap-2">
            <HiFilter className="text-gray-600" />
            <h2 className="font-medium text-gray-700">Filtros</h2>
         </div>
         <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <TextInput
               icon={HiSearch}
               aria-label="Buscar por nome de guerra ou nome completo"
               placeholder="Buscar por nome de guerra ou completo..."
               value={searchTerm}
               onChange={(e) => onSearchChange(e.target.value)}
            />
            <Select
               value={actionFilter}
               aria-label="Filtrar por ação"
               onChange={(e) => onActionChange(e.target.value)}
            >
               <option value="login">Login</option>
               <option value="logout">Logout</option>
               <option value="create">Criar</option>
               <option value="update">Atualizar</option>
               <option value="delete">Deletar</option>
               <option value="">Todas as ações</option>
            </Select>
            <div className="flex items-center gap-2">
               <Label
                  htmlFor="logs-date-start"
                  className="shrink-0 text-sm text-gray-500"
               >
                  De
               </Label>
               <TextInput
                  id="logs-date-start"
                  type="date"
                  className="w-full"
                  value={dateStart}
                  max={dateEnd || undefined}
                  onChange={(e) => onDateStartChange(e.target.value)}
               />
            </div>
            <div className="flex items-center gap-2">
               <Label
                  htmlFor="logs-date-end"
                  className="shrink-0 text-sm text-gray-500"
               >
                  Até
               </Label>
               <TextInput
                  id="logs-date-end"
                  type="date"
                  className="w-full"
                  value={dateEnd}
                  min={dateStart || undefined}
                  onChange={(e) => onDateEndChange(e.target.value)}
               />
            </div>
         </div>
      </div>
   );
}
