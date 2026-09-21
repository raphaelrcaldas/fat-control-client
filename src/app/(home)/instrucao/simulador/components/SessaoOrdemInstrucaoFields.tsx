import { Alert, Button, Select } from "flowbite-react";
import Field from "./Field";
import type { SessaoForm } from "../hooks/useSessaoForm";

export default function SessaoOrdemInstrucaoFields({
   form,
}: {
   form: SessaoForm;
}) {
   const {
      tipoMissaoId,
      setTipoMissaoId,
      tiposMissaoData,
      reg,
      setReg,
      smlEsfAer,
      isDataError,
      dataErrorMessage,
      retryLoadingData,
      isRefetchingData,
   } = form;

   return (
      <div className="space-y-3 rounded border border-slate-200 bg-gray-50 p-4 shadow-sm">
         {isDataError && (
            <Alert color="failure">
               <div className="flex flex-wrap items-center gap-3">
                  <p>{dataErrorMessage}</p>
                  <Button
                     type="button"
                     color="light"
                     size="xs"
                     onClick={() => void retryLoadingData()}
                     disabled={isRefetchingData}
                  >
                     {isRefetchingData ? "Carregando..." : "Tentar novamente"}
                  </Button>
               </div>
            </Alert>
         )}
         <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field id="ses-tipo-missao" label="Tipo de Missão">
               <Select
                  id="ses-tipo-missao"
                  value={tipoMissaoId ?? ""}
                  onChange={(e) => setTipoMissaoId(Number(e.target.value))}
                  sizing="sm"
               >
                  {(tiposMissaoData ?? []).map((t) => (
                     <option key={t.id} value={t.id}>
                        {t.cod} — {t.desc}
                     </option>
                  ))}
               </Select>
            </Field>
            <Field id="ses-reg" label="Regime">
               <Select
                  id="ses-reg"
                  value={reg}
                  onChange={(e) => setReg(e.target.value as "d" | "n" | "v")}
                  sizing="sm"
               >
                  <option value="d">Diurno</option>
                  <option value="n">Noturno</option>
                  <option value="v">NVG</option>
               </Select>
            </Field>
         </div>
         {smlEsfAer && (
            <p className="text-xs text-gray-400">
               Esforço Aéreo:{" "}
               <span className="font-mono font-medium text-gray-600">
                  {smlEsfAer.descricao}
               </span>
            </p>
         )}
      </div>
   );
}
