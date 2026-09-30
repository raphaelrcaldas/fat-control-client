import { TextInput, Label, ToggleSwitch } from "flowbite-react";
import { minutesToTime } from "@/../utils/dateHandler";
import Field from "./Field";
import type { SessaoForm } from "../hooks/useSessaoForm";
import { EtapaVerifBadge } from "../../../estatistica/etapas/missao/components/EtapaVerifBadge";
import {
   DATA_MAX,
   DATA_MIN,
} from "../../../estatistica/etapas/missao/context/validators";

/**
 * `anoRef` nulo = qualquer ano da janela `DATA_MIN`/`DATA_MAX` (sessão nova num
 * editor de missão). Com ano, `min`/`max` prendem o seletor a ele.
 */
export type SessaoDadosForm = Pick<
   SessaoForm,
   | "data"
   | "setData"
   | "origem"
   | "setOrigem"
   | "destino"
   | "setDestino"
   | "pousos"
   | "setPousos"
   | "dep"
   | "setDep"
   | "arr"
   | "setArr"
   | "tvoo"
   | "tvooValid"
   | "crossesDay"
   | "depArrEqual"
   | "dateOutOfYear"
   | "sagem"
   | "setSagem"
   | "parte1"
   | "setParte1"
> & { anoRef: number | null };

export default function SessaoDadosFields({ form }: { form: SessaoDadosForm }) {
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
      depArrEqual,
      dateOutOfYear,
      anoRef,
   } = form;

   const tvooInvalid = crossesDay || depArrEqual;
   const tvooColor =
      !dep || !arr
         ? "border-slate-200 bg-gray-50 text-gray-400"
         : tvooInvalid
           ? "border-red-200 bg-red-50 text-red-700"
           : tvooValid
             ? "border-green-200 bg-green-50 text-green-700"
             : "border-amber-200 bg-amber-50 text-amber-700";

   return (
      <div className="space-y-3 rounded border border-slate-200 bg-gray-50 p-4 shadow-sm">
         <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field id="ses-data" label="Data">
               {/* min/max prendem o seletor ao ano de referencia: sem eles o
                   campo aceita qualquer ano de 4 digitos, e um deslize de
                   digitacao ja gravou sessao no ano 0006. Sessao nova numa
                   missao existente (`anoRef` nulo) aceita qualquer ano, mas
                   dentro da janela de sanidade (`DATA_MIN`/`DATA_MAX`): a
                   dupla que cruza a virada do ano continua na mesma missao. */}
               <TextInput
                  id="ses-data"
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  min={anoRef === null ? DATA_MIN : `${anoRef}-01-01`}
                  max={anoRef === null ? DATA_MAX : `${anoRef}-12-31`}
                  sizing="sm"
                  color={dateOutOfYear ? "failure" : undefined}
                  required
               />
               {anoRef !== null && dateOutOfYear && (
                  <span className="mt-1 text-xs text-red-600">
                     Fora do ano de referência
                  </span>
               )}
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
               {/* `parseInt(...) || 0` como em estatistica/etapas: com
                   `Math.max(0, Number(v))` uma entrada incompleta ("-", "e")
                   virava NaN, que `Math.max` propaga, o JSON serializa como
                   null e o backend recusa com 422 sem dizer qual campo. */}
               <TextInput
                  id="ses-pousos"
                  type="number"
                  value={pousos}
                  onChange={(e) =>
                     setPousos(Math.max(0, parseInt(e.target.value) || 0))
                  }
                  sizing="sm"
                  min={0}
                  max={20}
               />
            </Field>
         </div>

         <div className="grid grid-cols-3 gap-3 sm:grid-cols-[1fr_1fr_1fr_auto_auto]">
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
                  {depArrEqual
                     ? "DEP = ARR"
                     : crossesDay
                       ? "ATRAVESSA DIA"
                       : dep && arr
                         ? minutesToTime(tvoo)
                         : "—"}
               </div>
               {depArrEqual && (
                  <span className="text-xs text-red-600">
                     Decolagem e pouso iguais
                  </span>
               )}
               {crossesDay && (
                  <span className="text-xs text-red-600">
                     Use 00:00 como fim do dia
                  </span>
               )}
               {dep &&
                  arr &&
                  !crossesDay &&
                  !depArrEqual &&
                  !tvooValid &&
                  tvoo > 0 && (
                     <span className="text-xs text-amber-600">
                        Múltiplo de 5 min
                     </span>
                  )}
            </div>
            <div className="flex flex-col items-center gap-1">
               <EtapaVerifBadge label="SAGEM" ok={form.sagem} />
               <ToggleSwitch
                  className="min-h-[24px] items-center"
                  aria-label="Registrado no SAGEM"
                  checked={form.sagem}
                  color="green"
                  onChange={form.setSagem}
               />
            </div>
            <div className="flex flex-col items-center gap-1">
               <EtapaVerifBadge label="FICHA" ok={form.parte1} />
               <ToggleSwitch
                  className="min-h-[24px] items-center"
                  aria-label="Ficha recolhida"
                  checked={form.parte1}
                  color="green"
                  onChange={form.setParte1}
               />
            </div>
         </div>
      </div>
   );
}
