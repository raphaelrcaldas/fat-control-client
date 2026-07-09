import {
   Label,
   TextInput,
   Checkbox,
   Button,
   Badge,
   Spinner,
} from "flowbite-react";
import { FaSave } from "react-icons/fa";
import { HiCheckCircle, HiXCircle } from "react-icons/hi";
import { useTripForm } from "../../hooks/useTripForm";
import {
   isValidTrigramaKey,
   trigramaValidationRules,
} from "../../utils/validateTrigrama";
import { FuncFields } from "../FuncFields";
import type { Trip } from "../../types/trip.types";

type TripEditFormProps = {
   trip: Trip;
   onClose: () => void;
   onCancel: () => void;
};

export function TripEditForm({ trip, onClose, onCancel }: TripEditFormProps) {
   const { register, handleSubmit, errors, isDirty, submitting, currentOper } =
      useTripForm({ trip, onClose });

   return (
      <form onSubmit={handleSubmit} className="space-y-5">
         {/* Informações do Usuário */}
         <div className="rounded border border-red-200 bg-red-50 p-4">
            <div className="flex items-center justify-between">
               <div>
                  <h3 className="text-lg font-bold text-slate-800 uppercase">
                     {`${trip.user.posto.short} ${trip.user.quadro ?? ""} ${trip.user.esp ?? ""} ${trip.user.nome_guerra}`}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 capitalize">
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
         <div className="grid grid-cols-2 gap-4 rounded border border-slate-200 bg-slate-50 p-4">
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
                     color="red"
                     {...register("active")}
                  />
                  <Label htmlFor="active" className="cursor-pointer">
                     Tripulante ativo
                  </Label>
               </div>
            </div>
         </div>

         {/* Função do Tripulante (1:1) */}
         <div className="rounded border border-slate-200 bg-slate-50 p-4">
            <h4 className="mb-3 text-sm font-semibold text-slate-700">
               Função do Tripulante
            </h4>
            <FuncFields
               register={register}
               errors={errors}
               currentOper={currentOper}
            />
         </div>

         {/* Botões de Ação */}
         <div className="flex justify-center gap-3 border-t border-slate-200 pt-2">
            <Button color="gray" onClick={onCancel} disabled={submitting}>
               Cancelar
            </Button>
            <Button type="submit" disabled={submitting || !isDirty} color="red">
               {submitting ? (
                  <div className="flex items-center gap-2">
                     <Spinner size="sm" color="failure" />
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
      </form>
   );
}
