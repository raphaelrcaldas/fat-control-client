import clsx from "clsx";
import { Select, Textarea, TextInput, ToggleSwitch } from "flowbite-react";
import { minutesToTime } from "@/../utils/dateHandler";

import { toIcao, toNivelDigits } from "../context/format";
import { isRotaPousoSuspeito } from "../context/selectors";
import {
   DATA_MAX,
   DATA_MIN,
   FIELD_LIMITS,
   requiredFormErrors,
   type FormErrors,
} from "../context/validators";
import type { EtapaFormGroup } from "../hooks/useEtapaEditor";
import { errorId, FormField } from "./FormField";

interface DadosVooSectionProps {
   form: EtapaFormGroup;
   aeronavesList: Array<{ matricula: string }>;
   /** Catalogo de aeronaves carregando: o Select vira skeleton. */
   loadingAeronaves: boolean;
   /** Houve tentativa de salvar recusada: aponta os obrigatorios vazios. */
   showErrors: boolean;
}

// min/max vêm de FIELD_LIMITS (fonte única); aqui só rótulo e passo.
const complementares = [
   { key: "tow", label: "TOW (kg)", step: 1 },
   { key: "pax", label: "PAX", step: 1 },
   { key: "carga", label: "Carga (kg)", step: 1 },
   { key: "comb", label: "Comb (L)", step: 1 },
   { key: "lub", label: "Lub (L)", step: 0.1 },
] as const;

// Area de clique dos toggles na regua de 24px (WCAG 2.5.8). Em px, nao
// `min-h-6`: com a raiz a 87.5% aquilo da 21px
const toggleClass = "min-h-[24px] items-center";

export function DadosVooSection({
   form,
   aeronavesList,
   loadingAeronaves,
   showErrors,
}: DadosVooSectionProps) {
   const { formData, setField, errors, tvoo } = form;

   // Obrigatorio vazio so aparece depois de um salvar recusado; erro de valor
   // (limite, horario) aparece enquanto se digita e prevalece
   const err: FormErrors = showErrors
      ? { ...requiredFormErrors(formData), ...errors }
      : errors;

   const estado = (
      key: keyof FormErrors
   ): {
      color: "failure" | "gray";
      "aria-invalid"?: true;
      "aria-describedby"?: string;
   } =>
      err[key]
         ? {
              color: "failure",
              "aria-invalid": true,
              "aria-describedby": errorId(key),
           }
         : { color: "gray" };

   return (
      <section className="space-y-6">
         {/* Identificação do voo */}
         <div className="grid grid-cols-2 gap-4 text-left lg:grid-cols-4">
            <FormField label="Data" htmlFor="data" error={err.data}>
               {/* min/max espelham o guard do backend: sem eles o campo
                   aceita qualquer ano de 4 digitos, e uma digitacao
                   errada ja gravou etapa no ano 0006. */}
               <TextInput
                  id="data"
                  type="date"
                  min={DATA_MIN}
                  max={DATA_MAX}
                  value={formData.data}
                  onChange={(e) => setField("data", e.target.value)}
                  {...estado("data")}
                  sizing="sm"
               />
            </FormField>
            <FormField label="Aeronave" htmlFor="anv" error={err.anv}>
               <Select
                  id="anv"
                  value={formData.anv}
                  onChange={(e) => setField("anv", e.target.value)}
                  {...estado("anv")}
                  sizing="sm"
                  // carregando: o proprio Select pulsa, mesma altura, zero shift
                  disabled={loadingAeronaves}
                  aria-busy={loadingAeronaves || undefined}
                  className={clsx(
                     loadingAeronaves && "animate-pulse [&_select]:cursor-wait"
                  )}
               >
                  {loadingAeronaves ? (
                     <option value={formData.anv}>Carregando...</option>
                  ) : (
                     <>
                        <option value="">Selecionar...</option>
                        {aeronavesList.map((a) => (
                           <option key={a.matricula} value={a.matricula}>
                              {a.matricula}
                           </option>
                        ))}
                     </>
                  )}
               </Select>
            </FormField>
            {(
               [
                  { key: "origem", label: "Origem", placeholder: "SBGR" },
                  { key: "destino", label: "Destino", placeholder: "SBSP" },
               ] as const
            ).map(({ key, label, placeholder }) => (
               <FormField
                  key={key}
                  label={label}
                  htmlFor={key}
                  error={err[key]}
               >
                  <TextInput
                     id={key}
                     type="text"
                     autoComplete="off"
                     value={formData[key]}
                     onChange={(e) => setField(key, toIcao(e.target.value))}
                     placeholder={placeholder}
                     maxLength={4}
                     {...estado(key)}
                     sizing="sm"
                     className="font-mono uppercase"
                  />
               </FormField>
            ))}
         </div>

         {/* Cronologia e parâmetros da etapa */}
         <div className="grid grid-cols-2 items-start gap-4 text-left sm:grid-cols-3 lg:grid-cols-6">
            <FormField label="Decolagem" htmlFor="dep" error={err.dep}>
               <TextInput
                  id="dep"
                  type="time"
                  value={formData.dep}
                  onChange={(e) => setField("dep", e.target.value)}
                  {...estado("dep")}
                  sizing="sm"
                  className="font-mono"
               />
            </FormField>
            <FormField label="Pouso" htmlFor="arr" error={err.arr}>
               <TextInput
                  id="arr"
                  type="time"
                  value={formData.arr}
                  onChange={(e) => setField("arr", e.target.value)}
                  {...estado("arr")}
                  sizing="sm"
                  className="font-mono"
               />
            </FormField>
            <FormField label="Tempo" htmlFor="tvoo" error={err.tvoo}>
               {/* Calculado de dep/arr. Input somente leitura (fora do Tab)
                   para herdar a altura dos campos vizinhos em todo breakpoint */}
               <TextInput
                  id="tvoo"
                  type="text"
                  readOnly
                  tabIndex={-1}
                  value={tvoo > 0 ? minutesToTime(tvoo) : ""}
                  placeholder="—"
                  {...estado("tvoo")}
                  color={err.tvoo ? "failure" : tvoo > 0 ? "success" : "gray"}
                  sizing="sm"
                  className="font-mono font-bold [&_input]:text-center"
               />
            </FormField>
            <FormField
               label="Qtd. Pousos"
               htmlFor="pousos"
               error={err.pousos}
               footer={
                  isRotaPousoSuspeito(formData.destino, formData.pousos) &&
                  !err.pousos && (
                     <p className="mt-1 rounded border border-amber-300 bg-amber-100 px-1 py-0.5 text-xs font-medium text-amber-700">
                        Destino ROTA: normalmente 0 pousos
                     </p>
                  )
               }
            >
               <TextInput
                  id="pousos"
                  type="number"
                  inputMode="numeric"
                  min={FIELD_LIMITS.pousos.min}
                  max={FIELD_LIMITS.pousos.max}
                  value={formData.pousos}
                  // seleciona ao focar: digitar substitui o 0 em vez de
                  // virar "03"
                  onFocus={(e) => e.target.select()}
                  onChange={(e) =>
                     setField("pousos", parseInt(e.target.value) || 0)
                  }
                  {...estado("pousos")}
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
                  className={toggleClass}
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
                  className={toggleClass}
               />
            </FormField>
         </div>

         {/* Dados complementares */}
         <div className="grid grid-cols-2 gap-4 text-left sm:grid-cols-3 lg:grid-cols-6">
            {complementares.map(({ key, label, step }) => (
               <FormField
                  key={key}
                  label={label}
                  htmlFor={key}
                  error={err[key]}
               >
                  <TextInput
                     id={key}
                     type="number"
                     inputMode={key === "lub" ? "decimal" : "numeric"}
                     min={FIELD_LIMITS[key].min}
                     max={FIELD_LIMITS[key].max}
                     step={step}
                     value={formData[key] ?? ""}
                     onChange={(e) => {
                        const v = e.target.value;
                        if (v === "") setField(key, null);
                        else {
                           const num = parseFloat(v);
                           // so o Lub e decimal; nos demais a API e `int` e
                           // recusaria 875.5 (o `step` e so dica do navegador)
                           setField(
                              key,
                              key === "lub"
                                 ? Math.round(num * 10) / 10
                                 : Math.trunc(num)
                           );
                        }
                     }}
                     placeholder="—"
                     {...estado(key)}
                     sizing="sm"
                  />
               </FormField>
            ))}
            <FormField label="Nível (FL)" htmlFor="nivel">
               <TextInput
                  id="nivel"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
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
                  className="font-mono tracking-widest [&_input]:text-center"
               />
            </FormField>
         </div>

         <FormField label="Observações" htmlFor="obs" className="text-left">
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
