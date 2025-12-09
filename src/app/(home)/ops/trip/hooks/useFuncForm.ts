import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { addCrewFunc, updateCrewFunc } from "services/routes/trips";
import { useToast } from "@/app/context/toast";
import type {
   FuncFormFields,
   CreateCrewFunc,
   CrewFunc,
} from "../types/trip.types";

type UseFuncFormParams = {
   tripId: number;
   editingFunc?: CrewFunc | null;
   onSuccess: () => void;
   onClose: () => void;
};

export function useFuncForm({
   tripId,
   editingFunc,
   onSuccess,
   onClose,
}: UseFuncFormParams) {
   const [submitting, setSubmitting] = useState(false);
   const { push } = useToast();

   const {
      register,
      handleSubmit,
      reset,
      watch,
      formState: { errors },
   } = useForm<FuncFormFields>({
      mode: "onSubmit",
      reValidateMode: "onChange",
      defaultValues: {
         func: editingFunc?.func,
         oper: editingFunc?.oper,
         proj: editingFunc?.proj || "kc-390",
         data_op: editingFunc?.data_op || "",
      },
   });

   const currentOper = watch("oper");

   const onSubmit = useCallback(
      async (data: FuncFormFields) => {
         // Validação adicional no submit
         const dataOpValue = data.data_op?.trim();
         if (data.oper !== "al" && !dataOpValue) {
            push({
               type: "error",
               message: "Data operacional é obrigatória para operacionais.",
            });
            return;
         }

         setSubmitting(true);

         const funcData: CreateCrewFunc = {
            func: data.func,
            oper: data.oper,
            proj: data.proj,
            data_op: data.data_op || null,
         };

         const action = editingFunc
            ? updateCrewFunc(editingFunc.id, funcData)
            : addCrewFunc(tripId, funcData);

         const successMessage = editingFunc
            ? "Função atualizada com sucesso."
            : "Função adicionada com sucesso.";

         const errorMessage = editingFunc
            ? "Erro ao atualizar função."
            : "Erro ao adicionar função.";

         try {
            const response = await action;
            const responseData = await response.json();
            if (response.ok) {
               onSuccess();
               onClose();
               push({
                  type: "success",
                  message: responseData.detail || successMessage,
               });
            } else {
               push({
                  type: "error",
                  message: responseData.detail || errorMessage,
               });
            }
         } catch (err: any) {
            push({
               type: "error",
               message: err?.message || errorMessage,
            });
         } finally {
            setSubmitting(false);
         }
      },
      [tripId, editingFunc, onSuccess, onClose, push]
   );

   const resetForm = useCallback(
      (func?: CrewFunc) => {
         reset({
            func: func?.func || "pil",
            oper: func?.oper || "op",
            proj: func?.proj || "kc-390",
            data_op: func?.data_op || "",
         });
      },
      [reset]
   );

   const wrappedHandleSubmit = useCallback(
      (e?: React.BaseSyntheticEvent) => {
         return handleSubmit(onSubmit)(e);
      },
      [handleSubmit, onSubmit]
   );

   return {
      register,
      handleSubmit: wrappedHandleSubmit,
      errors,
      submitting,
      currentOper,
      reset: resetForm,
   };
}
