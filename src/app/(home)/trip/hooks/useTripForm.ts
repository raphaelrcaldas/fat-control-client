import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { updateTrip } from "services/routes/trips";
import { useToast } from "../../../context/toast";
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
      (data: TripFormFields) => {
         data.trig = data.trig.toLowerCase();
         setSubmitting(true);

         updateTrip(trip.id!, data)
            .then(() => {
               onSuccess();
               onClose();
               push({
                  type: "success",
                  message: "Tripulante atualizado com sucesso.",
               });
            })
            .catch((err) => {
               console.error(err);
               push({
                  type: "error",
                  message: "Erro ao atualizar tripulante.",
               });
            })
            .finally(() => setSubmitting(false));
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
