"use client";

import { Label, Select, TextInput, Textarea } from "flowbite-react";
import { INDISP_OPTIONS } from "@/constants/ops/indisponibilidades";
import type { IndispFormValues } from "../hooks/useIndispFormState";

interface IndispFormFieldsProps {
   values: IndispFormValues;
   setField: <K extends keyof IndispFormValues>(
      field: K,
      value: IndispFormValues[K]
   ) => void;
   readOnly: boolean;
}

export function IndispFormFields({
   values,
   setField,
   readOnly,
}: IndispFormFieldsProps) {
   return (
      <div className="grid gap-5">
         <div className="grid gap-2">
            <Label htmlFor="mtv" className="font-semibold text-gray-700">
               Motivo <span className="text-red-500">*</span>
            </Label>
            <Select
               id="mtv"
               className="w-full"
               value={values.mtv}
               onChange={(e) => setField("mtv", e.target.value)}
               required
               disabled={readOnly}
            >
               <option value="" disabled>
                  Selecione um motivo
               </option>
               {INDISP_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                     {item.label}
                  </option>
               ))}
            </Select>
         </div>

         <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
               <Label
                  htmlFor="date_start"
                  className="font-semibold text-gray-700"
               >
                  Data de Início <span className="text-red-500">*</span>
               </Label>
               <TextInput
                  id="date_start"
                  type="date"
                  value={values.dateStart}
                  onChange={(e) => setField("dateStart", e.target.value)}
                  required
                  disabled={readOnly}
               />
            </div>
            <div className="grid gap-2">
               <Label
                  htmlFor="date_end"
                  className="font-semibold text-gray-700"
               >
                  Data de Fim <span className="text-red-500">*</span>
               </Label>
               <TextInput
                  id="date_end"
                  type="date"
                  value={values.dateEnd}
                  min={values.dateStart}
                  onChange={(e) => setField("dateEnd", e.target.value)}
                  required
                  disabled={readOnly}
               />
            </div>
         </div>

         <div className="grid gap-2">
            <Label htmlFor="obs" className="font-semibold text-gray-700">
               Observações
            </Label>
            <Textarea
               id="obs"
               placeholder="Detalhes adicionais sobre a indisponibilidade..."
               value={values.obs}
               className="placeholder-slate-500"
               onChange={(e) => setField("obs", e.target.value)}
               disabled={readOnly}
            />
         </div>
      </div>
   );
}
