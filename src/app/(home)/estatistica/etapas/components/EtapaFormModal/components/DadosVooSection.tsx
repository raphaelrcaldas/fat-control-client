import clsx from "clsx";
import { Label, Textarea, ToggleSwitch } from "flowbite-react";
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
      <section className="space-y-4">
         {/* Bloco 1: Identificação do Voo */}
         <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h4 className="mb-4 text-[11px] font-bold tracking-wider text-gray-400 uppercase dark:text-gray-500">
               Identificação do Voo
            </h4>
            <div className="grid grid-cols-1 gap-4 text-left sm:grid-cols-2 lg:grid-cols-4">
               <div>
                  <Label
                     htmlFor="data"
                     className="mb-1 block text-[10px] font-bold text-gray-500 uppercase dark:text-gray-400"
                  >
                     Data
                  </Label>
                  <input
                     id="data"
                     type="date"
                     value={formData.data}
                     onChange={(e) => setField("data", e.target.value)}
                     className={clsx(
                        "w-full rounded-lg border px-3 py-[7px] text-xs focus:border-red-400 focus:ring-1 focus:ring-red-400 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white",
                        errors.data
                           ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                           : "border-gray-300 bg-gray-50 dark:bg-gray-800"
                     )}
                  />
                  {errors.data && (
                     <p className="mt-1 text-[10px] leading-tight font-medium text-red-600 dark:text-red-400">
                        {errors.data}
                     </p>
                  )}
               </div>
               <div>
                  <Label
                     htmlFor="anv"
                     className="mb-1 block text-[10px] font-bold text-gray-500 uppercase dark:text-gray-400"
                  >
                     Aeronave
                  </Label>
                  <select
                     id="anv"
                     value={formData.anv}
                     onChange={(e) => setField("anv", e.target.value)}
                     className={clsx(
                        "w-full rounded-lg border px-3 py-[7px] text-xs focus:border-red-400 focus:ring-1 focus:ring-red-400 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white",
                        errors.anv
                           ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                           : "border-gray-300 bg-gray-50 dark:bg-gray-800"
                     )}
                  >
                     <option value="">Selecionar...</option>
                     {aeronavesList.map((a) => (
                        <option key={a.matricula} value={a.matricula}>
                           {a.matricula}
                        </option>
                     ))}
                  </select>
                  {errors.anv && (
                     <p className="mt-1 text-[10px] leading-tight font-medium text-red-600 dark:text-red-400">
                        {errors.anv}
                     </p>
                  )}
               </div>
               <div>
                  <Label
                     htmlFor="origem"
                     className="mb-1 block text-[10px] font-bold text-gray-500 uppercase dark:text-gray-400"
                  >
                     Origem (ICAO)
                  </Label>
                  <input
                     id="origem"
                     type="text"
                     value={formData.origem}
                     onChange={(e) =>
                        setField(
                           "origem",
                           e.target.value.toUpperCase().slice(0, 4)
                        )
                     }
                     placeholder="SBGR"
                     maxLength={4}
                     className={clsx(
                        "w-full rounded-lg border px-3 py-[7px] font-mono text-xs uppercase placeholder:text-gray-400 focus:border-red-400 focus:ring-1 focus:ring-red-400 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white",
                        errors.origem
                           ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                           : "border-gray-300 bg-gray-50 dark:bg-gray-800"
                     )}
                  />
                  {errors.origem && (
                     <p className="mt-1 text-[10px] leading-tight font-medium text-red-600 dark:text-red-400">
                        {errors.origem}
                     </p>
                  )}
               </div>
               <div>
                  <Label
                     htmlFor="destino"
                     className="mb-1 block text-[10px] font-bold text-gray-500 uppercase dark:text-gray-400"
                  >
                     Destino (ICAO)
                  </Label>
                  <input
                     id="destino"
                     type="text"
                     value={formData.destino}
                     onChange={(e) =>
                        setField(
                           "destino",
                           e.target.value.toUpperCase().slice(0, 4)
                        )
                     }
                     placeholder="SBSP"
                     maxLength={4}
                     className={clsx(
                        "w-full rounded-lg border px-3 py-[7px] font-mono text-xs uppercase placeholder:text-gray-400 focus:border-red-400 focus:ring-1 focus:ring-red-400 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white",
                        errors.destino
                           ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                           : "border-gray-300 bg-gray-50 dark:bg-gray-800"
                     )}
                  />
                  {errors.destino && (
                     <p className="mt-1 text-[10px] leading-tight font-medium text-red-600 dark:text-red-400">
                        {errors.destino}
                     </p>
                  )}
               </div>
            </div>
         </div>

         {/* Bloco 2: Cronologia e Parâmetros da Etapa */}
         <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h4 className="mb-4 text-[11px] font-bold tracking-wider text-gray-400 uppercase dark:text-gray-500">
               Cronologia e Dinâmica
            </h4>
            <div className="grid grid-cols-2 items-start gap-4 text-left sm:grid-cols-3 lg:grid-cols-6">
               <div>
                  <Label
                     htmlFor="dep"
                     className="mb-1 block text-[10px] font-bold text-gray-500 uppercase dark:text-gray-400"
                  >
                     Decolagem
                  </Label>
                  <input
                     id="dep"
                     type="time"
                     value={formData.dep}
                     onChange={(e) => setField("dep", e.target.value)}
                     className={clsx(
                        "w-full rounded-lg border px-3 py-[7px] font-mono text-xs focus:border-red-400 focus:ring-1 focus:ring-red-400 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white",
                        errors.dep
                           ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                           : "border-gray-300 bg-gray-50 dark:bg-gray-800"
                     )}
                  />
                  {errors.dep && (
                     <p className="mt-1 text-[10px] leading-tight font-medium text-red-600 dark:text-red-400">
                        {errors.dep}
                     </p>
                  )}
               </div>
               <div>
                  <Label
                     htmlFor="arr"
                     className="mb-1 block text-[10px] font-bold text-gray-500 uppercase dark:text-gray-400"
                  >
                     Pouso
                  </Label>
                  <input
                     id="arr"
                     type="time"
                     value={formData.arr}
                     onChange={(e) => setField("arr", e.target.value)}
                     className={clsx(
                        "w-full rounded-lg border px-3 py-[7px] font-mono text-xs focus:border-red-400 focus:ring-1 focus:ring-red-400 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white",
                        errors.arr
                           ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                           : "border-gray-300 bg-gray-50 dark:bg-gray-800"
                     )}
                  />
                  {errors.arr && (
                     <p className="mt-1 text-[10px] leading-tight font-medium text-red-600 dark:text-red-400">
                        {errors.arr}
                     </p>
                  )}
               </div>
               <div>
                  <Label className="mb-1 block text-[10px] font-bold text-gray-500 uppercase dark:text-gray-400">
                     Tempo (TVOO)
                  </Label>
                  <div
                     className={clsx(
                        "flex h-[32px] items-center justify-center rounded-lg border px-3 font-mono text-xs shadow-inner",
                        tvoo > 0 && tvooValid
                           ? "border-green-300 bg-green-50 text-green-700 dark:border-green-800/80 dark:bg-green-900/20 dark:text-green-400"
                           : tvoo > 0
                             ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800/80 dark:bg-amber-900/20 dark:text-amber-400"
                             : "border-gray-200 bg-gray-100 text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500"
                     )}
                  >
                     {tvoo > 0 ? (
                        <div className="flex items-center gap-1.5 select-none">
                           <span className="font-bold tracking-wide">
                              {minutesToTime(tvoo)}
                           </span>
                           {!tvooValid && (
                              <span className="text-[9px] tracking-tighter uppercase opacity-80">
                                 (inválido)
                              </span>
                           )}
                        </div>
                     ) : (
                        "—"
                     )}
                  </div>
               </div>
               <div>
                  <Label
                     htmlFor="pousos"
                     className="mb-1 block text-[10px] font-bold text-gray-500 uppercase dark:text-gray-400"
                  >
                     Qtd. Pousos
                  </Label>
                  <input
                     id="pousos"
                     type="number"
                     min={0}
                     max={32767}
                     value={formData.pousos}
                     onChange={(e) =>
                        setField("pousos", parseInt(e.target.value) || 0)
                     }
                     className={clsx(
                        "w-full rounded-lg border px-3 py-[7px] text-xs focus:border-red-400 focus:ring-1 focus:ring-red-400 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white",
                        errors.pousos
                           ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                           : "border-gray-300 bg-gray-50 dark:bg-gray-800"
                     )}
                  />
                  {errors.pousos && (
                     <p className="mt-1 text-[10px] leading-tight font-medium text-red-600 dark:text-red-400">
                        {errors.pousos}
                     </p>
                  )}
                  {formData.destino === "ROTA" &&
                     formData.pousos !== 0 &&
                     !errors.pousos && (
                        <p className="mt-1 rounded bg-amber-100 px-1 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                           (ROTA) Pousos &gt; 0?
                        </p>
                     )}
               </div>
               <div className="flex h-[32px] flex-col items-center justify-end">
                  <Label className="mb-1 block text-[10px] font-bold text-gray-500 uppercase dark:text-gray-400">
                     Sagem
                  </Label>
                  <ToggleSwitch
                     checked={formData.sagem}
                     onChange={(v) => setField("sagem", v)}
                     color="red"
                     sizing="sm"
                  />
               </div>
               <div className="flex h-[32px] flex-col items-center justify-end">
                  <Label className="mb-1 block text-[10px] font-bold text-gray-500 uppercase dark:text-gray-400">
                     Parte 1
                  </Label>
                  <ToggleSwitch
                     checked={formData.parte1}
                     onChange={(v) => setField("parte1", v)}
                     color="red"
                     sizing="sm"
                  />
               </div>
            </div>
         </div>

         {/* Bloco 3: Dados Complementares */}
         <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h4 className="mb-4 text-[11px] font-bold tracking-wider text-gray-400 uppercase dark:text-gray-500">
               Dados Complementares
            </h4>
            <div className="grid grid-cols-2 gap-4 text-left sm:grid-cols-3 lg:grid-cols-6">
               {(
                  [
                     {
                        key: "tow",
                        label: "TOW (kg)",
                        min: 1,
                        max: 2147483647,
                        step: 1,
                     },
                     {
                        key: "pax",
                        label: "Passageiros",
                        min: 0,
                        max: 32767,
                        step: 1,
                     },
                     {
                        key: "carga",
                        label: "Carga (kg)",
                        min: 0,
                        max: 32767,
                        step: 1,
                     },
                     {
                        key: "comb",
                        label: "Combust. (L)",
                        min: 1,
                        max: 32767,
                        step: 1,
                     },
                     {
                        key: "lub",
                        label: "Lubrifi. (L)",
                        min: 0,
                        max: 9999.9,
                        step: 0.1,
                     },
                  ] as Array<{
                     key: "tow" | "pax" | "carga" | "comb" | "lub";
                     label: string;
                     min: number;
                     max: number;
                     step: number;
                  }>
               ).map(({ key, label, min, max, step }) => (
                  <div key={key}>
                     <Label
                        htmlFor={key}
                        className="mb-1 block text-[10px] font-bold text-gray-500 uppercase dark:text-gray-400"
                     >
                        {label}
                     </Label>
                     <input
                        id={key}
                        type="number"
                        min={min}
                        max={max}
                        step={step ?? 1}
                        value={formData[key] ?? ""}
                        onChange={(e) => {
                           const v = e.target.value;
                           if (v === "") setField(key, null);
                           else {
                              const num = parseFloat(v);
                              setField(
                                 key,
                                 key === "lub" ? Math.round(num * 10) / 10 : num
                              );
                           }
                        }}
                        placeholder="—"
                        className={clsx(
                           "w-full rounded-lg border px-3 py-[7px] text-xs focus:border-red-400 focus:ring-1 focus:ring-red-400 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white",
                           errors[key]
                              ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                              : "border-gray-300 bg-gray-50 dark:bg-gray-800"
                        )}
                     />
                     {errors[key] && (
                        <p className="mt-1 text-[10px] leading-tight font-medium text-red-600 dark:text-red-400">
                           {errors[key]}
                        </p>
                     )}
                  </div>
               ))}
               <div>
                  <Label
                     htmlFor="nivel"
                     className="mb-1 block text-[10px] font-bold text-gray-500 uppercase dark:text-gray-400"
                  >
                     Nível (FL)
                  </Label>
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
                        if (formData.nivel)
                           setField("nivel", formData.nivel.padStart(3, "0"));
                     }}
                     className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-[7px] text-center font-mono text-xs tracking-widest focus:border-red-400 focus:ring-1 focus:ring-red-400 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
               </div>
            </div>
         </div>

         {/* Observações */}
         <div className="rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <Label
               htmlFor="obs"
               className="mb-2 block text-[11px] font-bold tracking-wider text-gray-400 uppercase dark:text-gray-500"
            >
               Observações
            </Label>
            <Textarea
               id="obs"
               rows={2}
               value={formData.obs}
               onChange={(e) => setField("obs", e.target.value)}
               placeholder="Adicione notas breves ou discrepâncias sobre o trecho operado..."
               className="w-full resize-y bg-gray-50 focus:border-red-400 focus:ring-red-400 dark:bg-gray-700"
            />
         </div>
      </section>
   );
}
