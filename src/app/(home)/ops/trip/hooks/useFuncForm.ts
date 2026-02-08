import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { useAddCrewFunc, useUpdateCrewFunc } from "@/hooks/queries";
import { useToast } from "@/app/context/toast";
import type {
   FuncFormFields,
   CreateCrewFunc,
   CrewFunc,
} from "../types/trip.types";

type UseFuncFormParams = {
   tripId: number;
   editingFunc?: CrewFunc | null;
   onClose: () => void;
};

export function useFuncForm({
   tripId,
   editingFunc,
   onClose,
}: UseFuncFormParams) {
   const { push } = useToast();
   const addFuncMutation = useAddCrewFunc();
   const updateFuncMutation = useUpdateCrewFunc();

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
         // Validacao adicional no submit
         const dataOpValue = data.data_op?.trim();
         if (data.oper !== "al" && !dataOpValue) {
            push({
               type: "error",
               message: "Data operacional e obrigatoria para operacionais.",
            });
            return;
         }

         const funcData: CreateCrewFunc = {
            func: data.func,
            oper: data.oper,
            proj: data.proj,
            data_op: data.data_op || null,
         };

         const successMessage = editingFunc
            ? "Funcao atualizada com sucesso."
            : "Funcao adicionada com sucesso.";

         const errorMessage = editingFunc
            ? "Erro ao atualizar funcao."
            : "Erro ao adicionar funcao.";

         const mutationOptions = {
            onSuccess: (result: { ok: boolean; message: string | null }) => {
               if (result.ok) {
                  onClose();
                  push({
                     type: "success",
                     message: result.message || successMessage,
                  });
               } else {
                  push({
                     type: "error",
                     message: result.message || errorMessage,
                  });
               }
            },
            onError: (err: any) => {
               push({
                  type: "error",
                  message: err?.message || errorMessage,
               });
            },
         };

         if (editingFunc) {
            updateFuncMutation.mutate(
               { funcId: editingFunc.id, data: funcData },
               mutationOptions
            );
         } else {
            addFuncMutation.mutate({ tripId, data: funcData }, mutationOptions);
         }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [tripId, editingFunc, onClose, push]
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

   return {
      register,
      handleSubmit: handleSubmit(onSubmit),
      errors,
      submitting: addFuncMutation.isPending || updateFuncMutation.isPending,
      currentOper,
      reset: resetForm,
   };
}
