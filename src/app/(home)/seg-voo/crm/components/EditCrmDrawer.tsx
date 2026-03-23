"use client";

import { memo, useState, useEffect } from "react";
import {
   Modal,
   ModalHeader,
   ModalBody,
   ModalFooter,
   Button,
   Label,
   TextInput,
} from "flowbite-react";
import { HiTrash } from "react-icons/hi";
import clsx from "clsx";
import { useToast } from "@/app/context/toast";
import { formatSaram } from "@/constants/formats";
import { useUpsertCrm, useDeleteCrm } from "@/hooks/queries";
import type { TripCrmOut, CrmUpsert } from "services/routes/seg-voo/crm";
import {
   getDateStatus,
   getStatusConfig,
} from "@/utils/dateStatus";

// ========================================
// Campos de data
// ========================================

// Campo simples — sem avaliação de status (usado para data de realização)
function SimpleDateField({
   label,
   name,
   value,
   onChange,
}: {
   label: string;
   name: string;
   value: string;
   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
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
            />
         </div>
      </div>
   );
}

const statusLabels = {
   valid: "Em dia",
   warning: "Atenção (< 90 dias)",
   critical: "Crítico (< 30 dias)",
   expired: "Vencido",
   empty: "Sem data",
} as const;

// Campo com indicador de status — usado para data de validade
function ValidadeDateField({
   label,
   name,
   value,
   onChange,
}: {
   label: string;
   name: string;
   value: string;
   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
            />
         </div>
         <div className="mt-1 flex items-center gap-1.5">
            <Icon className={clsx("h-4 w-4", config.color)} />
            <span className={clsx("text-xs font-medium", config.color)}>
               {statusLabels[status]}
            </span>
         </div>
      </div>
   );
}

// ========================================
// EditCrmDrawer
// ========================================

interface EditCrmDrawerProps {
   show: boolean;
   onClose: () => void;
   item: TripCrmOut;
}

const EditCrmDrawer = memo(function EditCrmDrawer({
   show,
   onClose,
   item,
}: EditCrmDrawerProps) {
   const { push } = useToast();
   const isEdit = !!item.crm;

   const upsertMutation = useUpsertCrm();
   const deleteMutation = useDeleteCrm();

   const isLoading = upsertMutation.isPending;
   const isDeleting = deleteMutation.isPending;

   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
   const [formData, setFormData] = useState({
      data_realizacao: item.crm?.data_realizacao || "",
      data_validade: item.crm?.data_validade || "",
   });

   useEffect(() => {
      if (show) {
         setFormData({
            data_realizacao: item.crm?.data_realizacao || "",
            data_validade: item.crm?.data_validade || "",
         });
         setShowDeleteConfirm(false);
      }
   }, [show, item]);

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      if (name === "data_realizacao" && value) {
         const dt = new Date(value + "T00:00:00");
         dt.setFullYear(dt.getFullYear() + 2);
         const validade = dt.toISOString().split("T")[0];
         setFormData((prev) => ({
            ...prev,
            data_realizacao: value,
            data_validade: validade,
         }));
      } else {
         setFormData((prev) => ({ ...prev, [name]: value }));
      }
   };

   const handleSave = async () => {
      if (
         formData.data_realizacao &&
         formData.data_validade &&
         formData.data_realizacao > formData.data_validade
      ) {
         push({
            title: "Data inválida",
            message: "A data de realização não pode ser maior que a de validade.",
            type: "error",
         });
         return;
      }

      try {
         const data: CrmUpsert = {
            data_realizacao: formData.data_realizacao || null,
            data_validade: formData.data_validade || null,
         };

         await upsertMutation.mutateAsync({ trip_id: item.trip_id, data });

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
         <Modal show={show} onClose={onClose} size="md" dismissible>
            <ModalHeader>
               {isEdit ? "Editar CRM" : "Cadastrar CRM"}
            </ModalHeader>
            <ModalBody>
               <div className="space-y-6">
                  {/* Informações do militar */}
                  <div className="rounded-lg border bg-gray-50 p-4">
                     <p className="text-sm font-semibold uppercase text-gray-900">
                        {item.p_g} {item.nome_guerra}
                     </p>
                     {item.nome_completo && (
                        <p className="mt-1 text-sm uppercase text-gray-500">
                           {item.nome_completo}
                        </p>
                     )}
                     <div className="mt-2 flex gap-3 text-sm text-gray-500">
                        {item.saram && (
                           <span>SARAM: {formatSaram(item.saram)}</span>
                        )}
                     </div>
                  </div>

                  <div className="border-t border-gray-200" />

                  {/* Campos de data */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                     <SimpleDateField
                        label="Data de Realização"
                        name="data_realizacao"
                        value={formData.data_realizacao}
                        onChange={handleChange}
                     />
                     <ValidadeDateField
                        label="Data de Validade"
                        name="data_validade"
                        value={formData.data_validade}
                        onChange={handleChange}
                     />
                  </div>
               </div>
            </ModalBody>
            <ModalFooter>
               <div className="flex w-full justify-between">
                  <div>
                     {isEdit && (
                        <Button
                           color="red"
                           onClick={() => setShowDeleteConfirm(true)}
                           disabled={isLoading}
                        >
                           <HiTrash className="mr-2" />
                           Deletar
                        </Button>
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
                     <Button
                        color="blue"
                        onClick={handleSave}
                        disabled={isLoading}
                     >
                        {isLoading
                           ? "Salvando..."
                           : isEdit
                             ? "Atualizar"
                             : "Cadastrar"}
                     </Button>
                  </div>
               </div>
            </ModalFooter>
         </Modal>

         <Modal
            show={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            size="md"
         >
            <ModalHeader>Confirmar Exclusão</ModalHeader>
            <ModalBody>
               <p className="text-gray-700">
                  Tem certeza que deseja remover o CRM de{" "}
                  <strong className="uppercase">
                     {item.p_g} {item.nome_guerra}
                  </strong>
                  ?
               </p>
               <p className="mt-2 text-sm text-gray-500">
                  Esta ação não pode ser desfeita.
               </p>
            </ModalBody>
            <ModalFooter>
               <Button
                  color="gray"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
               >
                  Cancelar
               </Button>
               <Button
                  color="red"
                  onClick={handleDelete}
                  disabled={isDeleting}
               >
                  {isDeleting ? "Removendo..." : "Remover"}
               </Button>
            </ModalFooter>
         </Modal>
      </>
   );
});

export default EditCrmDrawer;
