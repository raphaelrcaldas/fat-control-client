import { Label, Select } from "flowbite-react";
import { GiJoystick } from "react-icons/gi";

interface SimuladorHeaderProps {
   anoRef: number;
   yearOptions: number[];
   onAnoChange: (ano: number) => void;
}

export default function SimuladorHeader({
   anoRef,
   yearOptions,
   onAnoChange,
}: SimuladorHeaderProps) {
   return (
      <header className="relative overflow-hidden rounded border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
         <span
            aria-hidden
            className="bg-primary-600 absolute top-0 left-0 h-full w-1"
         />

         <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
               <div className="bg-primary-50 text-primary-600 ring-primary-100 grid h-12 w-12 shrink-0 place-items-center rounded-md ring-1 ring-inset">
                  <GiJoystick className="h-6 w-6" />
               </div>
               <div className="min-w-0">
                  <span className="text-primary-600 block font-mono text-[10px] font-bold tracking-[0.3em] uppercase">
                     Instrução
                  </span>
                  <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                     Simulador de Voo
                  </h1>
               </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
               <Label htmlFor="anoRef" className="font-medium text-gray-700">
                  Ano Referência:
               </Label>
               <Select
                  id="anoRef"
                  value={anoRef}
                  onChange={(e) => onAnoChange(Number(e.target.value))}
                  className="w-24"
               >
                  {yearOptions.map((year) => (
                     <option key={year} value={year}>
                        {year}
                     </option>
                  ))}
               </Select>
            </div>
         </div>
      </header>
   );
}
