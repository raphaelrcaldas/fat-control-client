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
import { MdPerson, MdSearch } from "react-icons/md";
import { useToast } from "@/app/context/toast";
import { SearchUser } from "@/app/(home)/users/components/searchUser";
import { useAddPessoal, useUpdatePessoal } from "@/hooks/queries/useOperacoes";
import type {
   OperacaoDetail,
   OperacaoPessoalOut,
} from "services/routes/ops/operacoes";
import type { UserPublic } from "services/routes/users";
import {
   pessoalFormSchema,
   type PessoalFormData,
} from "../schemas/operacaoSchema";

type FormErrors = Partial<Record<keyof PessoalFormData, string>>;

interface Props {
   show: boolean;
   onClose: () => void;
   op: OperacaoDetail;
   editing: OperacaoPessoalOut | null;
}

export function PessoalFormModal({ show, onClose, op, editing }: Props) {
   const isEdit = !!editing;
   const { push } = useToast();
   const addMutation = useAddPessoal(op.id);
   const updateMutation = useUpdatePessoal(op.id);

   const [userLabel, setUserLabel] = useState("");
   const [form, setForm] = useState<PessoalFormData>({
      user_id: 0,
      func: "",
      om: "",
      data_ingresso: op.data_inicio,
      data_regresso: op.data_fim,
   });
   const [errors, setErrors] = useState<FormErrors>({});
   const [showSearch, setShowSearch] = useState(false);

   useEffect(() => {
      if (!show) return;
      if (editing) {
         setForm({
            user_id: editing.user.id,
            func: editing.func,
            om: editing.om,
            data_ingresso: editing.data_ingresso,
            data_regresso: editing.data_regresso,
         });
         setUserLabel(`${editing.user.p_g} ${editing.user.nome_guerra}`.trim());
      } else {
         setForm({
            user_id: 0,
            func: "",
            om: "",
            data_ingresso: op.data_inicio,
            data_regresso: op.data_fim,
         });
         setUserLabel("");
      }
      setErrors({});
   }, [show, editing, op.data_inicio, op.data_fim]);

   const isSubmitting = addMutation.isPending || updateMutation.isPending;

   function setField<K extends keyof PessoalFormData>(
      field: K,
      value: PessoalFormData[K]
   ) {
      setForm((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => {
         const next = { ...prev };
         delete next[field];
         return next;
      });
   }

   function onUserSelected(user: UserPublic) {
      setField("user_id", user.id);
      setUserLabel(`${user.p_g} ${user.nome_guerra}`.trim());
      if (!form.om) setField("om", user.unidade || "");
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
         <Modal show={show} size="xl" onClose={onClose} dismissible>
            <ModalHeader>
               {isEdit ? "Editar militar" : "Associar militar"}
            </ModalHeader>
            <ModalBody>
               <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Militar */}
                  <div>
                     <Label className="mb-1.5 block text-sm font-semibold">
                        Militar <span className="text-red-500">*</span>
                     </Label>
                     <button
                        type="button"
                        onClick={() => setShowSearch(true)}
                        disabled={isEdit}
                        className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-left text-sm hover:border-gray-400 disabled:cursor-not-allowed disabled:bg-gray-50"
                     >
                        {userLabel ? (
                           <span className="flex items-center gap-1.5 font-medium text-gray-800">
                              <MdPerson className="h-4 w-4 text-red-500" />
                              {userLabel}
                           </span>
                        ) : (
                           <span className="text-gray-400">
                              Selecionar militar…
                           </span>
                        )}
                        {!isEdit && (
                           <MdSearch className="h-5 w-5 text-gray-400" />
                        )}
                     </button>
                     {errors.user_id && (
                        <p className="mt-1 text-sm text-red-600">
                           {errors.user_id}
                        </p>
                     )}
                  </div>

                  {/* Função + OM */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                     <div>
                        <Label
                           htmlFor="func"
                           className="mb-1.5 block text-sm font-semibold"
                        >
                           Função <span className="text-red-500">*</span>
                        </Label>
                        <TextInput
                           id="func"
                           placeholder="Ex.: Piloto, Apoio logístico"
                           value={form.func}
                           onChange={(e) => setField("func", e.target.value)}
                           color={errors.func ? "failure" : "gray"}
                        />
                        {errors.func && (
                           <p className="mt-1 text-sm text-red-600">
                              {errors.func}
                           </p>
                        )}
                     </div>
                     <div>
                        <Label
                           htmlFor="om"
                           className="mb-1.5 block text-sm font-semibold"
                        >
                           OM <span className="text-red-500">*</span>
                        </Label>
                        <TextInput
                           id="om"
                           placeholder="Ex.: 1º/1º GT"
                           value={form.om}
                           onChange={(e) => setField("om", e.target.value)}
                           color={errors.om ? "failure" : "gray"}
                        />
                        {errors.om && (
                           <p className="mt-1 text-sm text-red-600">
                              {errors.om}
                           </p>
                        )}
                     </div>
                  </div>

                  {/* Datas */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                     <div>
                        <Label
                           htmlFor="data_ingresso"
                           className="mb-1.5 block text-sm font-semibold"
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
                           className="mb-1.5 block text-sm font-semibold"
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

                  <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                     <Button
                        color="gray"
                        onClick={onClose}
                        disabled={isSubmitting}
                     >
                        Cancelar
                     </Button>
                     <Button type="submit" color="red" disabled={isSubmitting}>
                        {isSubmitting ? (
                           <Spinner size="sm" color="failure" />
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
