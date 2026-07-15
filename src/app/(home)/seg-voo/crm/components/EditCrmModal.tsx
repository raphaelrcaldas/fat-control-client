"use client";

import { memo, useState } from "react";
import {
   Modal,
   ModalHeader,
   ModalBody,
   ModalFooter,
   Button,
   Spinner,
} from "flowbite-react";
import { HiPhone, HiTrash } from "react-icons/hi";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useToast } from "@/app/context/toast";
import { formatPhone, formatSaram } from "@/constants/formats";
import { useUpsertCrm, useDeleteCrm } from "@/hooks/queries";
import type { TripCrmOut } from "services/routes/seg-voo/crm";
import { SimpleDateField, ValidadeDateField } from "./crmDateFields";
import { useCrmForm } from "../hooks/useCrmForm";
import { PermBased } from "../../../hooks/usePermBased";

interface EditCrmModalProps {
   show: boolean;
   onClose: () => void;
   item: TripCrmOut;
}

const EditCrmModal = memo(function EditCrmModal({
   show,
   onClose,
   item,
}: EditCrmModalProps) {
   const { push } = useToast();
   const isEdit = !!item.crm;

   const upsertMutation = useUpsertCrm();
   const deleteMutation = useDeleteCrm();

   const isLoading = upsertMutation.isPending || deleteMutation.isPending;
   const isDeleting = deleteMutation.isPending;

   // Bloqueia fechar (backdrop/Esc/X) enquanto uma mutação está em voo,
   // coerente com os botões desabilitados.
   const handleClose = () => {
      if (!isLoading) onClose();
   };

   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
   const { formData, handleChange, validate, buildPayload } = useCrmForm(
      item,
      show
   );

   const handleSave = async () => {
      const error = validate();
      if (error) {
         push({ title: "Data inválida", message: error, type: "error" });
         return;
      }

      try {
         await upsertMutation.mutateAsync({
            trip_id: item.trip_id,
            data: buildPayload(),
         });
         push({
            message: isEdit
               ? "CRM atualizado com sucesso"
               : "CRM cadastrado com sucesso",
            type: "success",
         });
         onClose();
      } catch (err: unknown) {
         const message =
            err instanceof Error ? err.message : "Erro ao salvar CRM";
         push({ title: "Erro", message, type: "error" });
      }
   };

   const handleDelete = async () => {
      try {
         await deleteMutation.mutateAsync(item.trip_id);
         push({ message: "CRM removido com sucesso", type: "success" });
         onClose();
      } catch (err: unknown) {
         const message =
            err instanceof Error ? err.message : "Erro ao remover CRM";
         push({ title: "Erro", message, type: "error" });
      } finally {
         setShowDeleteConfirm(false);
      }
   };

   return (
      <>
         <Modal show={show} onClose={handleClose} size="md" dismissible>
            <ModalHeader>{isEdit ? "Editar CRM" : "Cadastrar CRM"}</ModalHeader>
            <ModalBody>
               <div className="space-y-6">
                  {/* Informações do militar */}
                  <div className="rounded border border-slate-200 bg-gray-50 p-4">
                     <p className="text-sm font-semibold text-gray-900 uppercase">
                        {item.p_g} {item.nome_guerra}
                     </p>
                     {item.nome_completo && (
                        <p className="mt-1 text-sm text-gray-500 uppercase">
                           {item.nome_completo}
                        </p>
                     )}
                     <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
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

                  {/* Campos de data */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                     <SimpleDateField
                        label="Data de Realização"
                        name="data_realizacao"
                        value={formData.data_realizacao}
                        onChange={handleChange}
                        max={formData.data_validade}
                     />
                     <ValidadeDateField
                        label="Data de Validade"
                        name="data_validade"
                        value={formData.data_validade}
                        onChange={handleChange}
                        min={formData.data_realizacao}
                     />
                  </div>
               </div>
            </ModalBody>
            <ModalFooter>
               <div className="flex w-full justify-between">
                  <div>
                     {isEdit && (
                        <PermBased resource="crm" requiredPerm="delete">
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
                        Cancelar
                     </Button>
                     <PermBased
                        resource="crm"
                        requiredPerm={isEdit ? "update" : "create"}
                     >
                        <Button
                           color="red"
                           onClick={handleSave}
                           disabled={isLoading}
                        >
                           {isLoading ? (
                              <div className="flex items-center gap-2">
                                 <Spinner size="sm" color="primary" />
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
            description={`Remover o CRM de ${item.p_g} ${item.nome_guerra}? Esta ação não pode ser desfeita.`}
            isLoading={isDeleting}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={handleDelete}
            confirmButtonText="Remover"
            icon={HiTrash}
         />
      </>
   );
});

export default EditCrmModal;
