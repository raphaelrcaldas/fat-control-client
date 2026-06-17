"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
   Button,
   Label,
   Modal,
   ModalBody,
   ModalHeader,
   TextInput,
   Select,
} from "flowbite-react";
import { HiCurrencyDollar } from "react-icons/hi";
import { postoGradRecords } from "services/routes/postos";
import { SoldoPublic } from "services/routes/cegep/soldos";
import {
   soldoFormSchema,
   SoldoFormData,
   makeDefaultSoldoValues,
} from "../schemas/soldoSchema";

interface SoldoFormModalProps {
   show: boolean;
   editingSoldo: SoldoPublic | null;
   submitting: boolean;
   onClose: () => void;
   onSubmit: (data: SoldoFormData) => Promise<boolean>;
}

export default function SoldoFormModal({
   show,
   editingSoldo,
   submitting,
   onClose,
   onSubmit,
}: SoldoFormModalProps) {
   const {
      register,
      handleSubmit,
      reset,
      formState: { errors, isDirty },
   } = useForm<SoldoFormData>({
      resolver: zodResolver(soldoFormSchema),
      defaultValues: makeDefaultSoldoValues(),
   });

   useEffect(() => {
      if (editingSoldo) {
         reset({
            pg: editingSoldo.pg,
            data_inicio: editingSoldo.data_inicio,
            data_fim: editingSoldo.data_fim,
            valor: editingSoldo.valor,
         });
      } else {
         reset(makeDefaultSoldoValues());
      }
   }, [editingSoldo, reset]);

   const handleFormSubmit = async (data: SoldoFormData) => {
      const ok = await onSubmit(data);
      if (ok) reset(makeDefaultSoldoValues());
   };

   const handleClose = () => {
      reset(makeDefaultSoldoValues());
      onClose();
   };

   return (
      <Modal show={show} onClose={handleClose} size="lg" dismissible>
         <ModalHeader>
            <div className="flex items-center gap-2">
               <HiCurrencyDollar className="h-6 w-6 text-red-600" />
               {editingSoldo ? "Editar Soldo" : "Novo Soldo"}
            </div>
         </ModalHeader>
         <ModalBody>
            <form
               onSubmit={handleSubmit(handleFormSubmit)}
               className="space-y-4"
            >
               {/* Posto/Graduação */}
               <div>
                  <Label htmlFor="pg">Posto/Graduação *</Label>
                  <Select
                     id="pg"
                     {...register("pg")}
                     color={errors.pg ? "failure" : undefined}
                  >
                     <option value="">Selecione...</option>
                     {postoGradRecords.map((posto) => (
                        <option key={posto.short} value={posto.short}>
                           {posto.short.toUpperCase()} - {posto.mid}
                        </option>
                     ))}
                  </Select>
                  {errors.pg && (
                     <p className="mt-1 text-sm text-red-600">
                        {errors.pg.message}
                     </p>
                  )}
               </div>

               {/* Valor */}
               <div>
                  <Label htmlFor="valor">Valor (R$) *</Label>
                  <TextInput
                     id="valor"
                     type="number"
                     step="0.01"
                     placeholder="0,00"
                     {...register("valor", { valueAsNumber: true })}
                     color={errors.valor ? "failure" : undefined}
                  />
                  {errors.valor && (
                     <p className="mt-1 text-sm text-red-600">
                        {errors.valor.message}
                     </p>
                  )}
               </div>

               {/* Datas */}
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <Label htmlFor="data_inicio">Data de Início *</Label>
                     <TextInput
                        id="data_inicio"
                        type="date"
                        {...register("data_inicio")}
                        color={errors.data_inicio ? "failure" : undefined}
                     />
                     {errors.data_inicio && (
                        <p className="mt-1 text-sm text-red-600">
                           {errors.data_inicio.message}
                        </p>
                     )}
                  </div>
                  <div>
                     <Label htmlFor="data_fim">Data de Fim (opcional)</Label>
                     <TextInput
                        id="data_fim"
                        type="date"
                        {...register("data_fim")}
                     />
                  </div>
               </div>

               {/* Botões */}
               <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                  <Button
                     color="gray"
                     onClick={handleClose}
                     disabled={submitting}
                  >
                     Cancelar
                  </Button>
                  <Button
                     color="red"
                     type="submit"
                     disabled={
                        submitting || (Boolean(editingSoldo) && !isDirty)
                     }
                  >
                     {submitting
                        ? "Salvando..."
                        : editingSoldo
                          ? "Salvar Alterações"
                          : "Cadastrar"}
                  </Button>
               </div>
            </form>
         </ModalBody>
      </Modal>
   );
}
