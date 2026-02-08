import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useUpdateTrip } from "@/hooks/queries";
import { useToast } from "@/app/context/toast";
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
      formState: { errors, isDirty },
   } = useForm<TripFormFields>({
      defaultValues: {
         trig: trip.trig,
         active: trip.active,
      },
   });

   useEffect(() => {
      reset({
         trig: trip.trig.toUpperCase(),
         active: trip.active,
      });
   }, [trip, reset]);

   const onSubmit = async (data: TripFormFields) => {
      if (!trip.id) {
         push({
            type: "error",
            message: "ID do tripulante nao encontrado.",
         });
         return;
      }

      data.trig = data.trig.toLowerCase();

      updateTripMutation.mutate(
         { id: trip.id, data },
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
      reset,
   };
}
