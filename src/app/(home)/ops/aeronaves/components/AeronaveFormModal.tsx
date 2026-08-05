"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
   Modal,
   ModalHeader,
   ModalBody,
   Button,
   Label,
   Select,
   TextInput,
   Textarea,
   ToggleSwitch,
   Spinner,
} from "flowbite-react";
import clsx from "clsx";
import { ApiError } from "services/Api";
import { useToast } from "@/app/context/toast";
import {
   useCreateAeronave,
   useUpdateAeronave,
   useOrgProjetos,
} from "@/hooks/queries/useAeronaves";
import {
   humanizeValidationErrors,
   translatePydanticMessage,
   type ApiErrorLabels,
} from "@/../utils/apiErrors";
import {
   aeronaveFormSchema,
   defaultAeronaveValues,
   SITUACOES,
   type AeronaveFormData,
} from "../schemas/aeronaveSchema";
import type { AeronavePublic, AeronaveUpdate } from "services/routes/aeronaves";

interface AeronaveFormModalProps {
   show: boolean;
   onClose: () => void;
   editingAeronave: AeronavePublic | null;
}

type FormErrors = Partial<Record<keyof AeronaveFormData, string>>;

/**
 * Rótulos dos erros de validação (422) vindos do backend, ex.:
 * `body.matricula` → "Matrícula". Só 6 campos — mapa local, sem arquivo
 * dedicado (ver `users/userErrors.ts` / `cegep/missoes/missaoErrors.ts` para
 * o padrão em features maiores).
 */
const AERONAVE_ERROR_LABELS: ApiErrorLabels = {
   fields: {
      matricula: "Matrícula",
      sit: "Situação",
      obs: "Observação",
      active: "Ativa",
      is_sim: "Simulador",
      projeto: "Projeto",
   },
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
   const { data: projetos = [] } = useOrgProjetos();

   const [formData, setFormData] = useState<AeronaveFormData>(
      defaultAeronaveValues
   );
   const [errors, setErrors] = useState<FormErrors>({});

   useEffect(() => {
      if (show) {
         if (editingAeronave) {
            setFormData({
               matricula: editingAeronave.matricula,
               // `AeronavePublic.sit` é `string` livre no contrato da API
               // (backend sem enum no Pydantic — ver comentário em
               // `situacaoMeta` do schema); o form é mais estrito (enum do
               // Zod), daí o cast.
               sit: editingAeronave.sit as AeronaveFormData["sit"],
               obs: editingAeronave.obs || null,
               active: editingAeronave.active,
               is_sim: editingAeronave.is_sim,
               projeto: editingAeronave.proj.id_projeto,
            });
         } else {
            setFormData(defaultAeronaveValues);
         }
         setErrors({});
      }
   }, [show, editingAeronave]);

   const isSubmitting = createMutation.isPending || updateMutation.isPending;

   // No modo criação o submit fica sempre habilitado — o Zod já valida em
   // handleSubmit e popula `errors`, então travar o botão só escondia a
   // mensagem do que faltava preencher. No modo edição mantém o guard de
   // "nada mudou" (intencional: não faz sentido salvar sem alteração).
   const hasChanges = useMemo(() => {
      if (!isEditMode) return true;
      if (!editingAeronave) return false;
      return (
         formData.sit !== editingAeronave.sit ||
         formData.obs !== (editingAeronave.obs || null) ||
         formData.active !== editingAeronave.active ||
         formData.is_sim !== editingAeronave.is_sim ||
         formData.projeto !== editingAeronave.proj.id_projeto
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

   function handleSitChange(value: AeronaveFormData["sit"]) {
      // "DI" (Disponível) não tem restrição — zera `obs` no próprio evento de
      // troca (não num efeito) para o payload nunca carregar uma observação
      // presa de uma situação anterior que não é mais exibida no form.
      setFormData((prev) => ({
         ...prev,
         sit: value,
         obs: value === "DI" ? null : prev.obs,
      }));
      setErrors((prev) => {
         const next = { ...prev };
         delete next.sit;
         return next;
      });
   }

   // Roving tabindex do radiogroup "Situação" (ARIA APG): o grupo é uma
   // única parada de Tab — só o botão selecionado (ou o primeiro, se a
   // situação vier fora da lista, ex. valor legado) tem tabIndex 0.
   const sitButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
   const selectedSitIndex = SITUACOES.findIndex(
      (s) => s.value === formData.sit
   );
   const tabbableSitIndex = selectedSitIndex === -1 ? 0 : selectedSitIndex;

   function handleSitKeyDown(
      e: React.KeyboardEvent<HTMLButtonElement>,
      index: number
   ) {
      const total = SITUACOES.length;

      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
         e.preventDefault();
         const nextIndex = (index - 1 + total) % total;
         handleSitChange(SITUACOES[nextIndex].value);
         sitButtonRefs.current[nextIndex]?.focus();
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
         e.preventDefault();
         const nextIndex = (index + 1) % total;
         handleSitChange(SITUACOES[nextIndex].value);
         sitButtonRefs.current[nextIndex]?.focus();
      } else if (e.key === " " || e.key === "Spacebar") {
         e.preventDefault();
         handleSitChange(SITUACOES[index].value);
      }
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
            const updateData: AeronaveUpdate = {};
            if (formData.sit !== editingAeronave!.sit)
               updateData.sit = formData.sit;
            if (formData.obs !== (editingAeronave!.obs || null))
               updateData.obs = formData.obs || null;
            if (formData.active !== editingAeronave!.active)
               updateData.active = formData.active;
            if (formData.is_sim !== editingAeronave!.is_sim)
               updateData.is_sim = formData.is_sim;
            if (formData.projeto !== editingAeronave!.proj.id_projeto)
               updateData.projeto = formData.projeto;

            const res = await updateMutation.mutateAsync({
               matricula: editingAeronave!.matricula,
               data: updateData,
            });

            push({
               title: "Sucesso!",
               message: res.message || "Aeronave atualizada com sucesso",
               type: "success",
            });

            onClose();
         } else {
            const res = await createMutation.mutateAsync({
               matricula: formData.matricula,
               active: formData.active,
               sit: formData.sit,
               obs: formData.obs || null,
               is_sim: formData.is_sim,
               projeto: formData.projeto,
            });

            push({
               title: "Sucesso!",
               message: res.message || "Aeronave cadastrada com sucesso",
               type: "success",
            });

            onClose();
         }
      } catch (err: unknown) {
         if (err instanceof ApiError && err.errors) {
            const fieldErrs: FormErrors = {};
            const formFields = Object.keys(
               aeronaveFormSchema.shape
            ) as (keyof AeronaveFormData)[];

            for (const [key, msg] of Object.entries(err.errors)) {
               const field = key.split(".").filter((s) => s !== "body")[0];
               if (formFields.includes(field as keyof AeronaveFormData)) {
                  fieldErrs[field as keyof AeronaveFormData] =
                     translatePydanticMessage(String(msg));
               }
            }
            setErrors(fieldErrs);

            const lines = humanizeValidationErrors(
               err.errors,
               AERONAVE_ERROR_LABELS
            );
            push({
               title: "Erro",
               message: [
                  err.message || "Erro de validação",
                  ...lines.map((l) => `• ${l}`),
               ].join("\n"),
               type: "error",
            });
            return;
         }

         push({
            title: "Erro",
            message:
               err instanceof Error ? err.message : "Erro ao salvar aeronave",
            type: "error",
         });
      }
   }

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

               {/* Projeto / Modelo */}
               <div>
                  <Label
                     htmlFor="projeto"
                     className="mb-2 block text-sm font-semibold"
                  >
                     Projeto <span className="text-red-500">*</span>
                  </Label>
                  <Select
                     id="projeto"
                     value={formData.projeto}
                     onChange={(e) => updateField("projeto", e.target.value)}
                     color={errors.projeto ? "failure" : "gray"}
                  >
                     <option value="">Selecione um projeto</option>
                     {projetos.map((p) => (
                        <option key={p.id_projeto} value={p.id_projeto}>
                           {p.id_projeto} — {p.modelo}
                        </option>
                     ))}
                  </Select>
                  {errors.projeto && (
                     <p className="mt-1 text-sm text-red-600">
                        {errors.projeto}
                     </p>
                  )}
               </div>

               {/* Situação - visual selector */}
               <div>
                  <Label
                     id="sit-label"
                     className="mb-2 block text-sm font-semibold"
                  >
                     Situação <span className="text-red-500">*</span>
                  </Label>
                  <div
                     role="radiogroup"
                     aria-labelledby="sit-label"
                     className="grid grid-cols-2 gap-2"
                  >
                     {SITUACOES.map((s, index) => {
                        const Icon = s.icon;
                        const isSelected = formData.sit === s.value;
                        return (
                           <button
                              key={s.value}
                              ref={(el) => {
                                 sitButtonRefs.current[index] = el;
                              }}
                              type="button"
                              role="radio"
                              aria-checked={isSelected}
                              tabIndex={index === tabbableSitIndex ? 0 : -1}
                              onClick={() => handleSitChange(s.value)}
                              onKeyDown={(e) => handleSitKeyDown(e, index)}
                              className={clsx(
                                 "flex items-center gap-2.5 rounded border-2 p-3 text-left transition-all",
                                 isSelected
                                    ? `${s.selected} shadow-sm`
                                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-gray-50"
                              )}
                           >
                              <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-white shadow">
                                 <Icon className={`h-5 w-5 ${s.iconColor}`} />
                              </div>
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

                  {/* Observação - expande suavemente quando sit != DI */}
                  <div
                     // Colapsado é só altura zero + overflow hidden: o
                     // <textarea> continuava na ordem do Tab, então o foco
                     // sumia dentro de um campo invisível (WCAG 2.4.3). O
                     // `inert` tira do Tab e da árvore de acessibilidade sem
                     // desmontar, preservando a animação de altura.
                     inert={formData.sit === "DI"}
                     className={clsx(
                        // Anima só a linha do grid (o `transition-all` levava
                        // cor e borda de brinde) e respeita quem pediu menos
                        // movimento.
                        "grid transition-[grid-template-rows,opacity] duration-300 ease-in-out motion-reduce:transition-none",
                        formData.sit !== "DI"
                           ? "mt-4 grid-rows-[1fr] opacity-100"
                           : "grid-rows-[0fr] opacity-0"
                     )}
                  >
                     <div className="min-h-0 overflow-hidden">
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
                  </div>
               </div>

               {/* Configurações */}
               <div className="space-y-3 rounded border border-slate-200 bg-gray-50 p-3">
                  <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                     Configurações
                  </p>
                  {/* O pill do Flowbite tem 21px de altura — abaixo do piso
                      WCAG 2.5.8 de 24px em QUALQUER ponteiro, não só no dedo.
                      O padding cresce a área clicável (o botão é o alvo
                      medido) sem mexer no desenho do pill. No dedo, `py-3`
                      parava em 42px: a raiz é 87,5% (1rem = 14px), então o
                      alvo precisa ser cravado em px. */}
                  <ToggleSwitch
                     label="Aeronave Ativa"
                     checked={formData.active}
                     color="green"
                     className="py-1.5 pointer-coarse:min-h-[44px]"
                     onChange={(val) => updateField("active", val)}
                  />
                  <ToggleSwitch
                     label="Simulador"
                     checked={formData.is_sim}
                     color="purple"
                     className="py-1.5 pointer-coarse:min-h-[44px]"
                     onChange={(val) => updateField("is_sim", val)}
                  />
               </div>

               {/* Botões */}
               <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                  <Button
                     color="gray"
                     onClick={onClose}
                     disabled={isSubmitting}
                  >
                     Cancelar
                  </Button>
                  <Button
                     type="submit"
                     color="primary"
                     disabled={!hasChanges || isSubmitting}
                  >
                     {isSubmitting ? (
                        <div className="flex items-center gap-2">
                           <Spinner
                              size="sm"
                              color="primary"
                              className="fill-white"
                           />
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
