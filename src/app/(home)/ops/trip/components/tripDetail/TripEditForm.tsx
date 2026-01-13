import { useState, useCallback } from "react";
import { Label, TextInput, Checkbox, Button, Badge } from "flowbite-react";
import { Spinner } from "@/components/Spinner";
import { FaSave } from "react-icons/fa";
import { HiCheckCircle, HiXCircle } from "react-icons/hi";
import { useTripForm } from "../../hooks/useTripForm";
import {
   isValidTrigramaKey,
   trigramaValidationRules,
} from "../../utils/validateTrigrama";
import { FuncList } from "./FuncList";
import { FuncAddModal } from "./FuncAddModal";
import { FuncEditModal } from "./FuncEditModal";
import { FuncDeleteModal } from "./FuncDeleteModal";
import type { Trip, CrewFunc } from "../../types/trip.types";

type TripEditFormProps = {
   trip: Trip;
   onSuccess: () => void;
   onClose: () => void;
   onCancel: () => void;
};

export function TripEditForm({
   trip,
   onSuccess,
   onClose,
   onCancel,
}: TripEditFormProps) {
   const { register, handleSubmit, errors, isDirty, submitting } = useTripForm({
      trip,
      onSuccess,
      onClose,
   });

   const [showAddFunc, setShowAddFunc] = useState(false);
   const [showEditFunc, setShowEditFunc] = useState(false);
   const [showDeleteFunc, setShowDeleteFunc] = useState(false);
   const [editingFunc, setEditingFunc] = useState<CrewFunc | null>(null);
   const [deletingFunc, setDeletingFunc] = useState<CrewFunc | null>(null);

   const handleShowAddFunc = useCallback(() => {
      setShowAddFunc(true);
      setEditingFunc(null);
   }, []);

   const handleCloseAddFunc = useCallback(() => {
      setShowAddFunc(false);
      setEditingFunc(null);
   }, []);

   const handleShowEditFunc = useCallback((func: CrewFunc) => {
      setEditingFunc(func);
      setShowEditFunc(true);
   }, []);

   const handleCloseEditFunc = useCallback(() => {
      setShowEditFunc(false);
      setEditingFunc(null);
   }, []);

   const handleShowDeleteFunc = useCallback((func: CrewFunc) => {
      setDeletingFunc(func);
      setShowDeleteFunc(true);
   }, []);

   const handleCloseDeleteFunc = useCallback(() => {
      setShowDeleteFunc(false);
      setDeletingFunc(null);
   }, []);

   return (
      <form onSubmit={handleSubmit} className="space-y-5">
         {/* Informações do Usuário */}
         <div className="rounded-lg border border-blue-200 bg-linear-to-r from-blue-50 to-indigo-50 p-4">
            <div className="flex items-center justify-between">
               <div>
                  <h3 className="text-lg font-bold text-gray-800 uppercase">
                     {`${trip.user.posto.short} ${trip.user.esp} ${trip.user.nome_guerra}`}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 capitalize">
                     {trip.user.nome_completo}
                  </p>
               </div>
               <Badge color={trip.active ? "success" : "failure"} size="sm">
                  {trip.active ? (
                     <div className="flex items-center gap-1">
                        <HiCheckCircle className="size-4" />
                        <span>Ativo</span>
                     </div>
                  ) : (
                     <div className="flex items-center gap-1">
                        <HiXCircle className="size-4" />
                        <span>Inativo</span>
                     </div>
                  )}
               </Badge>
            </div>
         </div>

         {/* Formulário de Edição */}
         <div className="grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex flex-col gap-2">
               <Label htmlFor="trig" className="text-sm font-semibold">
                  Trigrama <span className="text-red-500">*</span>
               </Label>
               <TextInput
                  id="trig"
                  {...register("trig", trigramaValidationRules)}
                  maxLength={3}
                  placeholder="abc"
                  color={errors.trig ? "failure" : "gray"}
                  onKeyDown={(e) => {
                     if (!isValidTrigramaKey(e.key)) {
                        e.preventDefault();
                     }
                  }}
               />
               {errors.trig && (
                  <p className="mt-1 text-sm text-red-600">
                     {errors.trig.message}
                  </p>
               )}
            </div>
            <div className="flex flex-col gap-2">
               <Label htmlFor="active" className="text-sm font-semibold">
                  Status
               </Label>
               <div className="flex h-10.5 items-center gap-2">
                  <Checkbox
                     id="active"
                     className="size-5"
                     color="blue"
                     {...register("active")}
                  />
                  <Label htmlFor="active" className="cursor-pointer">
                     Tripulante ativo
                  </Label>
               </div>
            </div>
         </div>

         {/* Lista de Funções */}
         <div className="mt-5">
            <FuncList
               funcs={trip.funcs || []}
               onAdd={handleShowAddFunc}
               onEdit={handleShowEditFunc}
               onDelete={handleShowDeleteFunc}
            />
         </div>

         {/* Botões de Ação */}
         <div className="flex justify-center gap-3 border-t border-gray-200 pt-2">
            <Button color="gray" onClick={onCancel} disabled={submitting}>
               Cancelar
            </Button>
            <Button
               type="submit"
               disabled={submitting || !isDirty}
               color="blue"
            >
               {submitting ? (
                  <div className="flex items-center gap-2">
                     <Spinner size="sm" color="white" />
                     <span>Salvando...</span>
                  </div>
               ) : (
                  <div className="flex items-center gap-2">
                     <FaSave className="size-4" />
                     <span>Salvar Alterações</span>
                  </div>
               )}
            </Button>
         </div>

         {/* Modais de Funções */}
         <FuncAddModal
            show={showAddFunc}
            onClose={handleCloseAddFunc}
            trip={trip}
            onSuccess={onSuccess}
         />

         {editingFunc && (
            <FuncEditModal
               show={showEditFunc}
               onClose={handleCloseEditFunc}
               trip={trip}
               editingFunc={editingFunc}
               onSuccess={onSuccess}
            />
         )}

         <FuncDeleteModal
            show={showDeleteFunc}
            onClose={handleCloseDeleteFunc}
            deletingFunc={deletingFunc}
            onSuccess={onSuccess}
         />
      </form>
   );
}
