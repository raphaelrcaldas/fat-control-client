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
   Select,
} from "flowbite-react";
import { HiTrash } from "react-icons/hi";
import { MdTranslate } from "react-icons/md";
import { useToast } from "@/app/context/toast";
import { useUpsertIdiomas, useDeleteIdiomas } from "@/hooks/queries";
import type {
   TripIdiomasOut,
   IdiomasUpsert,
} from "services/routes/instrucao/idiomas";

interface EditIdiomasDrawerProps {
   show: boolean;
   onClose: () => void;
   item: TripIdiomasOut;
}

const NIVEL_OPTIONS = ["", "A1", "A2", "B1", "B2", "C1", "C2"] as const;

function SectionTitle({ children }: { children: React.ReactNode }) {
   return (
      <p className="mb-3 text-[11px] font-semibold tracking-widest text-gray-600 uppercase">
         {children}
      </p>
   );
}

function Field({
   id,
   label,
   children,
}: {
   id: string;
   label: string;
   children: React.ReactNode;
}) {
   return (
      <div className="flex flex-col gap-1">
         <Label htmlFor={id}>{label}</Label>
         {children}
      </div>
   );
}

const EditIdiomasDrawer = memo(function EditIdiomasDrawer({
   show,
   onClose,
   item,
}: EditIdiomasDrawerProps) {
   const { push } = useToast();
   const isEdit = !!item.idiomas;

   const upsertMutation = useUpsertIdiomas();
   const deleteMutation = useDeleteIdiomas();
   const isLoading = upsertMutation.isPending;
   const isDeleting = deleteMutation.isPending;

   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
   const [formData, setFormData] = useState({
      ptai_validade: item.idiomas?.ptai_validade ?? "",
      tai_s_validade: item.idiomas?.tai_s_validade ?? "",
      tai_s1_validade: item.idiomas?.tai_s1_validade ?? "",
      hab_espanhol: item.idiomas?.hab_espanhol ?? "",
      val_espanhol: item.idiomas?.val_espanhol ?? "",
      hab_ingles: item.idiomas?.hab_ingles ?? "",
      val_ingles: item.idiomas?.val_ingles ?? "",
   });

   useEffect(() => {
      if (show) {
         setFormData({
            ptai_validade: item.idiomas?.ptai_validade ?? "",
            tai_s_validade: item.idiomas?.tai_s_validade ?? "",
            tai_s1_validade: item.idiomas?.tai_s1_validade ?? "",
            hab_espanhol: item.idiomas?.hab_espanhol ?? "",
            val_espanhol: item.idiomas?.val_espanhol ?? "",
            hab_ingles: item.idiomas?.hab_ingles ?? "",
            val_ingles: item.idiomas?.val_ingles ?? "",
         });
         setShowDeleteConfirm(false);
      }
   }, [show, item]);

   const handleInput = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
   ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
   };

   const handleSave = async () => {
      try {
         const data: IdiomasUpsert = {
            ptai_validade: formData.ptai_validade || null,
            tai_s_validade: formData.tai_s_validade || null,
            tai_s1_validade: formData.tai_s1_validade || null,
            hab_espanhol: formData.hab_espanhol || null,
            val_espanhol: formData.val_espanhol || null,
            hab_ingles: formData.hab_ingles || null,
            val_ingles: formData.val_ingles || null,
         };
         await upsertMutation.mutateAsync({ trip_id: item.trip_id, data });
         push({
            message: isEdit
               ? "Idiomas atualizados com sucesso"
               : "Idiomas cadastrados com sucesso",
            type: "success",
         });
         onClose();
      } catch (err: unknown) {
         const message =
            err instanceof Error ? err.message : "Erro ao salvar idiomas";
         push({ title: "Erro", message, type: "error" });
      }
   };

   const handleDelete = async () => {
      try {
         await deleteMutation.mutateAsync(item.trip_id);
         push({ message: "Idiomas removidos com sucesso", type: "success" });
         onClose();
      } catch (err: unknown) {
         const message =
            err instanceof Error ? err.message : "Erro ao remover idiomas";
         push({ title: "Erro", message, type: "error" });
      } finally {
         setShowDeleteConfirm(false);
      }
   };

   return (
      <>
         <Modal show={show} onClose={onClose} size="lg" dismissible>
            <ModalHeader>
               {/* Header personalizado */}
               <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600">
                     <MdTranslate className="h-5 w-5 text-white" />
                  </div>
                  <div>
                     <p className="text-base font-semibold text-gray-900">
                        {item.p_g.toUpperCase()}{" "}
                        {item.nome_guerra.toUpperCase()}
                     </p>
                     <p className="text-sm font-normal text-gray-400">
                        {isEdit
                           ? "Editar habilidades de idioma"
                           : "Cadastrar habilidades de idioma"}
                     </p>
                  </div>
               </div>
            </ModalHeader>

            <ModalBody>
               <div className="space-y-6">
                  {/* Provas e validações */}
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 shadow-md">
                     <SectionTitle>Provas e validações</SectionTitle>
                     <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <Field id="ptai_validade" label="PTAI">
                           <TextInput
                              id="ptai_validade"
                              name="ptai_validade"
                              type="date"
                              value={formData.ptai_validade}
                              onChange={handleInput}
                              sizing="sm"
                           />
                        </Field>
                        <Field id="tai_s_validade" label="TAI S">
                           <TextInput
                              id="tai_s_validade"
                              name="tai_s_validade"
                              type="date"
                              value={formData.tai_s_validade}
                              onChange={handleInput}
                              sizing="sm"
                           />
                        </Field>
                        <Field id="tai_s1_validade" label="TAI S1">
                           <TextInput
                              id="tai_s1_validade"
                              name="tai_s1_validade"
                              type="date"
                              value={formData.tai_s1_validade}
                              onChange={handleInput}
                              sizing="sm"
                           />
                        </Field>
                     </div>
                  </div>

                  {/* Espanhol */}
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 shadow-md">
                     <SectionTitle>Espanhol</SectionTitle>
                     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field id="hab_espanhol" label="Nível">
                           <Select
                              id="hab_espanhol"
                              name="hab_espanhol"
                              value={formData.hab_espanhol}
                              onChange={handleInput}
                              sizing="sm"
                           >
                              {NIVEL_OPTIONS.map((opt) => (
                                 <option key={opt} value={opt}>
                                    {opt === "" ? "—" : opt}
                                 </option>
                              ))}
                           </Select>
                        </Field>
                        <Field id="val_espanhol" label="Validade">
                           <TextInput
                              id="val_espanhol"
                              name="val_espanhol"
                              type="date"
                              value={formData.val_espanhol}
                              onChange={handleInput}
                              sizing="sm"
                           />
                        </Field>
                     </div>
                  </div>

                  {/* Inglês */}
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 shadow-md">
                     <SectionTitle>Inglês</SectionTitle>
                     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field id="hab_ingles" label="Nível">
                           <Select
                              id="hab_ingles"
                              name="hab_ingles"
                              value={formData.hab_ingles}
                              onChange={handleInput}
                              sizing="sm"
                           >
                              {NIVEL_OPTIONS.map((opt) => (
                                 <option key={opt} value={opt}>
                                    {opt === "" ? "—" : opt}
                                 </option>
                              ))}
                           </Select>
                        </Field>
                        <Field id="val_ingles" label="Validade">
                           <TextInput
                              id="val_ingles"
                              name="val_ingles"
                              type="date"
                              value={formData.val_ingles}
                              onChange={handleInput}
                              sizing="sm"
                           />
                        </Field>
                     </div>
                  </div>
               </div>
            </ModalBody>

            <ModalFooter>
               <div className="flex w-full items-center justify-between">
                  {isEdit ? (
                     <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 disabled:opacity-40"
                     >
                        <HiTrash className="h-4 w-4" />
                        Remover cadastro
                     </button>
                  ) : (
                     <span />
                  )}
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

         {/* Confirmação de exclusão */}
         <Modal
            show={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            size="sm"
         >
            <ModalHeader>Confirmar exclusão</ModalHeader>
            <ModalBody>
               <p className="text-sm text-gray-600">
                  Remover todas as habilidades de idioma de{" "}
                  <strong className="font-semibold text-gray-900">
                     {item.nome_guerra.toUpperCase()}
                  </strong>
                  ? Esta ação não pode ser desfeita.
               </p>
            </ModalBody>
            <ModalFooter>
               <div className="flex w-full justify-end gap-2">
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
               </div>
            </ModalFooter>
         </Modal>
      </>
   );
});

export default EditIdiomasDrawer;
