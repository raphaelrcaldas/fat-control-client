import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useUpdateTrip } from "@/hooks/queries";
import { useToast } from "@/app/context/toast";
import type { UpdateTripData } from "services/routes/trips";
import type { TripFormFields, Trip } from "../types/trip.types";

type UseTripFormParams = {
   trip: Trip;
   onClose: () => void;
};

export function useTripForm({ trip, onClose }: UseTripFormParams) {
   const { push } = useToast();
   const updateTripMutation = useUpdateTrip();

   const {
      register,
      handleSubmit,
      reset,
      watch,
      formState: { errors, isDirty },
   } = useForm<TripFormFields>({
      defaultValues: {
         trig: trip.trig,
         active: trip.active,
         func: trip.func,
         oper: trip.oper,
         proj: trip.proj,
         data_op: trip.data_op ?? "",
      },
   });

   useEffect(() => {
      reset({
         trig: trip.trig.toUpperCase(),
         active: trip.active,
         func: trip.func,
         oper: trip.oper,
         proj: trip.proj,
         data_op: trip.data_op ?? "",
      });
   }, [trip, reset]);

   const currentOper = watch("oper");

   const onSubmit = async (data: TripFormFields) => {
      if (!trip.id) {
         push({
            type: "error",
            message: "ID do tripulante nao encontrado.",
         });
         return;
      }

      const payload: UpdateTripData = {
         trig: data.trig.toLowerCase(),
         active: data.active,
         func: data.func,
         oper: data.oper,
         proj: data.proj,
         data_op: data.data_op?.trim() || null,
      };

      updateTripMutation.mutate(
         { id: trip.id, data: payload },
         {
            onSuccess: (result) => {
               if (result.ok) {
                  onClose();
                  push({
                     type: "success",
                     message:
                        result.message || "Tripulante atualizado com sucesso.",
                  });
               } else {
                  push({
                     type: "error",
                     message: result.message || "Erro ao atualizar tripulante.",
                  });
               }
            },
            onError: (err: any) => {
               push({
                  type: "error",
                  message: err?.message || "Erro ao atualizar tripulante.",
               });
            },
         }
      );
   };

   return {
      register,
      handleSubmit: handleSubmit(onSubmit),
      errors,
      isDirty,
      submitting: updateTripMutation.isPending,
      currentOper,
      reset,
   };
}
