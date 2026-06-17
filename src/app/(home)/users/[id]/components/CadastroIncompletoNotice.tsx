/**
 * Aviso (não-bloqueante) de completude de cadastro. A lista de campos
 * pendentes vem pronta do backend (`user.campos_pendentes`). Cada chip rola
 * até o campo e abre a sua edição (quando editável).
 */

import { HiExclamation } from "react-icons/hi";
import { useFieldFocus } from "./FieldFocusContext";
import { USER_FIELD_LABELS } from "./userFieldLabels";

export function CadastroIncompletoNotice({
   pendentes,
}: {
   pendentes: string[];
}) {
   const { requestFocus } = useFieldFocus();

   if (pendentes.length === 0) return null;

   return (
      <div className="flex items-start gap-3 rounded border border-amber-300 bg-amber-50 px-4 py-3">
         <HiExclamation className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
         <div className="min-w-0 text-sm text-amber-800">
            <p className="font-semibold">Cadastro incompleto</p>
            <p className="mt-1 text-amber-700">
               {pendentes.length === 1
                  ? "Falta preencher 1 campo. Clique para ir até ele:"
                  : `Faltam preencher ${pendentes.length} campos. Clique para ir até cada um:`}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
               {pendentes.map((field) => (
                  <button
                     key={field}
                     type="button"
                     onClick={() => requestFocus(field)}
                     className="rounded border border-amber-300 bg-white px-2.5 py-1 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100"
                  >
                     {USER_FIELD_LABELS[field] ?? field}
                  </button>
               ))}
            </div>
         </div>
      </div>
   );
}
