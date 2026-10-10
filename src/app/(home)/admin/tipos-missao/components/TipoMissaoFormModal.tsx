"use client";

import { useEffect, useId, useRef, type ChangeEvent } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
   Alert,
   Button,
   Label,
   Modal,
   ModalBody,
   ModalFooter,
   ModalHeader,
   Spinner,
   TextInput,
} from "flowbite-react";
import { HiExclamation } from "react-icons/hi";
import { useToast } from "@/app/context/toast";
import type { TipoMissaoPublic } from "services/routes/estatistica/tiposMissao";
import {
   tipoMissaoFormSchema,
   TIPO_MISSAO_COD_REGEX,
   TIPO_MISSAO_FORM_VAZIO,
   type TipoMissaoFormData,
} from "../schemas/tipoMissaoSchema";
import {
   applyTipoMissaoFieldErrors,
   formatTipoMissaoSaveError,
} from "../tipoMissaoErrors";

interface TipoMissaoFormModalProps {
   show: boolean;
   /** null = criação; o tipo existente entra em edição. */
   tipo: TipoMissaoPublic | null;
   isSaving: boolean;
   onClose: () => void;
   /** Rejeita em falha — o modal devolve o erro aos campos e ao toast. */
   onSubmit: (data: TipoMissaoFormData) => Promise<void>;
}

export function TipoMissaoFormModal({
   show,
   tipo,
   isSaving,
   onClose,
   onSubmit,
}: TipoMissaoFormModalProps) {
   const { push } = useToast();
   const formId = useId();
   const codHintId = useId();
   const descHintId = useId();
   const codInputRef = useRef<HTMLInputElement | null>(null);
   // Trava síncrona: o botão de salvar fica `aria-disabled` (não `disabled`)
   // durante o envio, para o foco não cair no body; o guard é este ref.
   const enviandoRef = useRef(false);

   const {
      register,
      handleSubmit,
      reset,
      setError,
      control,
      formState: { errors, isDirty },
   } = useForm<TipoMissaoFormData>({
      resolver: zodResolver(tipoMissaoFormSchema),
      defaultValues: TIPO_MISSAO_FORM_VAZIO,
   });

   useEffect(() => {
      if (!show) return;
      enviandoRef.current = false;
      reset(tipo ? { cod: tipo.cod, desc: tipo.desc } : TIPO_MISSAO_FORM_VAZIO);
   }, [show, tipo, reset]);

   const editando = tipo !== null;
   const codAtual = useWatch({ control, name: "cod" }) ?? "";
   const codNormalizado = codAtual.trim().toUpperCase();
   // Trocar o código reclassifica as etapas já lançadas com este tipo, em
   // todas as organizações (a etapa guarda o id; as telas exibem o código).
   const codMudou =
      editando &&
      TIPO_MISSAO_COD_REGEX.test(codNormalizado) &&
      codNormalizado !== tipo.cod;

   const { ref: codRegisterRef, ...codField } = register("cod");

   function handleCodChange(e: ChangeEvent<HTMLInputElement>) {
      const input = e.target;
      const upper = input.value.toUpperCase();
      if (upper !== input.value) {
         // Preserva o cursor: reescrever o value o levaria para o fim.
         const { selectionStart, selectionEnd } = input;
         input.value = upper;
         input.setSelectionRange(selectionStart, selectionEnd);
      }
      codField.onChange(e);
   }

   async function handleFormSubmit(data: TipoMissaoFormData) {
      if (enviandoRef.current) return;
      enviandoRef.current = true;
      try {
         await onSubmit(data);
      } catch (err) {
         enviandoRef.current = false;
         applyTipoMissaoFieldErrors(err, setError);
         push({
            type: "error",
            message: formatTipoMissaoSaveError(
               err,
               "Erro ao salvar o tipo de missão"
            ),
         });
      }
   }

   function handleClose() {
      if (isSaving) return;
      onClose();
   }

   return (
      <Modal
         show={show}
         onClose={handleClose}
         size="lg"
         dismissible={!isSaving}
         initialFocus={codInputRef}
      >
         <ModalHeader>
            {editando ? `Editar tipo ${tipo.cod}` : "Novo tipo de missão"}
         </ModalHeader>
         <ModalBody>
            <form
               id={formId}
               noValidate
               onSubmit={handleSubmit(handleFormSubmit)}
               className="space-y-4"
            >
               <div className="grid gap-4 sm:grid-cols-[9rem_minmax(0,1fr)]">
                  <div className="flex flex-col gap-2">
                     <Label htmlFor="tipo-missao-cod">Código</Label>
                     <TextInput
                        id="tipo-missao-cod"
                        {...codField}
                        ref={(el) => {
                           codRegisterRef(el);
                           codInputRef.current = el;
                        }}
                        onChange={handleCodChange}
                        maxLength={4}
                        placeholder="01AB"
                        autoComplete="off"
                        spellCheck={false}
                        color={errors.cod ? "failure" : "gray"}
                        aria-invalid={errors.cod ? true : undefined}
                        aria-describedby={codHintId}
                     />
                     <p
                        id={codHintId}
                        className={
                           errors.cod
                              ? "text-xs text-red-600"
                              : "text-xs text-slate-500"
                        }
                     >
                        {errors.cod?.message ?? "2 dígitos + 2 letras"}
                     </p>
                  </div>

                  <div className="flex flex-col gap-2">
                     <Label htmlFor="tipo-missao-desc">Descrição</Label>
                     <TextInput
                        id="tipo-missao-desc"
                        {...register("desc")}
                        placeholder="Ex.: Transporte aéreo logístico"
                        autoComplete="off"
                        color={errors.desc ? "failure" : "gray"}
                        aria-invalid={errors.desc ? true : undefined}
                        aria-describedby={errors.desc ? descHintId : undefined}
                     />
                     {errors.desc && (
                        <p id={descHintId} className="text-xs text-red-600">
                           {errors.desc.message}
                        </p>
                     )}
                  </div>
               </div>

               {codMudou && (
                  <Alert color="warning" icon={HiExclamation}>
                     <span className="text-sm">
                        As etapas já lançadas como{" "}
                        <span className="font-mono font-semibold">
                           {tipo.cod}
                        </span>
                        , em todas as organizações, passam a aparecer como{" "}
                        <span className="font-mono font-semibold">
                           {codNormalizado}
                        </span>
                        .
                     </span>
                  </Alert>
               )}
            </form>
         </ModalBody>
         <ModalFooter>
            <Button
               type="submit"
               form={formId}
               color="primary"
               disabled={editando && !isDirty}
               aria-disabled={isSaving || undefined}
               aria-busy={isSaving}
            >
               {isSaving ? (
                  <>
                     <Spinner size="sm" color="white" className="mr-2" />
                     Salvando…
                  </>
               ) : editando ? (
                  "Salvar alterações"
               ) : (
                  "Cadastrar"
               )}
            </Button>
            <Button color="light" onClick={handleClose} disabled={isSaving}>
               Cancelar
            </Button>
         </ModalFooter>
      </Modal>
   );
}
