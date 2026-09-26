"use client";

import { memo } from "react";
import { Label, Select, TextInput } from "flowbite-react";
import { MdSearch } from "react-icons/md";
import { MultiSelect } from "@/components/MultiSelect";
import { SearchableSelect } from "@/components/SearchableSelect";
import { useFuncoes } from "@/hooks/queries";
import { DateFilterInput } from "./DateFilterInput";

interface SelectOption {
   value: string;
   label: string;
}

interface EtapasFilterPanelProps {
   urlDataIni: string;
   urlDataFim: string;
   urlAnv: string[];
   urlTipoMissao: string[];
   urlEsfAerId: string;
   filterOrigem: string;
   setFilterOrigem: (v: string) => void;
   filterDestino: string;
   setFilterDestino: (v: string) => void;
   filterTrip: string;
   setFilterTrip: (v: string) => void;
   filterFuncao: string;
   onFuncaoChange: (v: string) => void;
   onEsfAerChange: (v: string) => void;
   esfAerOptions: SelectOption[];
   aeronaveOptions: SelectOption[];
   tipoMissaoOptions: SelectOption[];
   onDataIniChange: (v: string) => boolean;
   onDataFimChange: (v: string) => boolean;
   onMultiSelectChange: (key: string, values: string[]) => void;
}

export const EtapasFilterPanel = memo(function EtapasFilterPanel({
   urlDataIni,
   urlDataFim,
   urlAnv,
   urlTipoMissao,
   urlEsfAerId,
   filterOrigem,
   setFilterOrigem,
   filterDestino,
   setFilterDestino,
   filterTrip,
   setFilterTrip,
   filterFuncao,
   onFuncaoChange,
   onEsfAerChange,
   esfAerOptions,
   aeronaveOptions,
   tipoMissaoOptions,
   onDataIniChange,
   onDataFimChange,
   onMultiSelectChange,
}: EtapasFilterPanelProps) {
   const { funcoes } = useFuncoes();

   return (
      <div
         id="filtros-panel"
         className="border-t border-gray-200 bg-gray-50 p-4"
      >
         {/* Grid de 6 colunas SO no mobile, onde o `flex-wrap` acomodava os
             campos pela largura fixa de cada um e produzia linhas
             desbalanceadas (origem sozinha ao lado das datas, tripulante
             espremido ao lado do tipo de missao). Seis divide exato por 2 e
             por 3, que sao as duas unicas divisoes usadas aqui.

             A partir do `sm` volta tudo ao flex-wrap com as larguras fixas:
             ali a acomodacao automatica funciona e o grid so engessaria. Por
             isso cada campo carrega `col-span-*` e o `sm:col-auto` que o
             desliga. */}
         <div className="grid grid-cols-6 gap-2 sm:flex sm:flex-wrap">
            <div className="col-span-3 sm:col-auto sm:w-32">
               <Label
                  htmlFor="filtro-data-ini"
                  className="mb-1 block text-xs font-medium text-gray-700"
               >
                  Data inicial
               </Label>
               <DateFilterInput
                  id="filtro-data-ini"
                  value={urlDataIni}
                  max={urlDataFim}
                  onCommit={onDataIniChange}
               />
            </div>

            <div className="col-span-3 sm:col-auto sm:w-32">
               <Label
                  htmlFor="filtro-data-fim"
                  className="mb-1 block text-xs font-medium text-gray-700"
               >
                  Data final
               </Label>
               <DateFilterInput
                  id="filtro-data-fim"
                  value={urlDataFim}
                  min={urlDataIni}
                  onCommit={onDataFimChange}
               />
            </div>

            <div className="col-span-2 sm:col-auto sm:w-20">
               <Label
                  htmlFor="filtro-origem"
                  className="mb-1 block text-xs font-medium text-gray-700"
               >
                  Origem
               </Label>
               <TextInput
                  id="filtro-origem"
                  placeholder="SBPA"
                  value={filterOrigem}
                  onChange={(e) =>
                     setFilterOrigem(e.target.value.slice(0, 4).toUpperCase())
                  }
                  sizing="sm"
                  maxLength={4}
               />
            </div>

            <div className="col-span-2 sm:col-auto sm:w-20">
               <Label
                  htmlFor="filtro-destino"
                  className="mb-1 block text-xs font-medium text-gray-700"
               >
                  Destino
               </Label>
               <TextInput
                  id="filtro-destino"
                  placeholder="SBBE"
                  value={filterDestino}
                  onChange={(e) =>
                     setFilterDestino(e.target.value.slice(0, 4).toUpperCase())
                  }
                  sizing="sm"
                  maxLength={4}
               />
            </div>

            <div className="col-span-2 sm:col-auto sm:w-28">
               <Label className="mb-1 block text-xs font-medium text-gray-700">
                  Aeronave
               </Label>
               <MultiSelect
                  options={aeronaveOptions}
                  selected={urlAnv}
                  onChange={(values) => onMultiSelectChange("anv", values)}
                  placeholder="Todas"
                  sizing="sm"
                  ariaLabel="Aeronave"
               />
            </div>

            <div className="col-span-6 sm:col-auto sm:w-72">
               <Label
                  htmlFor="filtro-esf-aer"
                  className="mb-1 block text-xs font-medium text-gray-700"
               >
                  Esforço Aéreo
               </Label>
               <SearchableSelect
                  id="filtro-esf-aer"
                  options={esfAerOptions}
                  value={urlEsfAerId}
                  onChange={onEsfAerChange}
                  placeholder="Todos"
                  sizing="sm"
                  clearable
               />
            </div>

            <div className="col-span-6 sm:col-auto sm:w-52">
               <Label className="mb-1 block text-xs font-medium text-gray-700">
                  Tipo de Missão
               </Label>
               <MultiSelect
                  options={tipoMissaoOptions}
                  selected={urlTipoMissao}
                  onChange={(values) =>
                     onMultiSelectChange("tipo_missao_cod", values)
                  }
                  placeholder="Todos"
                  sizing="sm"
                  ariaLabel="Tipo de missão"
               />
            </div>

            <div className="col-span-6 sm:col-auto sm:flex-1">
               <Label
                  htmlFor="filtro-trip-search"
                  className="mb-1 block text-xs font-medium text-gray-700"
               >
                  Tripulante
               </Label>
               <div className="focus-within:border-primary-500 focus-within:ring-primary-500 flex overflow-hidden rounded border border-gray-300 bg-white focus-within:ring-2">
                  <Select
                     value={filterFuncao}
                     onChange={(e) => onFuncaoChange(e.target.value)}
                     disabled={!filterTrip}
                     aria-label="Função do tripulante"
                     title={
                        filterTrip
                           ? "Restringe a busca à função selecionada"
                           : "Digite um trigrama ou nome para filtrar por função"
                     }
                     sizing="sm"
                     className="[&_select]:w-16 [&_select]:rounded-none [&_select]:border-0 [&_select]:border-r [&_select]:border-gray-300 [&_select]:bg-transparent [&_select]:shadow-none [&_select]:focus:border-gray-300 [&_select]:focus:ring-0 [&_select]:disabled:cursor-not-allowed [&_select]:disabled:opacity-50"
                  >
                     <option value="">--</option>
                     {funcoes.map((f) => (
                        <option key={f.cod} value={f.cod}>
                           {f.cod.toUpperCase()}
                        </option>
                     ))}
                  </Select>
                  <TextInput
                     id="filtro-trip-search"
                     icon={MdSearch}
                     placeholder="Buscar trigrama ou nome de guerra ..."
                     value={filterTrip}
                     onChange={(e) => setFilterTrip(e.target.value)}
                     sizing="sm"
                     className="flex-1 [&_input]:rounded-none [&_input]:border-0 [&_input]:bg-transparent [&_input]:shadow-none [&_input]:focus:border-0 [&_input]:focus:ring-0"
                  />
               </div>
            </div>
         </div>
      </div>
   );
});
