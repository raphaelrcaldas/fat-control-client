"use client";

import { Label, Select, TextInput } from "flowbite-react";
import { HiSearch } from "react-icons/hi";

interface SimuladorFilterPanelProps {
   anoRef: number;
   yearOptions: number[];
   filterPiloto: string;
   onAnoChange: (value: string) => void;
   onPilotoChange: (value: string) => void;
}

export function SimuladorFilterPanel({
   anoRef,
   yearOptions,
   filterPiloto,
   onAnoChange,
   onPilotoChange,
}: SimuladorFilterPanelProps) {
   return (
      <div
         id="filtros-panel"
         className="border-t border-gray-200 bg-gray-50 p-4"
      >
         <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
            <div className="sm:w-32">
               <Label
                  htmlFor="simulador-ano"
                  className="mb-1 block text-xs font-medium text-gray-700"
               >
                  Ano
               </Label>
               <Select
                  id="simulador-ano"
                  value={anoRef}
                  onChange={(event) => onAnoChange(event.target.value)}
                  sizing="sm"
               >
                  {yearOptions.map((year) => (
                     <option key={year} value={year}>
                        {year}
                     </option>
                  ))}
               </Select>
            </div>

            <div className="sm:min-w-72 sm:flex-1">
               <Label
                  htmlFor="simulador-piloto"
                  className="mb-1 block text-xs font-medium text-gray-700"
               >
                  Piloto
               </Label>
               <TextInput
                  id="simulador-piloto"
                  icon={HiSearch}
                  placeholder="Nome de guerra ou trigrama"
                  value={filterPiloto}
                  onChange={(event) => onPilotoChange(event.target.value)}
                  sizing="sm"
               />
            </div>
         </div>
      </div>
   );
}
