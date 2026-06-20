import { TextInput, Label } from "flowbite-react";
import { minutesToTime } from "@/../utils/dateHandler";
import Field from "./Field";
import type { SessaoForm } from "../hooks/useSessaoForm";

export default function SessaoDadosFields({ form }: { form: SessaoForm }) {
   const {
      data,
      setData,
      origem,
      setOrigem,
      destino,
      setDestino,
      pousos,
      setPousos,
      dep,
      setDep,
      arr,
      setArr,
      tvoo,
      tvooValid,
      crossesDay,
   } = form;

   const tvooColor =
      !dep || !arr
         ? "border-slate-200 bg-gray-50 text-gray-400"
         : crossesDay
           ? "border-red-200 bg-red-50 text-red-700"
           : tvooValid
             ? "border-green-200 bg-green-50 text-green-700"
             : "border-amber-200 bg-amber-50 text-amber-700";

   return (
      <div className="space-y-3 rounded border border-slate-200 bg-gray-50 p-4 shadow-sm">
         <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field id="ses-data" label="Data">
               <TextInput
                  id="ses-data"
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  sizing="sm"
                  required
               />
            </Field>
            <Field id="ses-origem" label="Origem">
               <TextInput
                  id="ses-origem"
                  placeholder="ICAO"
                  value={origem}
                  onChange={(e) =>
                     setOrigem(e.target.value.slice(0, 4).toUpperCase())
                  }
                  sizing="sm"
                  maxLength={4}
                  className="uppercase"
                  required
               />
            </Field>
            <Field id="ses-destino" label="Destino">
               <TextInput
                  id="ses-destino"
                  placeholder="ICAO"
                  value={destino}
                  onChange={(e) =>
                     setDestino(e.target.value.slice(0, 4).toUpperCase())
                  }
                  sizing="sm"
                  maxLength={4}
                  className="uppercase"
                  required
               />
            </Field>
            <Field id="ses-pousos" label="Pousos">
               <TextInput
                  id="ses-pousos"
                  type="number"
                  value={pousos}
                  onChange={(e) =>
                     setPousos(Math.max(0, Number(e.target.value)))
                  }
                  sizing="sm"
                  min={0}
               />
            </Field>
         </div>

         <div className="grid grid-cols-3 gap-3">
            <Field id="ses-dep" label="DEP">
               <TextInput
                  id="ses-dep"
                  type="time"
                  value={dep}
                  onChange={(e) => setDep(e.target.value)}
                  sizing="sm"
                  required
               />
            </Field>
            <Field id="ses-arr" label="ARR">
               <TextInput
                  id="ses-arr"
                  type="time"
                  value={arr}
                  onChange={(e) => setArr(e.target.value)}
                  sizing="sm"
                  required
               />
            </Field>
            <div className="flex flex-col gap-1">
               <Label>T.Voo</Label>
               <div
                  className={`flex items-center justify-center rounded border px-3 py-1.5 font-mono text-sm font-bold ${tvooColor}`}
               >
                  {crossesDay
                     ? "ATRAVESSA DIA"
                     : dep && arr
                       ? minutesToTime(tvoo)
                       : "—"}
               </div>
               {crossesDay && (
                  <span className="text-xs text-red-600">
                     Use 00:00 como fim do dia
                  </span>
               )}
               {dep && arr && !crossesDay && !tvooValid && tvoo > 0 && (
                  <span className="text-xs text-amber-600">
                     Múltiplo de 5 min
                  </span>
               )}
            </div>
         </div>
      </div>
   );
}
