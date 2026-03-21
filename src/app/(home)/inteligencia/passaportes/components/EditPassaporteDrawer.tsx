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
import { formatSaram } from "utils/validators";
import { useUpsertPassaporte, useDeletePassaporte } from "@/hooks/queries";
import type {
   TripPassaporteOut,
   PassaporteUpsert,
} from "services/routes/inteligencia/passaportes";
import { getDateStatus, getStatusConfig } from "../utils/dateStatus";

// ========================================
// Status labels
// ========================================

const statusLabels = {
   valid: "Em dia",
   warning: "Atencao (< 90 dias)",
   critical: "Critico (< 30 dias)",
   expired: "Vencido",
   empty: "Sem data",
} as const;

// ========================================
// ValidadeDateField
// ========================================

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
// EditPassaporteDrawer
// ========================================

interface EditPassaporteDrawerProps {
   show: boolean;
   onClose: () => void;
   item: TripPassaporteOut;
}

const EditPassaporteDrawer = memo(function EditPassaporteDrawer({
   show,
   onClose,
   item,
}: EditPassaporteDrawerProps) {
   const { push } = useToast();
   const isEdit = !!item.passaporte;

   const upsertMutation = useUpsertPassaporte();
   const deleteMutation = useDeletePassaporte();

   const isLoading = upsertMutation.isPending;
   const isDeleting = deleteMutation.isPending;

   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
   const [formData, setFormData] = useState({
      passaporte: item.passaporte?.passaporte || "",
      validade_passaporte: item.passaporte?.validade_passaporte || "",
      validade_visa: item.passaporte?.validade_visa || "",
   });

   useEffect(() => {
      if (show) {
         setFormData({
            passaporte: item.passaporte?.passaporte || "",
            validade_passaporte: item.passaporte?.validade_passaporte || "",
            validade_visa: item.passaporte?.validade_visa || "",
         });
         setShowDeleteConfirm(false);
      }
   }, [show, item]);

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
   };

   const handleSave = async () => {
      try {
         const data: PassaporteUpsert = {
            passaporte: formData.passaporte || null,
            validade_passaporte: formData.validade_passaporte || null,
            validade_visa: formData.validade_visa || null,
         };

         await upsertMutation.mutateAsync({ trip_id: item.trip_id, data });

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
         <Modal show={show} onClose={onClose} size="md" dismissible>
            <ModalHeader>
               {isEdit ? "Editar Passaporte" : "Cadastrar Passaporte"}
            </ModalHeader>
            <ModalBody>
               <div className="space-y-6">
                  {/* Informacoes do militar */}
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

                  {/* Numero do passaporte */}
                  <div>
                     <Label htmlFor="passaporte">Passaporte</Label>
                     <div className="mt-1">
                        <TextInput
                           id="passaporte"
                           name="passaporte"
                           type="text"
                           placeholder="Ex: SC014119"
                           value={formData.passaporte}
                           onChange={handleChange}
                        />
                     </div>
                  </div>

                  {/* Datas de validade */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                     <ValidadeDateField
                        label="Validade Passaporte"
                        name="validade_passaporte"
                        value={formData.validade_passaporte}
                        onChange={handleChange}
                     />
                     <ValidadeDateField
                        label="Validade VISA"
                        name="validade_visa"
                        value={formData.validade_visa}
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
            <ModalHeader>Confirmar Exclusao</ModalHeader>
            <ModalBody>
               <p className="text-gray-700">
                  Tem certeza que deseja remover o passaporte de{" "}
                  <strong className="uppercase">
                     {item.p_g} {item.nome_guerra}
                  </strong>
                  ?
               </p>
               <p className="mt-2 text-sm text-gray-500">
                  Esta acao nao pode ser desfeita.
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

export default EditPassaporteDrawer;
