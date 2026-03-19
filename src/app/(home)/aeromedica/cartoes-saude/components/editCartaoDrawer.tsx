"use client";

import { useState, useEffect } from "react";
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
import {
   useCreateCartaoSaude,
   useUpdateCartaoSaude,
   useDeleteCartaoSaude,
} from "@/hooks/queries";
import {
   UserCartaoSaude,
   CartaoSaudeCreate,
   CartaoSaudeUpdate,
} from "services/routes/aeromedica/cartoesSaude";
import { getDateStatus, getStatusConfig } from "../utils/dateStatus";

// ========================================
// DateField (com status helper)
// ========================================

interface DateFieldProps {
   label: string;
   name: string;
   value: string;
   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function DateField({ label, name, value, onChange }: DateFieldProps) {
   const status = getDateStatus(value || null);
   const config = getStatusConfig(status);
   const Icon = config.icon;

   const statusLabels = {
      valid: "Em dia",
      warning: "Atenção (< 90 dias)",
      critical: "Crítico (< 30 dias)",
      expired: "Vencido",
      empty: "Sem data",
   } as const;

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
// Main component
// ========================================

interface EditCartaoDrawerProps {
   show: boolean;
   onClose: () => void;
   item: UserCartaoSaude;
}

export default function EditCartaoDrawer({
   show,
   onClose,
   item,
}: EditCartaoDrawerProps) {
   const { push } = useToast();
   const isEdit = !!item.cartao;

   const createMutation = useCreateCartaoSaude();
   const updateMutation = useUpdateCartaoSaude();
   const deleteMutation = useDeleteCartaoSaude();

   const isLoading = createMutation.isPending || updateMutation.isPending;
   const isDeleting = deleteMutation.isPending;

   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

   const [formData, setFormData] = useState({
      prontuario: item.cartao?.prontuario || "",
      cemal: item.cartao?.cemal || "",
      ag_cemal: item.cartao?.ag_cemal || "",
      tovn: item.cartao?.tovn || "",
      imae: item.cartao?.imae || "",
   });

   useEffect(() => {
      if (show) {
         setFormData({
            prontuario: item.cartao?.prontuario || "",
            cemal: item.cartao?.cemal || "",
            ag_cemal: item.cartao?.ag_cemal || "",
            tovn: item.cartao?.tovn || "",
            imae: item.cartao?.imae || "",
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
         if (isEdit && item.cartao) {
            const updateData: CartaoSaudeUpdate = {
               prontuario: formData.prontuario || null,
               cemal: formData.cemal || null,
               ag_cemal: formData.ag_cemal || null,
               tovn: formData.tovn || null,
               imae: formData.imae || null,
            };

            await updateMutation.mutateAsync({
               id: item.cartao.id,
               data: updateData,
            });
         } else {
            const createData: CartaoSaudeCreate = {
               user_id: item.user.id,
               prontuario: formData.prontuario || null,
               cemal: formData.cemal || null,
               ag_cemal: formData.ag_cemal || null,
               tovn: formData.tovn || null,
               imae: formData.imae || null,
            };

            await createMutation.mutateAsync(createData);
         }

         push({
            message: isEdit
               ? "Cartão de saúde atualizado com sucesso"
               : "Cartão de saúde cadastrado com sucesso",
            type: "success",
         });
         onClose();
      } catch (err: unknown) {
         const message =
            err instanceof Error
               ? err.message
               : "Erro ao salvar cartão de saúde";
         push({
            title: "Erro",
            message,
            type: "error",
         });
      }
   };

   const handleDelete = async () => {
      if (!item.cartao?.id) return;

      try {
         await deleteMutation.mutateAsync(item.cartao.id);
         push({
            message: "Cartão de saúde deletado com sucesso",
            type: "success",
         });
         onClose();
      } catch (err: unknown) {
         const message =
            err instanceof Error
               ? err.message
               : "Erro ao deletar cartão de saúde";
         push({
            title: "Erro",
            message,
            type: "error",
         });
      } finally {
         setShowDeleteConfirm(false);
      }
   };

   return (
      <>
         <Modal show={show} onClose={onClose} size="lg" dismissible>
            <ModalHeader>
               {isEdit ? "Editar Cartão de Saúde" : "Cadastrar Cartão de Saúde"}
            </ModalHeader>
            <ModalBody>
               <div className="space-y-6">
                  {/* Informações do militar */}
                  <div className="rounded-lg border bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700">
                     <p className="text-sm font-semibold text-gray-900 uppercase dark:text-white">
                        {item.user.posto.mid} {item.user.nome_guerra}
                     </p>
                     <p className="mt-2 text-sm text-gray-500 uppercase dark:text-gray-400">
                        {item.user.nome_completo}
                     </p>
                     <div className="flex gap-3 text-sm text-gray-500 dark:text-gray-400">
                        {item.user.saram && (
                           <span>SARAM: {item.user.saram}</span>
                        )}
                     </div>
                  </div>

                  {/* Prontuário */}
                  <div>
                     <Label htmlFor="prontuario">Nº do Prontuário</Label>
                     <div className="mt-1">
                        <TextInput
                           id="prontuario"
                           name="prontuario"
                           type="text"
                           placeholder="Ex: 12345"
                           value={formData.prontuario}
                           onChange={handleChange}
                           maxLength={20}
                        />
                     </div>
                  </div>

                  {/* Divisor */}
                  <div className="border-t border-gray-200 dark:border-gray-700" />

                  {/* Campos de data */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                     <DateField
                        label="Inspeção de Saúde (CEMAL)"
                        name="cemal"
                        value={formData.cemal}
                        onChange={handleChange}
                     />
                     <div>
                        <Label htmlFor="ag_cemal">Agendamento CEMAL</Label>
                        <div className="mt-1">
                           <TextInput
                              id="ag_cemal"
                              name="ag_cemal"
                              type="date"
                              value={formData.ag_cemal}
                              onChange={handleChange}
                           />
                        </div>
                     </div>
                     <DateField
                        label="Visão Noturna (TOVN)"
                        name="tovn"
                        value={formData.tovn}
                        onChange={handleChange}
                     />
                     <DateField
                        label="IMAE"
                        name="imae"
                        value={formData.imae}
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

         {/* Modal de confirmação de deleção */}
         <Modal
            show={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            size="md"
         >
            <ModalHeader>Confirmar Exclusão</ModalHeader>
            <ModalBody>
               <p className="text-gray-700 dark:text-gray-300">
                  Tem certeza que deseja deletar o cartão de saúde de{" "}
                  <strong className="uppercase">
                     {item.user.posto.short} {item.user.nome_guerra}
                  </strong>
                  ?
               </p>
               <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
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
               <Button color="red" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? "Deletando..." : "Deletar"}
               </Button>
            </ModalFooter>
         </Modal>
      </>
   );
}
