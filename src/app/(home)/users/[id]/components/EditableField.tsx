/**
 * Campo com edição inline. Exibe o valor e, ao clicar no lápis (ou quando o
 * banner de cadastro incompleto solicita foco), abre o editor adequado ao
 * tipo (texto, data, número, telefone com máscara, select ou searchable).
 */

import { useContext, useEffect, useRef, useState } from "react";
import { useMask } from "@react-input/mask";
import { TextInput, Select, Spinner } from "flowbite-react";
import { HiPencil, HiCheck, HiX } from "react-icons/hi";
import type { UserUpdate } from "services/routes/users";
import { formatPhone, phoneMaskConfig } from "@/constants/formats";
import { SearchableSelect } from "@/components/SearchableSelect";
import { useUpdateUser } from "@/hooks/queries";
import { useToast } from "@/app/context/toast";
import { formatUserSaveError } from "../../userErrors";
import { FieldFocusContext } from "./FieldFocusContext";

export type FieldType =
   "text" | "email" | "date" | "number" | "select" | "searchable" | "phone";

export interface FieldConfig {
   icon: React.ComponentType<{ className?: string }>;
   label: string;
   fieldName: keyof UserUpdate;
   value: string | null | undefined;
   rawValue: string;
   type?: FieldType;
   options?: { value: string; label: string }[];
   maxLength?: number;
}

export function EditableField({
   icon: Icon,
   label,
   value,
   rawValue,
   fieldName,
   userId,
   type = "text",
   options,
   maxLength,
}: FieldConfig & { userId: number }) {
   const [editing, setEditing] = useState(false);
   const [localValue, setLocalValue] = useState(rawValue);
   const updateMutation = useUpdateUser();
   const { push } = useToast();
   const { focusReq } = useContext(FieldFocusContext);
   // Último nonce de foco já tratado — evita reabrir a edição quando o
   // efeito re-roda por mudança de `rawValue` (ex.: refetch após salvar).
   const lastFocusN = useRef(0);

   const saving = updateMutation.isPending;

   const phoneMaskRef = useMask(phoneMaskConfig);

   function startEdit() {
      setLocalValue(type === "phone" ? formatPhone(rawValue) : rawValue);
      setEditing(true);
   }

   // Abre a edição apenas quando o banner solicita um NOVO foco neste
   // campo (nonce inédito), não a cada mudança de valor.
   useEffect(() => {
      if (focusReq?.field === fieldName && focusReq.n !== lastFocusN.current) {
         lastFocusN.current = focusReq.n;
         setLocalValue(type === "phone" ? formatPhone(rawValue) : rawValue);
         setEditing(true);
      }
   }, [focusReq, fieldName, rawValue, type]);

   function cancelEdit() {
      setLocalValue(rawValue);
      setEditing(false);
   }

   async function save() {
      const stripped =
         type === "phone" ? localValue.replace(/\D/g, "") : localValue;
      const newVal =
         type === "number" ? Number(stripped) || null : stripped || null;
      if (
         String(newVal ?? "").toLowerCase() ===
         String(rawValue ?? "").toLowerCase()
      ) {
         setEditing(false);
         return;
      }

      try {
         await updateMutation.mutateAsync({
            id: userId,
            data: { [fieldName]: newVal } as UserUpdate,
         });

         push({ message: `${label} atualizado`, type: "success" });
         setEditing(false);
      } catch (err: unknown) {
         push({
            message: formatUserSaveError(err, "Erro ao atualizar"),
            type: "error",
         });
      }
   }

   function handleKeyDown(e: React.KeyboardEvent) {
      if (e.key === "Enter") save();
      if (e.key === "Escape") cancelEdit();
   }

   if (editing) {
      return (
         <div
            id={`field-${fieldName}`}
            className="flex items-center gap-3 px-5 py-3"
         >
            <div className="shrink-0 rounded-md bg-blue-100 p-2.5">
               <Icon className="h-4 w-4 text-blue-600" />
            </div>
            <div className="min-w-0">
               <p className="mb-1 text-xs font-medium tracking-wide text-gray-500 uppercase">
                  {label}
               </p>
               <div className="flex items-center gap-1.5">
                  <div className="max-w-sm">
                     {type === "phone" ? (
                        <input
                           ref={phoneMaskRef}
                           type="text"
                           value={localValue}
                           onChange={(e) => setLocalValue(e.target.value)}
                           onKeyDown={handleKeyDown}
                           placeholder="(__) _____-____"
                           className="block w-40 rounded border border-gray-300 bg-gray-50 px-2 py-1.5 text-xs text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                           autoFocus
                        />
                     ) : type === "select" && options ? (
                        <Select
                           sizing="sm"
                           value={localValue}
                           onChange={(e) => setLocalValue(e.target.value)}
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
                     ) : type === "searchable" && options ? (
                        <SearchableSelect
                           sizing="sm"
                           clearable
                           value={localValue}
                           onChange={setLocalValue}
                           options={options}
                        />
                     ) : (
                        <TextInput
                           sizing="sm"
                           type={type}
                           value={localValue}
                           onChange={(e) => setLocalValue(e.target.value)}
                           onKeyDown={handleKeyDown}
                           maxLength={maxLength}
                           autoFocus
                        />
                     )}
                  </div>
                  {saving ? (
                     <Spinner size="sm" color="failure" />
                  ) : (
                     <>
                        <button
                           onClick={save}
                           className="shrink-0 rounded p-1 text-green-600 transition-colors hover:bg-green-50"
                           aria-label="Salvar"
                        >
                           <HiCheck className="h-4.5 w-4.5" />
                        </button>
                        <button
                           onClick={cancelEdit}
                           className="shrink-0 rounded p-1 text-gray-400 transition-colors hover:bg-gray-100"
                           aria-label="Cancelar"
                        >
                           <HiX className="h-4.5 w-4.5" />
                        </button>
                     </>
                  )}
               </div>
            </div>
         </div>
      );
   }

   return (
      <div
         id={`field-${fieldName}`}
         className="group flex items-center gap-3 px-5 py-3.5"
      >
         <div className="shrink-0 rounded-md bg-red-100 p-2.5">
            <Icon className="h-4 w-4 text-red-600" />
         </div>
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
                  className="shrink-0 rounded p-0.5 text-gray-300 opacity-0 transition-all group-hover:opacity-100 hover:bg-gray-100 hover:text-gray-600"
                  aria-label={`Editar ${label}`}
               >
                  <HiPencil className="h-3.5 w-3.5" />
               </button>
            </div>
         </div>
      </div>
   );
}
