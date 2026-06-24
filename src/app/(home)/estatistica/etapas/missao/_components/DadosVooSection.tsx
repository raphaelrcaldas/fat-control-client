import clsx from "clsx";
import {
   Label,
   Select,
   Textarea,
   TextInput,
   ToggleSwitch,
} from "flowbite-react";
import { minutesToTime } from "@/../utils/dateHandler";
import type { EtapaFormData } from "../_state/types";

interface DadosVooSectionProps {
   formData: EtapaFormData;
   setField: <K extends keyof EtapaFormData>(
      key: K,
      value: EtapaFormData[K]
   ) => void;
   errors: Partial<Record<keyof EtapaFormData, string>>;
   tvoo: number;
   tvooValid: boolean;
   crossesDay: boolean;
   aeronavesList: Array<{ matricula: string }>;
}

const fieldLabelClass =
   "mb-1 block text-xs font-semibold tracking-wide text-gray-500 uppercase";

const errorTextClass = "mt-1 text-xs font-medium text-red-600";

const groupHeadingClass =
   "mb-3 text-xs font-semibold tracking-wider text-gray-400 uppercase";

export function DadosVooSection({
   formData,
   setField,
   errors,
   tvoo,
   tvooValid,
   crossesDay,
   aeronavesList,
}: DadosVooSectionProps) {
   return (
      <section className="space-y-6">
         {/* Bloco 1: Identificação do Voo */}
         <div>
            <div className="grid grid-cols-1 gap-4 text-left sm:grid-cols-2 lg:grid-cols-4">
               <div>
                  <Label htmlFor="data" className={fieldLabelClass}>
                     Data
                  </Label>
                  <TextInput
                     id="data"
                     type="date"
                     value={formData.data}
                     onChange={(e) => setField("data", e.target.value)}
                     color={errors.data ? "failure" : "gray"}
                     sizing="sm"
                  />
                  {errors.data && (
                     <p className={errorTextClass}>{errors.data}</p>
                  )}
               </div>
               <div>
                  <Label htmlFor="anv" className={fieldLabelClass}>
                     Aeronave
                  </Label>
                  <Select
                     id="anv"
                     value={formData.anv}
                     onChange={(e) => setField("anv", e.target.value)}
                     color={errors.anv ? "failure" : "gray"}
                     sizing="sm"
                  >
                     <option value="">Selecionar...</option>
                     {aeronavesList.map((a) => (
                        <option key={a.matricula} value={a.matricula}>
                           {a.matricula}
                        </option>
                     ))}
                  </Select>
                  {errors.anv && <p className={errorTextClass}>{errors.anv}</p>}
               </div>
               <div>
                  <Label htmlFor="origem" className={fieldLabelClass}>
                     Origem
                  </Label>
                  <TextInput
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
                     color={errors.origem ? "failure" : "gray"}
                     sizing="sm"
                     className="font-mono uppercase"
                  />
                  {errors.origem && (
                     <p className={errorTextClass}>{errors.origem}</p>
                  )}
               </div>
               <div>
                  <Label htmlFor="destino" className={fieldLabelClass}>
                     Destino
                  </Label>
                  <TextInput
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
                     color={errors.destino ? "failure" : "gray"}
                     sizing="sm"
                     className="font-mono uppercase"
                  />
                  {errors.destino && (
                     <p className={errorTextClass}>{errors.destino}</p>
                  )}
               </div>
            </div>
         </div>

         {/* Bloco 2: Cronologia e Parâmetros da Etapa */}
         <div>
            <div className="grid grid-cols-2 items-start gap-4 text-left sm:grid-cols-3 lg:grid-cols-6">
               <div>
                  <Label htmlFor="dep" className={fieldLabelClass}>
                     Decolagem
                  </Label>
                  <TextInput
                     id="dep"
                     type="time"
                     value={formData.dep}
                     onChange={(e) => setField("dep", e.target.value)}
                     color={errors.dep ? "failure" : "gray"}
                     sizing="sm"
                     className="font-mono"
                  />
                  {errors.dep && <p className={errorTextClass}>{errors.dep}</p>}
               </div>
               <div>
                  <Label htmlFor="arr" className={fieldLabelClass}>
                     Pouso
                  </Label>
                  <TextInput
                     id="arr"
                     type="time"
                     value={formData.arr}
                     onChange={(e) => setField("arr", e.target.value)}
                     color={errors.arr ? "failure" : "gray"}
                     sizing="sm"
                     className="font-mono"
                  />
                  {errors.arr && <p className={errorTextClass}>{errors.arr}</p>}
               </div>
               <div>
                  <Label className={fieldLabelClass}>Tempo</Label>
                  <div
                     className={clsx(
                        "flex h-8.5 items-center justify-center rounded border px-3 font-mono text-sm",
                        crossesDay
                           ? "border-red-300 bg-red-50 text-red-700"
                           : tvoo > 0 && tvooValid
                             ? "border-green-300 bg-green-50 text-green-700"
                             : tvoo > 0
                               ? "border-amber-300 bg-amber-50 text-amber-700"
                               : "border-gray-200 bg-gray-100 text-gray-400"
                     )}
                  >
                     {crossesDay ? (
                        <span className="text-xs font-bold tracking-tight uppercase">
                           atravessa dia
                        </span>
                     ) : tvoo > 0 ? (
                        <div className="flex items-center gap-1.5 select-none">
                           <span className="font-bold tracking-wide">
                              {minutesToTime(tvoo)}
                           </span>
                           {!tvooValid && (
                              <span className="text-xs tracking-tight uppercase opacity-80">
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
                  <Label htmlFor="pousos" className={fieldLabelClass}>
                     Qtd. Pousos
                  </Label>
                  <TextInput
                     id="pousos"
                     type="number"
                     min={0}
                     max={32767}
                     value={formData.pousos}
                     onChange={(e) =>
                        setField("pousos", parseInt(e.target.value) || 0)
                     }
                     color={errors.pousos ? "failure" : "gray"}
                     sizing="sm"
                  />
                  {errors.pousos && (
                     <p className={errorTextClass}>{errors.pousos}</p>
                  )}
                  {formData.destino === "ROTA" &&
                     formData.pousos !== 0 &&
                     !errors.pousos && (
                        <p className="mt-1 rounded border bg-amber-100 px-1 py-0.5 text-center text-xs font-medium text-amber-700">
                           (ROTA) Pousos &gt; 0 ?
                        </p>
                     )}
               </div>
               <div className="flex flex-col items-center justify-end">
                  <Label className={fieldLabelClass}>Sagem</Label>
                  <ToggleSwitch
                     checked={formData.sagem}
                     onChange={(v) => setField("sagem", v)}
                     color="red"
                     sizing="md"
                  />
               </div>
               <div className="flex flex-col items-center justify-end">
                  <Label className={fieldLabelClass}>Parte 1</Label>
                  <ToggleSwitch
                     checked={formData.parte1}
                     onChange={(v) => setField("parte1", v)}
                     color="red"
                     sizing="md"
                  />
               </div>
            </div>
         </div>

         {/* Bloco 3: Dados Complementares */}
         <div>
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
                        label: "PAX",
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
                        label: "Comb (L)",
                        min: 1,
                        max: 32767,
                        step: 1,
                     },
                     {
                        key: "lub",
                        label: "Lub (L)",
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
                     <Label htmlFor={key} className={fieldLabelClass}>
                        {label}
                     </Label>
                     <TextInput
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
                        color={errors[key] ? "failure" : "gray"}
                        sizing="sm"
                     />
                     {errors[key] && (
                        <p className={errorTextClass}>{errors[key]}</p>
                     )}
                  </div>
               ))}
               <div>
                  <Label htmlFor="nivel" className={fieldLabelClass}>
                     Nível (FL)
                  </Label>
                  <TextInput
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
                     sizing="sm"
                     className="text-center font-mono tracking-widest"
                  />
               </div>
            </div>
         </div>

         {/* Observações */}
         <div className="text-left">
            <Label htmlFor="obs" className={groupHeadingClass}>
               Observações
            </Label>
            <Textarea
               id="obs"
               rows={2}
               value={formData.obs}
               onChange={(e) => setField("obs", e.target.value)}
               placeholder="Adicione notas breves ou discrepâncias sobre o trecho operado..."
               className="w-full resize-y"
            />
         </div>
      </section>
   );
}
