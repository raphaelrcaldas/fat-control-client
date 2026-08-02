/**
 * Campo com edição inline do tripulante. Exibe o valor e, ao clicar no
 * lápis, abre o editor adequado ao tipo (texto, data ou select), salvando
 * um único campo por PATCH. Porte de `users/[id]/components/EditableField`
 * sem `type="phone"` e sem `FieldFocusContext` (não há banner de pendências
 * no tripulante, então não há consumidor do contexto de foco).
 */

import { useState } from "react";
import clsx from "clsx";
import { TextInput, Select, Spinner } from "flowbite-react";
import { HiPencil, HiCheck, HiX } from "react-icons/hi";
import type { UpdateTripData } from "services/routes/trips";
import { usePatchTrip } from "@/hooks/queries/useTrips";
import { useToast } from "@/app/context/toast";
import { formatSaveError } from "utils/apiErrors";
import { FieldIconChip } from "@/app/(home)/users/[id]/components/FieldIconChip";
import { TRIP_FIELD_LABELS } from "./tripFieldLabels";

const ERROR_LABELS = { fields: TRIP_FIELD_LABELS };

export type TripFieldType = "text" | "date" | "select";

export interface TripFieldOption {
   value: string;
   label: string;
}

export interface TripFieldConfig {
   icon: React.ComponentType<{ className?: string }>;
   label: string;
   fieldName: keyof UpdateTripData;
   value: string | null | undefined;
   rawValue: string;
   type?: TripFieldType;
   options?: TripFieldOption[];
   maxLength?: number;
   /** Converte o valor digitado (e exibido) para maiúsculas — ex.: trig. */
   uppercase?: boolean;
   /** Filtro de tecla aplicado ao digitar (ex.: só letras no trigrama). */
   keyFilter?: (key: string) => boolean;
   /**
    * Bloqueia salvar o campo vazio, explicando o motivo em vez de deixar o
    * PATCH falhar no backend. Ex.: `data_op` é obrigatório para tripulante
    * não-aluno (`schemas/ops/tripulantes.py:28-33`).
    */
   blockClear?: boolean;
   blockClearMessage?: string;
}

export function EditableTripField({
   icon: Icon,
   label,
   value,
   rawValue,
   fieldName,
   tripId,
   type = "text",
   options,
   maxLength,
   uppercase,
   keyFilter,
   blockClear,
   blockClearMessage,
}: TripFieldConfig & { tripId: number }) {
   const [editing, setEditing] = useState(false);
   const [localValue, setLocalValue] = useState(rawValue);
   const [blockMsg, setBlockMsg] = useState<string | null>(null);
   const patchMutation = usePatchTrip();
   const { push } = useToast();

   const saving = patchMutation.isPending;

   /** Forma canônica do valor no editor — ex.: trigrama é maiúsculo. */
   function normalize(v: string) {
      return uppercase ? v.toUpperCase() : v;
   }

   function startEdit() {
      setLocalValue(normalize(rawValue));
      setBlockMsg(null);
      setEditing(true);
   }

   function cancelEdit() {
      setLocalValue(normalize(rawValue));
      setBlockMsg(null);
      setEditing(false);
   }

   function changeValue(v: string) {
      setLocalValue(normalize(v));
   }

   async function save() {
      const newVal = localValue.trim() || null;

      if (blockClear && newVal === null) {
         setBlockMsg(
            blockClearMessage ?? "Este campo não pode ficar em branco."
         );
         return;
      }

      if (
         String(newVal ?? "").toLowerCase() ===
         String(rawValue ?? "").toLowerCase()
      ) {
         setEditing(false);
         return;
      }

      try {
         await patchMutation.mutateAsync({
            id: tripId,
            data: { [fieldName]: newVal } as Partial<UpdateTripData>,
         });

         push({ message: `${label} atualizado`, type: "success" });
         setEditing(false);
      } catch (err: unknown) {
         push({
            message: formatSaveError(err, "Erro ao atualizar", ERROR_LABELS),
            type: "error",
         });
      }
   }

   function handleKeyDown(e: React.KeyboardEvent) {
      if (keyFilter && !keyFilter(e.key)) {
         e.preventDefault();
         return;
      }
      if (e.key === "Enter") save();
      if (e.key === "Escape") cancelEdit();
   }

   if (editing) {
      return (
         <div
            id={`field-${fieldName}`}
            className="flex items-center gap-3 px-5 py-3"
         >
            <FieldIconChip icon={Icon} tone="blue" />
            <div className="min-w-0 flex-1">
               <p className="mb-1 text-xs font-medium tracking-wide text-gray-500 uppercase">
                  {label}
               </p>
               <div className="flex items-center gap-1.5">
                  {/* Select precisa de mais largura que trigrama/data para
                      caber o rótulo inteiro da opção sem truncar. */}
                  <div
                     className={clsx(
                        "w-full",
                        type === "select" ? "max-w-sm" : "max-w-48"
                     )}
                  >
                     {type === "select" && options ? (
                        <Select
                           aria-label={label}
                           value={localValue}
                           onChange={(e) => changeValue(e.target.value)}
                           onKeyDown={handleKeyDown}
                           autoFocus
                        >
                           <option value="" disabled>
                              Selecione...
                           </option>
                           {options.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                 {opt.label}
                              </option>
                           ))}
                        </Select>
                     ) : (
                        <TextInput
                           aria-label={label}
                           type={type}
                           className={clsx(uppercase && "uppercase")}
                           value={localValue}
                           onChange={(e) => changeValue(e.target.value)}
                           onKeyDown={handleKeyDown}
                           maxLength={maxLength}
                           autoFocus
                        />
                     )}
                  </div>
                  {saving ? (
                     <Spinner size="sm" color="primary" />
                  ) : (
                     <>
                        <button
                           onClick={save}
                           className="shrink-0 rounded p-1 text-green-600 transition-colors hover:bg-green-50 pointer-coarse:p-2"
                           aria-label="Salvar"
                        >
                           <HiCheck className="h-4.5 w-4.5" />
                        </button>
                        <button
                           onClick={cancelEdit}
                           className="shrink-0 rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 pointer-coarse:p-2"
                           aria-label="Cancelar"
                        >
                           <HiX className="h-4.5 w-4.5" />
                        </button>
                     </>
                  )}
               </div>
               {blockMsg && (
                  <p className="mt-1 text-xs text-red-600">{blockMsg}</p>
               )}
            </div>
         </div>
      );
   }

   return (
      <div
         id={`field-${fieldName}`}
         className="group flex items-center gap-3 px-5 py-3.5"
      >
         <FieldIconChip icon={Icon} />
         <div className="min-w-0">
            <p className="mb-0.5 text-xs font-medium tracking-wide text-gray-500 uppercase">
               {label}
            </p>
            <div className="flex items-center gap-1.5">
               <p className="text-sm leading-tight font-semibold text-gray-900 select-all">
                  {value || "—"}
               </p>
               <button
                  onClick={startEdit}
                  className="shrink-0 rounded p-0.5 text-gray-300 opacity-100 transition-all hover:bg-gray-100 hover:text-gray-600 pointer-coarse:p-2.5 pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100"
                  aria-label={`Editar ${label}`}
               >
                  <HiPencil className="h-3.5 w-3.5" />
               </button>
            </div>
         </div>
      </div>
   );
}
