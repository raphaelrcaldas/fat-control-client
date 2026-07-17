"use client";

import { useEffect, useState } from "react";
import {
   Modal,
   ModalHeader,
   ModalBody,
   Button,
   Label,
   TextInput,
   Spinner,
} from "flowbite-react";
import { MdSearch, MdLock, MdSwapHoriz, MdCalendarMonth } from "react-icons/md";
import { daysInclusive } from "@/../utils/dateHandler";
import { useToast } from "@/app/context/toast";
import { SearchUser } from "@/app/(home)/users/components/searchUser";
import { useAddPessoal, useUpdatePessoal } from "@/hooks/queries/useOperacoes";
import type {
   OperacaoDetail,
   OperacaoPessoalOut,
} from "services/routes/ops/operacoes";
import type { UserPublic } from "services/routes/users";
import {
   FUNC_VALUES,
   SIT_VALUES,
   pessoalFormSchema,
   type FuncOption,
   type SitOption,
} from "../schemas/operacaoSchema";
import { FUNC_STYLE, SIT_LABEL, SIT_STYLE } from "./operacaoUi";
import { PillSelect } from "./PillSelect";

interface FormState {
   user_id: number;
   func: "" | FuncOption;
   sit: "" | SitOption;
   data_ingresso: string;
   data_regresso: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

interface Props {
   show: boolean;
   onClose: () => void;
   op: OperacaoDetail;
   editing: OperacaoPessoalOut | null;
}

const FUNC_OPTIONS = FUNC_VALUES.map((v) => ({ value: v, label: v }));
const SIT_OPTIONS = SIT_VALUES.map((v) => ({ value: v, label: SIT_LABEL[v] }));

const EMPTY: FormState = {
   user_id: 0,
   func: "",
   sit: "",
   data_ingresso: "",
   data_regresso: "",
};

export function PessoalFormModal({ show, onClose, op, editing }: Props) {
   const isEdit = !!editing;
   const { push } = useToast();
   const addMutation = useAddPessoal(op.id);
   const updateMutation = useUpdatePessoal(op.id);

   const [militar, setMilitar] = useState<{
      pg: string;
      nome: string;
      sub: string;
   } | null>(null);
   const [form, setForm] = useState<FormState>(EMPTY);
   const [errors, setErrors] = useState<FormErrors>({});
   const [showSearch, setShowSearch] = useState(false);

   useEffect(() => {
      if (!show) return;
      if (editing) {
         setForm({
            user_id: editing.user.id,
            func: editing.func,
            sit: editing.sit,
            data_ingresso: editing.data_ingresso,
            data_regresso: editing.data_regresso,
         });
         setMilitar({
            pg: editing.user.p_g,
            nome: editing.user.nome_guerra,
            sub: editing.user.unidade,
         });
      } else {
         setForm({
            ...EMPTY,
            data_ingresso: op.data_inicio,
            data_regresso: op.data_fim,
         });
         setMilitar(null);
      }
      setErrors({});
   }, [show, editing, op.data_inicio, op.data_fim]);

   const isSubmitting = addMutation.isPending || updateMutation.isPending;
   const dias = daysInclusive(form.data_ingresso, form.data_regresso);

   function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
      setForm((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => {
         const next = { ...prev };
         delete next[field];
         return next;
      });
   }

   function onUserSelected(user: UserPublic) {
      setField("user_id", user.id);
      setMilitar({
         pg: user.p_g,
         nome: user.nome_guerra,
         sub: user.unidade,
      });
   }

   async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      const result = pessoalFormSchema.safeParse(form);
      if (!result.success) {
         const fieldErrors: FormErrors = {};
         result.error.issues.forEach((issue) => {
            const field = issue.path[0] as keyof FormErrors;
            if (field && !fieldErrors[field]) {
               fieldErrors[field] = issue.message;
            }
         });
         setErrors(fieldErrors);
         return;
      }

      try {
         const res = isEdit
            ? await updateMutation.mutateAsync({
                 pessoalId: editing!.id,
                 data: result.data,
              })
            : await addMutation.mutateAsync(result.data);
         push({
            title: res.ok ? "Sucesso!" : "Erro",
            message:
               res.message ||
               (isEdit ? "Militar atualizado" : "Militar associado"),
            type: res.ok ? "success" : "error",
         });
         if (res.ok) onClose();
      } catch (err: unknown) {
         push({
            title: "Erro",
            message: err instanceof Error ? err.message : "Erro ao salvar",
            type: "error",
         });
      }
   }

   return (
      <>
         <Modal show={show} size="lg" onClose={onClose} dismissible>
            <ModalHeader>
               {isEdit ? "Editar militar" : "Associar militar"}
            </ModalHeader>
            <ModalBody>
               <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Militar — cartão de seleção */}
                  <div>
                     <Label className="mb-1.5 block text-sm font-semibold">
                        Militar <span className="text-red-500">*</span>
                     </Label>
                     <button
                        type="button"
                        onClick={() => !isEdit && setShowSearch(true)}
                        disabled={isEdit}
                        className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                           militar
                              ? "border-slate-200 bg-slate-50"
                              : "hover:border-primary-300 hover:bg-primary-50/30 border-dashed border-gray-300 bg-white"
                        } ${isEdit ? "cursor-not-allowed" : "cursor-pointer"}`}
                     >
                        {militar ? (
                           <>
                              <span className="bg-primary-600 flex h-10 min-w-10 shrink-0 items-center justify-center rounded-full px-1.5 font-mono text-sm font-bold text-white uppercase">
                                 {militar.pg}
                              </span>
                              <span className="flex min-w-0 flex-1 flex-col">
                                 <span className="truncate text-sm font-bold text-slate-800 uppercase">
                                    {militar.nome}
                                 </span>
                                 <span className="truncate text-xs text-slate-500 uppercase">
                                    {militar.sub}
                                 </span>
                              </span>
                              {isEdit ? (
                                 <MdLock className="h-4 w-4 shrink-0 text-slate-300" />
                              ) : (
                                 <span className="text-primary-600 flex shrink-0 items-center gap-1 text-xs font-semibold opacity-0 transition-opacity group-hover:opacity-100">
                                    <MdSwapHoriz className="h-4 w-4" />
                                    Trocar
                                 </span>
                              )}
                           </>
                        ) : (
                           <>
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                                 <MdSearch className="h-5 w-5" />
                              </span>
                              <span className="flex-1 text-sm text-gray-400">
                                 Buscar e selecionar militar…
                              </span>
                           </>
                        )}
                     </button>
                     {errors.user_id && (
                        <p className="mt-1 text-sm text-red-600">
                           {errors.user_id}
                        </p>
                     )}
                  </div>

                  {/* Função — pills com cor própria */}
                  <PillSelect
                     label="Função"
                     required
                     value={form.func}
                     options={FUNC_OPTIONS}
                     styles={FUNC_STYLE}
                     onChange={(v) => setField("func", v as FuncOption)}
                     error={errors.func}
                  />

                  {/* Situação financeira — pills (refs de cor do cegep) */}
                  <PillSelect
                     label="Situação"
                     required
                     value={form.sit}
                     options={SIT_OPTIONS}
                     styles={SIT_STYLE}
                     onChange={(v) => setField("sit", v as SitOption)}
                     error={errors.sit}
                  />

                  {/* Período na operação */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                     <div className="mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-slate-500 uppercase">
                           <MdCalendarMonth className="h-4 w-4 text-slate-400" />
                           Período na operação
                        </span>
                        {dias !== null && (
                           <span className="bg-primary-100 text-primary-700 rounded-full px-2.5 py-0.5 font-mono text-xs font-bold tabular-nums">
                              {dias} {dias === 1 ? "dia" : "dias"}
                           </span>
                        )}
                     </div>
                     <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                           <Label
                              htmlFor="data_ingresso"
                              className="mb-1.5 block text-xs font-medium text-slate-500"
                           >
                              Ingresso <span className="text-red-500">*</span>
                           </Label>
                           <TextInput
                              id="data_ingresso"
                              type="date"
                              value={form.data_ingresso}
                              onChange={(e) =>
                                 setField("data_ingresso", e.target.value)
                              }
                              color={errors.data_ingresso ? "failure" : "gray"}
                           />
                           {errors.data_ingresso && (
                              <p className="mt-1 text-sm text-red-600">
                                 {errors.data_ingresso}
                              </p>
                           )}
                        </div>
                        <div>
                           <Label
                              htmlFor="data_regresso"
                              className="mb-1.5 block text-xs font-medium text-slate-500"
                           >
                              Regresso <span className="text-red-500">*</span>
                           </Label>
                           <TextInput
                              id="data_regresso"
                              type="date"
                              value={form.data_regresso}
                              onChange={(e) =>
                                 setField("data_regresso", e.target.value)
                              }
                              color={errors.data_regresso ? "failure" : "gray"}
                           />
                           {errors.data_regresso && (
                              <p className="mt-1 text-sm text-red-600">
                                 {errors.data_regresso}
                              </p>
                           )}
                        </div>
                     </div>
                  </div>

                  <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
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
                        disabled={isSubmitting}
                     >
                        {isSubmitting ? (
                           <Spinner size="sm" color="primary" />
                        ) : isEdit ? (
                           "Salvar"
                        ) : (
                           "Adicionar"
                        )}
                     </Button>
                  </div>
               </form>
            </ModalBody>
         </Modal>

         <SearchUser
            show={showSearch}
            setShow={setShowSearch}
            setUser={onUserSelected}
         />
      </>
   );
}
