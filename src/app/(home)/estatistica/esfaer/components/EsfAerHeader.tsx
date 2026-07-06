"use client";

import { Button, Checkbox, Label, Select } from "flowbite-react";
import Link from "next/link";
import { HiOutlineUpload } from "react-icons/hi";
import { TbChartAreaLine, TbHistory } from "react-icons/tb";
import { YEAR_OPTIONS } from "../constants";
import { PermBased } from "../../../hooks/usePermBased";

interface EsfAerHeaderProps {
   anoRef: number;
   onAnoRefChange: (ano: number) => void;
   showSimulador: boolean;
   onShowSimuladorChange: (value: boolean) => void;
   onImport: () => void;
}

export function EsfAerHeader({
   anoRef,
   onAnoRefChange,
   showSimulador,
   onShowSimuladorChange,
   onImport,
}: EsfAerHeaderProps) {
   return (
      <header className="relative overflow-hidden rounded border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
         <span
            aria-hidden
            className="absolute top-0 left-0 h-full w-1 bg-red-600"
         />

         <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
               <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-red-50 text-red-600 ring-1 ring-red-100 ring-inset">
                  <TbChartAreaLine className="h-6 w-6" />
               </div>
               <div className="min-w-0">
                  <span className="block font-mono text-[10px] font-bold tracking-[0.3em] text-red-500 uppercase">
                     Estatística
                  </span>
                  <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                     Esforço Aéreo
                  </h1>
               </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
               <Button
                  as={Link}
                  href="/estatistica/esfaer/historico"
                  color="light"
                  size="sm"
                  className="font-semibold whitespace-nowrap"
               >
                  <TbHistory className="mr-2 h-4 w-4" />
                  Histórico
               </Button>

               <div className="flex items-center gap-1.5">
                  <Checkbox
                     id="showSimulador"
                     checked={showSimulador}
                     color="red"
                     onChange={(e) => onShowSimuladorChange(e.target.checked)}
                  />
                  <Label
                     htmlFor="showSimulador"
                     className="cursor-pointer text-sm text-gray-600"
                  >
                     Exibir simulador
                  </Label>
               </div>

               <PermBased resource="esfaer" requiredPerm="create">
                  <Button
                     color="red"
                     size="sm"
                     onClick={onImport}
                     className="font-semibold whitespace-nowrap"
                  >
                     <HiOutlineUpload className="mr-2 h-4 w-4" />
                     Importar
                  </Button>
               </PermBased>

               <div className="flex items-center gap-2">
                  <Label htmlFor="anoRef" className="font-medium text-gray-700">
                     Ano Referência
                  </Label>
                  <Select
                     id="anoRef"
                     value={anoRef}
                     onChange={(e) => onAnoRefChange(Number(e.target.value))}
                     className="w-24"
                  >
                     {YEAR_OPTIONS.map((year) => (
                        <option key={year} value={year}>
                           {year}
                        </option>
                     ))}
                  </Select>
               </div>
            </div>
         </div>
      </header>
   );
}
