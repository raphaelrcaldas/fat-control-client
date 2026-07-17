"use client";

import { useEffect, useState } from "react";
import {
   Modal,
   ModalHeader,
   ModalBody,
   Button,
   Label,
   TextInput,
   Textarea,
   Select,
   Spinner,
} from "flowbite-react";
import { MdLocationOn, MdSearch } from "react-icons/md";
import { useToast } from "@/app/context/toast";
import { SearchLocal } from "@/components/location/SearchLocal";
import {
   useCreateOperacao,
   useUpdateOperacao,
} from "@/hooks/queries/useOperacoes";
import type { OperacaoDetail } from "services/routes/ops/operacoes";
import {
   STATUS,
   TIPOS,
   defaultOperacaoValues,
   operacaoFormSchema,
   type OperacaoFormData,
} from "../schemas/operacaoSchema";

type FormErrors = Partial<Record<keyof OperacaoFormData, string>>;

interface Props {
   show: boolean;
   onClose: () => void;
   editing: OperacaoDetail | null;
}

export function OperacaoFormModal({ show, onClose, editing }: Props) {
   const isEdit = !!editing;
   const { push } = useToast();
   const createMutation = useCreateOperacao();
   const updateMutation = useUpdateOperacao(editing?.id ?? 0);

   const [form, setForm] = useState<OperacaoFormData>(defaultOperacaoValues);
   const [cidadeLabel, setCidadeLabel] = useState<string>("");
   const [errors, setErrors] = useState<FormErrors>({});
   const [showCidade, setShowCidade] = useState(false);

   useEffect(() => {
      if (!show) return;
      if (editing) {
         setForm({
            nome: editing.nome,
            tipo: editing.tipo,
            cidade_id: editing.cidade?.codigo ?? 0,
            data_inicio: editing.data_inicio,
            data_fim: editing.data_fim,
            status: editing.status,
            documento_referencia: editing.documento_referencia,
            obs: editing.obs,
         });
         setCidadeLabel(
            editing.cidade
               ? `${editing.cidade.nome} — ${editing.cidade.uf}`
               : ""
         );
      } else {
         setForm(defaultOperacaoValues);
         setCidadeLabel("");
      }
      setErrors({});
   }, [show, editing]);

   const isSubmitting = createMutation.isPending || updateMutation.isPending;

   function setField<K extends keyof OperacaoFormData>(
      field: K,
      value: OperacaoFormData[K]
   ) {
      setForm((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => {
         const next = { ...prev };
         delete next[field];
         return next;
      });
   }

   async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      const result = operacaoFormSchema.safeParse(form);
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

      const payload = {
         ...result.data,
         documento_referencia: result.data.documento_referencia || null,
         obs: result.data.obs || null,
      };

      try {
         const res = isEdit
            ? await updateMutation.mutateAsync(payload)
            : await createMutation.mutateAsync(payload);
         push({
            title: res.ok ? "Sucesso!" : "Erro",
            message:
               res.message ||
               (isEdit ? "Operação atualizada" : "Operação criada"),
            type: res.ok ? "success" : "error",
         });
         if (res.ok) onClose();
      } catch (err: unknown) {
         push({
            title: "Erro",
            message:
               err instanceof Error ? err.message : "Erro ao salvar operação",
            type: "error",
         });
      }
   }

   return (
      <>
         <Modal show={show} size="2xl" onClose={onClose} dismissible>
            <ModalHeader>
               {isEdit
                  ? `Editar Operação Nº ${String(editing!.numero).padStart(3, "0")}`
                  : "Nova Operação"}
            </ModalHeader>
            <ModalBody>
               <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Nome */}
                  <div>
                     <Label
                        htmlFor="nome"
                        className="mb-1.5 block text-sm font-semibold"
                     >
                        Nome <span className="text-red-500">*</span>
                     </Label>
                     <TextInput
                        id="nome"
                        placeholder="Ex.: EXERCÍCIO TÁPIO 2026"
                        value={form.nome}
                        onChange={(e) => setField("nome", e.target.value)}
                        color={errors.nome ? "failure" : "gray"}
                     />
                     {errors.nome && (
                        <p className="mt-1 text-sm text-red-600">
                           {errors.nome}
                        </p>
                     )}
                  </div>

                  {/* Tipo + Status */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                     <div>
                        <Label
                           htmlFor="tipo"
                           className="mb-1.5 block text-sm font-semibold"
                        >
                           Tipo <span className="text-red-500">*</span>
                        </Label>
                        <Select
                           id="tipo"
                           value={form.tipo}
                           onChange={(e) =>
                              setField(
                                 "tipo",
                                 e.target.value as OperacaoFormData["tipo"]
                              )
                           }
                        >
                           {TIPOS.map((t) => (
                              <option key={t.value} value={t.value}>
                                 {t.label}
                              </option>
                           ))}
                        </Select>
                     </div>
                     <div>
                        <Label
                           htmlFor="status"
                           className="mb-1.5 block text-sm font-semibold"
                        >
                           Status <span className="text-red-500">*</span>
                        </Label>
                        <Select
                           id="status"
                           value={form.status}
                           onChange={(e) =>
                              setField(
                                 "status",
                                 e.target.value as OperacaoFormData["status"]
                              )
                           }
                        >
                           {STATUS.map((s) => (
                              <option key={s.value} value={s.value}>
                                 {s.label}
                              </option>
                           ))}
                        </Select>
                     </div>
                  </div>

                  {/* Cidade-sede */}
                  <div>
                     <Label className="mb-1.5 block text-sm font-semibold">
                        Cidade-sede <span className="text-red-500">*</span>
                     </Label>
                     <button
                        type="button"
                        onClick={() => setShowCidade(true)}
                        className="flex w-full items-center justify-between rounded border border-gray-300 bg-white px-3 py-2.5 text-left text-sm hover:border-gray-400"
                     >
                        {cidadeLabel ? (
                           <span className="flex items-center gap-1.5 font-medium text-gray-800">
                              <MdLocationOn className="text-primary-500 h-4 w-4" />
                              {cidadeLabel}
                           </span>
                        ) : (
                           <span className="text-gray-400">
                              Selecionar cidade…
                           </span>
                        )}
                        <MdSearch className="h-5 w-5 text-gray-400" />
                     </button>
                     {errors.cidade_id && (
                        <p className="mt-1 text-sm text-red-600">
                           {errors.cidade_id}
                        </p>
                     )}
                  </div>

                  {/* Datas */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                     <div>
                        <Label
                           htmlFor="data_inicio"
                           className="mb-1.5 block text-sm font-semibold"
                        >
                           Início <span className="text-red-500">*</span>
                        </Label>
                        <TextInput
                           id="data_inicio"
                           type="date"
                           value={form.data_inicio}
                           onChange={(e) =>
                              setField("data_inicio", e.target.value)
                           }
                           color={errors.data_inicio ? "failure" : "gray"}
                        />
                        {errors.data_inicio && (
                           <p className="mt-1 text-sm text-red-600">
                              {errors.data_inicio}
                           </p>
                        )}
                     </div>
                     <div>
                        <Label
                           htmlFor="data_fim"
                           className="mb-1.5 block text-sm font-semibold"
                        >
                           Término <span className="text-red-500">*</span>
                        </Label>
                        <TextInput
                           id="data_fim"
                           type="date"
                           value={form.data_fim}
                           onChange={(e) =>
                              setField("data_fim", e.target.value)
                           }
                           color={errors.data_fim ? "failure" : "gray"}
                        />
                        {errors.data_fim && (
                           <p className="mt-1 text-sm text-red-600">
                              {errors.data_fim}
                           </p>
                        )}
                     </div>
                  </div>

                  {/* Documento */}
                  <div>
                     <Label
                        htmlFor="documento_referencia"
                        className="mb-1.5 block text-sm font-semibold"
                     >
                        Documento de referência
                     </Label>
                     <TextInput
                        id="documento_referencia"
                        placeholder="Ex.: ICA 55-87"
                        value={form.documento_referencia ?? ""}
                        onChange={(e) =>
                           setField(
                              "documento_referencia",
                              e.target.value || null
                           )
                        }
                     />
                  </div>

                  {/* Observações */}
                  <div>
                     <Label
                        htmlFor="obs"
                        className="mb-1.5 block text-sm font-semibold"
                     >
                        Observações
                     </Label>
                     <Textarea
                        id="obs"
                        rows={2}
                        placeholder="Descrição/objetivo da operação…"
                        value={form.obs ?? ""}
                        onChange={(e) =>
                           setField("obs", e.target.value || null)
                        }
                     />
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
                           <div className="flex items-center gap-2">
                              <Spinner size="sm" color="primary" />
                              <span>Salvando…</span>
                           </div>
                        ) : isEdit ? (
                           "Salvar Alterações"
                        ) : (
                           "Criar Operação"
                        )}
                     </Button>
                  </div>
               </form>
            </ModalBody>
         </Modal>

         <SearchLocal
            show={showCidade}
            setShow={setShowCidade}
            setLocal={(local) => {
               setField("cidade_id", local.codigo);
               setCidadeLabel(`${local.nome} — ${local.uf}`);
            }}
         />
      </>
   );
}
