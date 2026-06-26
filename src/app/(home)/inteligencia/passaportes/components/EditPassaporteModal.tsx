"use client";

import { memo, useState } from "react";
import {
   Modal,
   ModalHeader,
   ModalBody,
   ModalFooter,
   Button,
   Label,
   TextInput,
   Spinner,
} from "flowbite-react";
import { HiPhone, HiTrash } from "react-icons/hi";
import clsx from "clsx";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { PermBased, usePermBased } from "@/app/(home)/hooks/usePermBased";
import { useToast } from "@/app/context/toast";
import { formatPhone, formatSaram } from "@/constants/formats";
import { useUpsertPassaporte, useDeletePassaporte } from "@/hooks/queries";
import type { TripPassaporteOut } from "services/routes/inteligencia/passaportes";
import {
   getDateStatus,
   getStatusConfig,
   STATUS_LABELS,
} from "../utils/dateStatus";
import { usePassaporteForm } from "../hooks/usePassaporteForm";

// ========================================
// ValidadeDateField
// ========================================

function ValidadeDateField({
   label,
   name,
   value,
   onChange,
   min,
   disabled,
}: {
   label: string;
   name: string;
   value: string;
   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
   min?: string;
   disabled?: boolean;
}) {
   const status = getDateStatus(value || null);
   const config = getStatusConfig(status);
   const Icon = config.icon;

   return (
      <div>
         <Label htmlFor={name}>{label}</Label>
         <div className="mt-1">
            <TextInput
               id={name}
               name={name}
               type="date"
               value={value}
               onChange={onChange}
               min={min || undefined}
               disabled={disabled}
            />
         </div>
         <div className="mt-1 flex items-center gap-1.5">
            <Icon className={clsx("h-4 w-4", config.color)} />
            <span className={clsx("text-xs font-medium", config.color)}>
               {STATUS_LABELS[status]}
            </span>
         </div>
      </div>
   );
}

// ========================================
// EditPassaporteModal
// ========================================

interface EditPassaporteModalProps {
   show: boolean;
   onClose: () => void;
   item: TripPassaporteOut;
}

const EditPassaporteModal = memo(function EditPassaporteModal({
   show,
   onClose,
   item,
}: EditPassaporteModalProps) {
   const { push } = useToast();
   const { hasPerm } = usePermBased();
   const isEdit = !!item.passaporte;

   // Só-view abre o modal em modo leitura: sem a permissão de gravar
   // (update ao editar, create ao cadastrar) os campos ficam desabilitados.
   const canSave = hasPerm("passaportes", isEdit ? "update" : "create");
   const readOnly = !canSave;

   const upsertMutation = useUpsertPassaporte();
   const deleteMutation = useDeletePassaporte();

   const isLoading = upsertMutation.isPending || deleteMutation.isPending;
   const isDeleting = deleteMutation.isPending;

   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
   const { formData, handleChange, validate, buildPayload } = usePassaporteForm(
      item,
      show
   );

   const handleSave = async () => {
      const error = validate();
      if (error) {
         push({ title: "Erro", message: error, type: "error" });
         return;
      }

      try {
         await upsertMutation.mutateAsync({
            trip_id: item.trip_id,
            data: buildPayload(),
         });
         push({
            message: isEdit
               ? "Passaporte atualizado com sucesso"
               : "Passaporte cadastrado com sucesso",
            type: "success",
         });
         onClose();
      } catch (err: unknown) {
         const message =
            err instanceof Error ? err.message : "Erro ao salvar passaporte";
         push({ title: "Erro", message, type: "error" });
      }
   };

   const handleDelete = async () => {
      try {
         await deleteMutation.mutateAsync(item.trip_id);
         push({ message: "Passaporte removido com sucesso", type: "success" });
         onClose();
      } catch (err: unknown) {
         const message =
            err instanceof Error ? err.message : "Erro ao remover passaporte";
         push({ title: "Erro", message, type: "error" });
      } finally {
         setShowDeleteConfirm(false);
      }
   };

   return (
      <>
         <Modal show={show} onClose={onClose} size="xl" dismissible>
            <ModalHeader>
               {isEdit ? "Editar Passaporte" : "Cadastrar Passaporte"}
            </ModalHeader>
            <ModalBody>
               <div className="space-y-6">
                  {/* Informações do militar */}
                  <div className="space-y-1 rounded border border-slate-200 bg-gray-50 p-4">
                     <p className="text-sm font-semibold text-gray-900 uppercase">
                        {item.p_g} {item.nome_guerra}
                     </p>
                     {item.nome_completo && (
                        <p className="text-sm text-gray-500 uppercase">
                           {item.nome_completo}
                        </p>
                     )}
                     <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                        {item.saram && (
                           <span>SARAM: {formatSaram(item.saram)}</span>
                        )}
                        {item.telefone && (
                           <span className="inline-flex items-center gap-1">
                              <HiPhone className="h-3.5 w-3.5" />
                              {formatPhone(item.telefone)}
                           </span>
                        )}
                     </div>
                  </div>

                  {/* Grupo Passaporte */}
                  <fieldset className="rounded border border-slate-200 p-4 shadow">
                     <legend className="px-2 text-sm font-semibold text-gray-700 uppercase">
                        Passaporte
                     </legend>
                     <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <div>
                           <Label htmlFor="passaporte">Nº Passaporte</Label>
                           <div className="mt-1">
                              <TextInput
                                 id="passaporte"
                                 name="passaporte"
                                 type="text"
                                 placeholder="----"
                                 value={formData.passaporte}
                                 onChange={handleChange}
                                 disabled={readOnly}
                              />
                           </div>
                        </div>
                        <div>
                           <Label htmlFor="data_expedicao_passaporte">
                              Expedição
                           </Label>
                           <div className="mt-1">
                              <TextInput
                                 id="data_expedicao_passaporte"
                                 name="data_expedicao_passaporte"
                                 type="date"
                                 value={formData.data_expedicao_passaporte}
                                 onChange={handleChange}
                                 max={formData.validade_passaporte || undefined}
                                 disabled={readOnly}
                              />
                           </div>
                        </div>
                        <ValidadeDateField
                           label="Validade"
                           name="validade_passaporte"
                           value={formData.validade_passaporte}
                           onChange={handleChange}
                           min={formData.data_expedicao_passaporte}
                           disabled={readOnly}
                        />
                     </div>
                  </fieldset>

                  {/* Grupo Visa */}
                  <fieldset className="rounded border border-slate-200 p-4 shadow">
                     <legend className="px-2 text-sm font-semibold text-gray-700 uppercase">
                        Visa
                     </legend>
                     <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <div>
                           <Label htmlFor="visa">Nº Visto</Label>
                           <div className="mt-1">
                              <TextInput
                                 id="visa"
                                 name="visa"
                                 type="text"
                                 placeholder="----"
                                 value={formData.visa}
                                 onChange={handleChange}
                                 disabled={readOnly}
                              />
                           </div>
                        </div>
                        <div>
                           <Label htmlFor="data_expedicao_visa">
                              Expedição
                           </Label>
                           <div className="mt-1">
                              <TextInput
                                 id="data_expedicao_visa"
                                 name="data_expedicao_visa"
                                 type="date"
                                 value={formData.data_expedicao_visa}
                                 onChange={handleChange}
                                 max={formData.validade_visa || undefined}
                                 disabled={readOnly}
                              />
                           </div>
                        </div>
                        <ValidadeDateField
                           label="Validade"
                           name="validade_visa"
                           value={formData.validade_visa}
                           onChange={handleChange}
                           min={formData.data_expedicao_visa}
                           disabled={readOnly}
                        />
                     </div>
                  </fieldset>
               </div>
            </ModalBody>
            <ModalFooter>
               <div className="flex w-full justify-between">
                  <div>
                     {isEdit && (
                        <PermBased resource="passaportes" requiredPerm="delete">
                           <Button
                              color="red"
                              onClick={() => setShowDeleteConfirm(true)}
                              disabled={isLoading}
                           >
                              <HiTrash className="mr-2" />
                              Deletar
                           </Button>
                        </PermBased>
                     )}
                  </div>
                  <div className="flex gap-2">
                     <Button
                        color="gray"
                        onClick={onClose}
                        disabled={isLoading}
                     >
                        {readOnly ? "Fechar" : "Cancelar"}
                     </Button>
                     <PermBased
                        resource="passaportes"
                        requiredPerm={isEdit ? "update" : "create"}
                     >
                        <Button
                           color="blue"
                           onClick={handleSave}
                           disabled={isLoading}
                        >
                           {isLoading ? (
                              <div className="flex items-center gap-2">
                                 <Spinner size="sm" color="info" />
                                 <span>Salvando...</span>
                              </div>
                           ) : isEdit ? (
                              "Atualizar"
                           ) : (
                              "Cadastrar"
                           )}
                        </Button>
                     </PermBased>
                  </div>
               </div>
            </ModalFooter>
         </Modal>

         <ConfirmModal
            show={showDeleteConfirm}
            title="Confirmar Exclusão"
            description={`Remover o passaporte de ${item.p_g} ${item.nome_guerra}? Esta ação não pode ser desfeita.`}
            isLoading={isDeleting}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={handleDelete}
            confirmButtonText="Remover"
            icon={HiTrash}
         />
      </>
   );
});

export default EditPassaporteModal;
