import clsx from "clsx";
import {
   Label,
   Select,
   TextInput,
   Textarea,
   ToggleSwitch,
} from "flowbite-react";
import { minutesToTime } from "@/../utils/dateHandler";
import type { FormData } from "../types";

interface DadosVooSectionProps {
   formData: FormData;
   setField: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
   errors: Partial<Record<keyof FormData, string>>;
   tvoo: number;
   tvooValid: boolean;
   aeronavesList: Array<{ matricula: string }>;
}

export function DadosVooSection({
   formData,
   setField,
   errors,
   tvoo,
   tvooValid,
   aeronavesList,
}: DadosVooSectionProps) {
   return (
      <section>
         <h3 className="mb-3 border-b border-gray-200 pb-1.5 text-sm font-semibold tracking-wide text-gray-500 uppercase">
            Dados do Voo
         </h3>

         {/* Linha 1: Data + Aeronave + Origem + Destino */}
         <div className="mb-3 grid grid-cols-4 gap-3">
            <div>
               <Label htmlFor="data" className="mb-1 block text-xs font-medium">
                  Data
               </Label>
               <input
                  id="data"
                  type="date"
                  value={formData.data}
                  onChange={(e) => setField("data", e.target.value)}
                  className={clsx(
                     "w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none",
                     errors.data
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 bg-white"
                  )}
               />
               {errors.data && (
                  <p className="mt-0.5 text-xs text-red-600">{errors.data}</p>
               )}
            </div>
            <div>
               <Label htmlFor="anv" className="mb-1 block text-xs font-medium">
                  Aeronave
               </Label>
               <Select
                  id="anv"
                  value={formData.anv}
                  onChange={(e) => setField("anv", e.target.value)}
                  color={errors.anv ? "failure" : "gray"}
               >
                  <option value="">Selecionar...</option>
                  {aeronavesList.map((a) => (
                     <option key={a.matricula} value={a.matricula}>
                        {a.matricula}
                     </option>
                  ))}
               </Select>
               {errors.anv && (
                  <p className="mt-0.5 text-xs text-red-600">{errors.anv}</p>
               )}
            </div>
            <div>
               <Label
                  htmlFor="origem"
                  className="mb-1 block text-xs font-medium"
               >
                  Origem
               </Label>
               <TextInput
                  id="origem"
                  value={formData.origem}
                  onChange={(e) =>
                     setField(
                        "origem",
                        e.target.value.toUpperCase().slice(0, 4)
                     )
                  }
                  placeholder="SBGR"
                  maxLength={4}
                  className="font-mono uppercase"
                  color={errors.origem ? "failure" : "gray"}
               />
               {errors.origem && (
                  <p className="mt-0.5 text-xs text-red-600">{errors.origem}</p>
               )}
            </div>
            <div>
               <Label
                  htmlFor="destino"
                  className="mb-1 block text-xs font-medium"
               >
                  Destino
               </Label>
               <TextInput
                  id="destino"
                  value={formData.destino}
                  onChange={(e) =>
                     setField(
                        "destino",
                        e.target.value.toUpperCase().slice(0, 4)
                     )
                  }
                  placeholder="SBSP"
                  maxLength={4}
                  className="font-mono uppercase"
                  color={errors.destino ? "failure" : "gray"}
               />
               {errors.destino && (
                  <p className="mt-0.5 text-xs text-red-600">
                     {errors.destino}
                  </p>
               )}
            </div>
         </div>

         {/* Linha 2: H.Dep + H.Pso + T.Voo + Pousos + SAGEM + Parte1 */}
         <div className="mb-3 grid grid-cols-6 items-center gap-3">
            <div>
               <Label htmlFor="dep" className="mb-1 block text-xs font-medium">
                  H. Decolagem
               </Label>
               <input
                  id="dep"
                  type="time"
                  value={formData.dep}
                  onChange={(e) => setField("dep", e.target.value)}
                  className={clsx(
                     "w-full rounded-lg border px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-red-400 focus:outline-none",
                     errors.dep
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 bg-white"
                  )}
               />
               {errors.dep && (
                  <p className="mt-0.5 text-xs text-red-600">{errors.dep}</p>
               )}
            </div>
            <div>
               <Label htmlFor="arr" className="mb-1 block text-xs font-medium">
                  H. Pouso
               </Label>
               <input
                  id="arr"
                  type="time"
                  value={formData.arr}
                  onChange={(e) => setField("arr", e.target.value)}
                  className={clsx(
                     "w-full rounded-lg border px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-red-400 focus:outline-none",
                     errors.arr
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 bg-white"
                  )}
               />
               {errors.arr && (
                  <p className="mt-0.5 text-xs text-red-600">{errors.arr}</p>
               )}
            </div>
            <div>
               <Label className="mb-1 block text-xs font-medium">T. Voo</Label>
               <div
                  className={clsx(
                     "flex h-9.5 items-center justify-center rounded-lg border px-3 font-mono font-semibold",
                     tvoo > 0 && tvooValid
                        ? "border-green-200 bg-green-50 text-green-700"
                        : tvoo > 0
                          ? "border-amber-200 bg-amber-50 text-amber-700"
                          : "border-gray-200 bg-gray-50 text-gray-400"
                  )}
               >
                  {tvoo > 0 ? minutesToTime(tvoo) : "—"}
                  {tvoo > 0 && !tvooValid && (
                     <span className="ml-1 text-xs font-normal">
                        (não múltiplo de 5)
                     </span>
                  )}
               </div>
            </div>
            <div>
               <Label
                  htmlFor="pousos"
                  className="mb-1 block text-xs font-medium"
               >
                  Pousos
               </Label>
               <input
                  id="pousos"
                  type="number"
                  min={0}
                  value={formData.pousos}
                  onChange={(e) =>
                     setField("pousos", parseInt(e.target.value) || 0)
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
               />
            </div>
            <div className="flex flex-col items-center">
               <Label className="mb-1 block text-xs font-medium">SAGEM</Label>
               <ToggleSwitch
                  checked={formData.sagem}
                  onChange={(v) => setField("sagem", v)}
                  color="red"
               />
            </div>
            <div className="flex flex-col items-center">
               <Label className="mb-1 block text-xs font-medium">Parte 1</Label>
               <ToggleSwitch
                  checked={formData.parte1}
                  onChange={(v) => setField("parte1", v)}
                  color="red"
               />
            </div>
         </div>

         {/* Dados Complementares */}
         <div className="rounded-lg border border-gray-200">
            <div className="grid grid-cols-6 gap-3 border-t border-gray-200 p-3">
               {(
                  [
                     { key: "tow", label: "TOW (kg)", min: 1, step: 1 },
                     { key: "pax", label: "PAX", min: 0, step: 1 },
                     { key: "carga", label: "Carga (Kg)", min: 0, step: 1 },
                     {
                        key: "comb",
                        label: "Combustível (L)",
                        min: 1,
                        step: 1,
                     },
                     {
                        key: "lub",
                        label: "Lubrificante (L)",
                        min: 0,
                        step: 0.1,
                     },
                  ] as Array<{
                     key: "tow" | "pax" | "carga" | "comb" | "lub";
                     label: string;
                     min: number;
                     step: number;
                  }>
               ).map(({ key, label, min, step }) => (
                  <div key={key}>
                     <Label
                        htmlFor={key}
                        className="mb-1 block text-xs font-medium"
                     >
                        {label}
                     </Label>
                     <input
                        id={key}
                        type="number"
                        min={min}
                        step={step ?? 1}
                        value={formData[key] ?? ""}
                        onChange={(e) => {
                           const v = e.target.value;
                           if (v === "") {
                              setField(key, null);
                           } else {
                              const num = parseFloat(v);
                              setField(
                                 key,
                                 key === "lub" ? Math.round(num * 10) / 10 : num
                              );
                           }
                        }}
                        placeholder="—"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
                     />
                  </div>
               ))}

               {/* FL */}
               <div>
                  <Label
                     htmlFor="nivel"
                     className="mb-1 block text-xs font-medium"
                  >
                     FL (Flight Level)
                  </Label>
                  <div className="flex items-center gap-1.5">
                     <input
                        id="nivel"
                        type="text"
                        inputMode="numeric"
                        maxLength={3}
                        placeholder="000"
                        value={formData.nivel}
                        onChange={(e) => {
                           const digits = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 3);
                           setField("nivel", digits);
                        }}
                        onBlur={() => {
                           if (formData.nivel) {
                              setField(
                                 "nivel",
                                 formData.nivel.padStart(3, "0")
                              );
                           }
                        }}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-center font-mono text-sm tracking-wider focus:ring-2 focus:ring-red-400 focus:outline-none"
                     />
                  </div>
               </div>
            </div>
         </div>

         {/* Obs */}
         <div className="mt-3">
            <Label htmlFor="obs" className="mb-1 block text-xs font-medium">
               Observações
            </Label>
            <Textarea
               id="obs"
               rows={2}
               value={formData.obs}
               onChange={(e) => setField("obs", e.target.value)}
               placeholder="Observações..."
            />
         </div>
      </section>
   );
}
