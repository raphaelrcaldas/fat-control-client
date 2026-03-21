"use client";

import { Label, TextInput } from "flowbite-react";
import { MdSearch } from "react-icons/md";
import { MultiSelect } from "@/components/MultiSelect";
import { SearchableSelect } from "@/components/SearchableSelect";

interface SelectOption {
   value: string;
   label: string;
}

interface EtapasFilterPanelProps {
   urlDataIni: string;
   urlDataFim: string;
   urlAnv: string[];
   urlTipoMissao: string[];
   filterOrigem: string;
   setFilterOrigem: (v: string) => void;
   filterDestino: string;
   setFilterDestino: (v: string) => void;
   filterTrip: string;
   setFilterTrip: (v: string) => void;
   filterEsfAer: string;
   setFilterEsfAer: (v: string) => void;
   esfAerOptions: SelectOption[];
   aeronaveOptions: SelectOption[];
   tipoMissaoOptions: SelectOption[];
   onDataIniChange: (v: string) => void;
   onDataFimChange: (v: string) => void;
   onMultiSelectChange: (key: string, values: string[]) => void;
}

export function EtapasFilterPanel({
   urlDataIni,
   urlDataFim,
   urlAnv,
   urlTipoMissao,
   filterOrigem,
   setFilterOrigem,
   filterDestino,
   setFilterDestino,
   filterTrip,
   setFilterTrip,
   filterEsfAer,
   setFilterEsfAer,
   esfAerOptions,
   aeronaveOptions,
   tipoMissaoOptions,
   onDataIniChange,
   onDataFimChange,
   onMultiSelectChange,
}: EtapasFilterPanelProps) {
   return (
      <div
         id="filtros-panel"
         className="border-t border-gray-200 bg-gray-50 p-4"
      >
         <div className="flex flex-wrap gap-2">
            <div className="w-32">
               <Label className="mb-1 block text-xs font-medium text-gray-700">
                  Data inicial
               </Label>
               <TextInput
                  type="date"
                  value={urlDataIni}
                  onChange={(e) => onDataIniChange(e.target.value)}
                  sizing="sm"
               />
            </div>

            <div className="w-32">
               <Label className="mb-1 block text-xs font-medium text-gray-700">
                  Data final
               </Label>
               <TextInput
                  type="date"
                  value={urlDataFim}
                  onChange={(e) => onDataFimChange(e.target.value)}
                  sizing="sm"
               />
            </div>

            <div className="w-20">
               <Label className="mb-1 block text-xs font-medium text-gray-700">
                  Origem
               </Label>
               <TextInput
                  placeholder="SBPA"
                  value={filterOrigem}
                  onChange={(e) =>
                     setFilterOrigem(e.target.value.slice(0, 4).toUpperCase())
                  }
                  sizing="sm"
                  maxLength={4}
               />
            </div>

            <div className="w-20">
               <Label className="mb-1 block text-xs font-medium text-gray-700">
                  Destino
               </Label>
               <TextInput
                  placeholder="SBBE"
                  value={filterDestino}
                  onChange={(e) =>
                     setFilterDestino(e.target.value.slice(0, 4).toUpperCase())
                  }
                  sizing="sm"
                  maxLength={4}
               />
            </div>

            <div className="w-44">
               <Label className="mb-1 block text-xs font-medium text-gray-700">
                  Aeronave
               </Label>
               <MultiSelect
                  options={aeronaveOptions}
                  selected={urlAnv}
                  onChange={(values) => onMultiSelectChange("anv", values)}
                  placeholder="Todas"
                  sizing="sm"
               />
            </div>

            <div className="w-72">
               <Label className="mb-1 block text-xs font-medium text-gray-700">
                  Esforço Aéreo
               </Label>
               <SearchableSelect
                  options={esfAerOptions}
                  value={filterEsfAer}
                  onChange={setFilterEsfAer}
                  placeholder="Todos"
                  sizing="sm"
                  clearable
               />
            </div>

            <div className="w-52">
               <Label className="mb-1 block text-xs font-medium text-gray-700">
                  Tipo de Missao
               </Label>
               <MultiSelect
                  options={tipoMissaoOptions}
                  selected={urlTipoMissao}
                  onChange={(values) =>
                     onMultiSelectChange("tipo_missao_cod", values)
                  }
                  placeholder="Todos"
                  sizing="sm"
               />
            </div>

            <div className="flex-1">
               <Label className="mb-1 block text-xs font-medium text-gray-700">
                  Tripulante
               </Label>
               <TextInput
                  icon={MdSearch}
                  placeholder="Buscar trigrama ou nome de guerra ..."
                  value={filterTrip}
                  onChange={(e) => setFilterTrip(e.target.value)}
                  sizing="sm"
               />
            </div>
         </div>
      </div>
   );
}
