"use client";

import { useState, useEffect, useMemo } from "react";
import {
   Modal,
   ModalHeader,
   ModalBody,
   Button,
   Label,
   TextInput,
   Textarea,
   ToggleSwitch,
   Spinner,
} from "flowbite-react";
import { MdCheckCircle, MdWarning, MdCancel, MdBuild } from "react-icons/md";
import { useToast } from "@/app/context/toast";
import {
   useCreateAeronave,
   useUpdateAeronave,
} from "@/hooks/queries/useAeronaves";
import {
   aeronaveFormSchema,
   defaultAeronaveValues,
   SITUACOES,
   type AeronaveFormData,
} from "../schemas/aeronaveSchema";
import type { AeronavePublic } from "services/routes/aeronaves";

interface AeronaveFormModalProps {
   show: boolean;
   onClose: () => void;
   editingAeronave: AeronavePublic | null;
}

type FormErrors = Partial<Record<keyof AeronaveFormData, string>>;

const SIT_ICONS: Record<string, React.ElementType> = {
   DI: MdCheckCircle,
   DO: MdWarning,
   IN: MdCancel,
   IS: MdBuild,
};

const SIT_COLORS: Record<string, string> = {
   DI: "text-green-500",
   DO: "text-yellow-500",
   IN: "text-red-500",
   IS: "text-blue-500",
};

export function AeronaveFormModal({
   show,
   onClose,
   editingAeronave,
}: AeronaveFormModalProps) {
   const isEditMode = !!editingAeronave;
   const { push } = useToast();
   const createMutation = useCreateAeronave();
   const updateMutation = useUpdateAeronave();

   const [formData, setFormData] = useState<AeronaveFormData>(
      defaultAeronaveValues
   );
   const [errors, setErrors] = useState<FormErrors>({});

   useEffect(() => {
      if (show) {
         if (editingAeronave) {
            setFormData({
               matricula: editingAeronave.matricula,
               sit: editingAeronave.sit,
               obs: editingAeronave.obs || null,
               active: editingAeronave.active,
            });
         } else {
            setFormData(defaultAeronaveValues);
         }
         setErrors({});
      }
   }, [show, editingAeronave]);

   const isSubmitting = createMutation.isPending || updateMutation.isPending;

   const hasChanges = useMemo(() => {
      if (!isEditMode) return formData.matricula.length === 4;
      if (!editingAeronave) return false;
      return (
         formData.sit !== editingAeronave.sit ||
         formData.obs !== (editingAeronave.obs || null) ||
         formData.active !== editingAeronave.active
      );
   }, [formData, editingAeronave, isEditMode]);

   function updateField(
      field: keyof AeronaveFormData,
      value: string | boolean | null
   ) {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => {
         const next = { ...prev };
         delete next[field];
         return next;
      });
   }

   function handleMatriculaChange(value: string) {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 4);
      updateField("matricula", digitsOnly);
   }

   async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();

      const result = aeronaveFormSchema.safeParse(formData);
      if (!result.success) {
         const fieldErrors: FormErrors = {};
         result.error.issues.forEach((issue) => {
            const field = issue.path[0] as keyof FormErrors;
            if (!fieldErrors[field]) {
               fieldErrors[field] = issue.message;
            }
         });
         setErrors(fieldErrors);
         return;
      }

      try {
         if (isEditMode) {
            const updateData: Record<string, unknown> = {};
            if (formData.sit !== editingAeronave!.sit)
               updateData.sit = formData.sit;
            if (formData.obs !== (editingAeronave!.obs || null))
               updateData.obs = formData.obs || null;
            if (formData.active !== editingAeronave!.active)
               updateData.active = formData.active;

            const res = await updateMutation.mutateAsync({
               matricula: editingAeronave!.matricula,
               data: updateData,
            });

            push({
               title: "Sucesso!",
               message: res.message || "Aeronave atualizada com sucesso",
               type: res.ok ? "success" : "error",
            });

            if (res.ok) onClose();
         } else {
            const res = await createMutation.mutateAsync({
               matricula: formData.matricula,
               active: formData.active,
               sit: formData.sit,
               obs: formData.obs || null,
            });

            push({
               title: "Sucesso!",
               message: res.message || "Aeronave cadastrada com sucesso",
               type: res.ok ? "success" : "error",
            });

            if (res.ok) onClose();
         }
      } catch (err: unknown) {
         push({
            title: "Erro",
            message:
               err instanceof Error ? err.message : "Erro ao salvar aeronave",
            type: "error",
         });
      }
   }

   const SitIcon = SIT_ICONS[formData.sit] || MdCheckCircle;
   const sitColor = SIT_COLORS[formData.sit] || "text-gray-500";

   return (
      <Modal show={show} size="lg" onClose={onClose} dismissible>
         <ModalHeader>
            {isEditMode
               ? `Editar Aeronave ${editingAeronave?.matricula}`
               : "Cadastrar Nova Aeronave"}
         </ModalHeader>
         <ModalBody>
            <form onSubmit={handleSubmit} className="space-y-5">
               {/* Matrícula */}
               <div>
                  <Label
                     htmlFor="matricula"
                     className="mb-2 block text-sm font-semibold"
                  >
                     Matrícula <span className="text-red-500">*</span>
                  </Label>
                  <TextInput
                     id="matricula"
                     type="text"
                     inputMode="numeric"
                     placeholder="0000"
                     maxLength={4}
                     value={formData.matricula}
                     onChange={(e) => handleMatriculaChange(e.target.value)}
                     disabled={isEditMode}
                     color={errors.matricula ? "failure" : "gray"}
                     className="font-mono text-lg tracking-widest"
                  />
                  {errors.matricula ? (
                     <p className="mt-1 text-sm text-red-600">
                        {errors.matricula}
                     </p>
                  ) : (
                     !isEditMode && (
                        <p className="mt-1 text-xs text-gray-500">
                           {formData.matricula.length}/4 dígitos
                        </p>
                     )
                  )}
               </div>

               {/* Situação - visual selector */}
               <div>
                  <Label className="mb-2 block text-sm font-semibold">
                     Situação <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                     {SITUACOES.map((s) => {
                        const Icon = SIT_ICONS[s.value];
                        const isSelected = formData.sit === s.value;
                        return (
                           <button
                              key={s.value}
                              type="button"
                              onClick={() => updateField("sit", s.value)}
                              className={`flex items-center gap-2.5 rounded-lg border-2 p-3 text-left transition-all ${
                                 isSelected
                                    ? "border-red-500 bg-red-50 shadow-sm"
                                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                              }`}
                           >
                              <Icon
                                 className={`h-5 w-5 shrink-0 ${SIT_COLORS[s.value]}`}
                              />
                              <div>
                                 <p
                                    className={`text-sm font-medium ${isSelected ? "text-gray-900" : "text-gray-700"}`}
                                 >
                                    {s.label}
                                 </p>
                              </div>
                           </button>
                        );
                     })}
                  </div>
                  {errors.sit && (
                     <p className="mt-1 text-sm text-red-600">{errors.sit}</p>
                  )}
               </div>

               {/* Observação - visible when sit != DI */}
               {formData.sit !== "DI" && (
                  <div>
                     <Label
                        htmlFor="obs"
                        className="mb-2 block text-sm font-semibold"
                     >
                        Observação / Restrição
                     </Label>
                     <Textarea
                        id="obs"
                        className="placeholder:text-slate-400"
                        placeholder="Descreva a restrição ou observação..."
                        rows={3}
                        value={formData.obs || ""}
                        onChange={(e) =>
                           updateField("obs", e.target.value || null)
                        }
                     />
                  </div>
               )}

               {/* Status Ativo */}
               <div className="flex items-center gap-3">
                  <Label className="text-sm font-semibold">
                     Aeronave Ativa
                  </Label>
                  <ToggleSwitch
                     checked={formData.active}
                     color="green"
                     onChange={(val) => updateField("active", val)}
                  />
               </div>

               {/* Botões */}
               <div className="flex justify-center gap-3 border-t border-gray-200 pt-4">
                  <Button
                     color="gray"
                     onClick={onClose}
                     disabled={isSubmitting}
                  >
                     Cancelar
                  </Button>
                  <Button
                     type="submit"
                     color="red"
                     disabled={!hasChanges || isSubmitting}
                  >
                     {isSubmitting ? (
                        <div className="flex items-center gap-2">
                           <Spinner size="sm" color="failure" />
                           <span>Salvando...</span>
                        </div>
                     ) : isEditMode ? (
                        "Salvar Alterações"
                     ) : (
                        "Cadastrar"
                     )}
                  </Button>
               </div>
            </form>
         </ModalBody>
      </Modal>
   );
}
