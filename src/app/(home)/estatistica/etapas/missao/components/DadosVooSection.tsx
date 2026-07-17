import clsx from "clsx";
import { Select, Textarea, TextInput, ToggleSwitch } from "flowbite-react";
import { minutesToTime } from "@/../utils/dateHandler";

import { toIcao, toNivelDigits } from "../context/format";
import { isRotaPousoSuspeito } from "../context/selectors";
import { FIELD_LIMITS, type EtapaFormGroup } from "../hooks/useEtapaEditor";
import { FormField } from "./FormField";

interface DadosVooSectionProps {
   form: EtapaFormGroup;
   aeronavesList: Array<{ matricula: string }>;
}

const groupHeadingClass =
   "mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase";

// min/max vêm de FIELD_LIMITS (fonte única); aqui só rótulo e passo.
const complementares = [
   { key: "tow", label: "TOW (kg)", step: 1 },
   { key: "pax", label: "PAX", step: 1 },
   { key: "carga", label: "Carga (kg)", step: 1 },
   { key: "comb", label: "Comb (L)", step: 1 },
   { key: "lub", label: "Lub (L)", step: 0.1 },
] as const;

export function DadosVooSection({ form, aeronavesList }: DadosVooSectionProps) {
   const { formData, setField, errors, tvoo, tvooValid, crossesDay } = form;
   return (
      <section className="space-y-6">
         {/* Bloco 1: Identificação do Voo */}
         <div>
            <div className="grid grid-cols-1 gap-4 text-left sm:grid-cols-2 lg:grid-cols-4">
               <FormField label="Data" htmlFor="data" error={errors.data}>
                  <TextInput
                     id="data"
                     type="date"
                     value={formData.data}
                     onChange={(e) => setField("data", e.target.value)}
                     color={errors.data ? "failure" : "gray"}
                     sizing="sm"
                  />
               </FormField>
               <FormField label="Aeronave" htmlFor="anv" error={errors.anv}>
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
               </FormField>
               <FormField label="Origem" htmlFor="origem" error={errors.origem}>
                  <TextInput
                     id="origem"
                     type="text"
                     value={formData.origem}
                     onChange={(e) =>
                        setField("origem", toIcao(e.target.value))
                     }
                     placeholder="SBGR"
                     maxLength={4}
                     color={errors.origem ? "failure" : "gray"}
                     sizing="sm"
                     className="font-mono uppercase"
                  />
               </FormField>
               <FormField
                  label="Destino"
                  htmlFor="destino"
                  error={errors.destino}
               >
                  <TextInput
                     id="destino"
                     type="text"
                     value={formData.destino}
                     onChange={(e) =>
                        setField("destino", toIcao(e.target.value))
                     }
                     placeholder="SBSP"
                     maxLength={4}
                     color={errors.destino ? "failure" : "gray"}
                     sizing="sm"
                     className="font-mono uppercase"
                  />
               </FormField>
            </div>
         </div>

         {/* Bloco 2: Cronologia e Parâmetros da Etapa */}
         <div>
            <div className="grid grid-cols-2 items-start gap-4 text-left sm:grid-cols-3 lg:grid-cols-6">
               <FormField label="Decolagem" htmlFor="dep" error={errors.dep}>
                  <TextInput
                     id="dep"
                     type="time"
                     value={formData.dep}
                     onChange={(e) => setField("dep", e.target.value)}
                     color={errors.dep ? "failure" : "gray"}
                     sizing="sm"
                     className="font-mono"
                  />
               </FormField>
               <FormField label="Pouso" htmlFor="arr" error={errors.arr}>
                  <TextInput
                     id="arr"
                     type="time"
                     value={formData.arr}
                     onChange={(e) => setField("arr", e.target.value)}
                     color={errors.arr ? "failure" : "gray"}
                     sizing="sm"
                     className="font-mono"
                  />
               </FormField>
               <FormField label="Tempo">
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
               </FormField>
               <FormField
                  label="Qtd. Pousos"
                  htmlFor="pousos"
                  error={errors.pousos}
                  footer={
                     isRotaPousoSuspeito(formData.destino, formData.pousos) &&
                     !errors.pousos && (
                        <p className="mt-1 rounded border bg-amber-100 px-1 py-0.5 text-center text-xs font-medium text-amber-700">
                           (ROTA) Pousos &gt; 0 ?
                        </p>
                     )
                  }
               >
                  <TextInput
                     id="pousos"
                     type="number"
                     min={FIELD_LIMITS.pousos.min}
                     max={FIELD_LIMITS.pousos.max}
                     value={formData.pousos}
                     onChange={(e) =>
                        setField("pousos", parseInt(e.target.value) || 0)
                     }
                     color={errors.pousos ? "failure" : "gray"}
                     sizing="sm"
                  />
               </FormField>
               <FormField
                  label="Sagem"
                  className="flex flex-col items-center justify-end"
               >
                  {/* aria-label obrigatório: sem a prop `label`, o Flowbite 0.12
                      emite um aria-labelledby que aponta p/ um id inexistente */}
                  <ToggleSwitch
                     checked={formData.sagem}
                     onChange={(v) => setField("sagem", v)}
                     aria-label="Registrado no SAGEM"
                     sizing="md"
                     className="min-h-[25px] items-center pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px]"
                  />
               </FormField>
               <FormField
                  label="Parte 1"
                  className="flex flex-col items-center justify-end"
               >
                  <ToggleSwitch
                     checked={formData.parte1}
                     onChange={(v) => setField("parte1", v)}
                     aria-label="Relatório Parte 1 recolhido"
                     sizing="md"
                     className="min-h-[25px] items-center pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px]"
                  />
               </FormField>
            </div>
         </div>

         {/* Bloco 3: Dados Complementares */}
         <div>
            <div className="grid grid-cols-2 gap-4 text-left sm:grid-cols-3 lg:grid-cols-6">
               {complementares.map(({ key, label, step }) => (
                  <FormField
                     key={key}
                     label={label}
                     htmlFor={key}
                     error={errors[key]}
                  >
                     <TextInput
                        id={key}
                        type="number"
                        min={FIELD_LIMITS[key].min}
                        max={FIELD_LIMITS[key].max}
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
                  </FormField>
               ))}
               <FormField label="Nível (FL)" htmlFor="nivel">
                  <TextInput
                     id="nivel"
                     type="text"
                     inputMode="numeric"
                     maxLength={3}
                     placeholder="000"
                     value={formData.nivel}
                     onChange={(e) =>
                        setField("nivel", toNivelDigits(e.target.value))
                     }
                     onBlur={() => {
                        if (formData.nivel)
                           setField("nivel", formData.nivel.padStart(3, "0"));
                     }}
                     sizing="sm"
                     className="text-center font-mono tracking-widest"
                  />
               </FormField>
            </div>
         </div>

         {/* Observações */}
         <FormField
            label="Observações"
            htmlFor="obs"
            className="text-left"
            labelClassName={groupHeadingClass}
         >
            <Textarea
               id="obs"
               rows={2}
               value={formData.obs}
               onChange={(e) => setField("obs", e.target.value)}
               placeholder="Adicione notas breves ou discrepâncias sobre o trecho operado..."
               className="w-full resize-y"
            />
         </FormField>
      </section>
   );
}
