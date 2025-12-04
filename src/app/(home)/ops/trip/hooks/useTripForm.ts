import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { updateTrip } from "services/routes/trips";
import { useToast } from "@/app/context/toast";
import type { TripFormFields, Trip } from "../types/trip.types";

type UseTripFormParams = {
   trip: Trip;
   onSuccess: () => void;
   onClose: () => void;
};

export function useTripForm({ trip, onSuccess, onClose }: UseTripFormParams) {
   const [submitting, setSubmitting] = useState(false);
   const { push } = useToast();

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

   const onSubmit = useCallback(
      async (data: TripFormFields) => {
         data.trig = data.trig.toLowerCase();
         setSubmitting(true);

         try {
            const response = await updateTrip(trip.id!, data);
            const responseData = await response.json();
            if (response.ok) {
               onSuccess();
               onClose();
               push({
                  type: "success",
                  message: responseData.detail || "Tripulante atualizado com sucesso.",
               });
            } else {
               push({
                  type: "error",
                  message: responseData.detail || "Erro ao atualizar tripulante.",
               });
            }
         } catch (err: any) {
            push({
               type: "error",
               message: err?.message || "Erro ao atualizar tripulante.",
            });
         } finally {
            setSubmitting(false);
         }
      },
      [trip.id, onSuccess, onClose, push]
   );

   return {
      register,
      handleSubmit: handleSubmit(onSubmit),
      errors,
      isDirty,
      submitting,
      reset,
   };
}
