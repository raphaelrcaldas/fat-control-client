"use client";

import { useState } from "react";
import {
   Button,
   Modal,
   ModalBody,
   ModalFooter,
   ModalHeader,
   Spinner,
} from "flowbite-react";
import { getIndispOption } from "@/constants/ops/indisponibilidades";
import { CrewIndisp, IndispType } from "services/routes/indisps";
import { useToast } from "@/app/context/toast";
import {
   useCreateIndisp,
   useUpdateIndisp,
   useDeleteIndisp,
} from "@/hooks/queries";
import { useIndispFormState } from "../hooks/useIndispFormState";
import { useIndispLogs } from "../hooks/useIndispLogs";
import { Historico } from "./Historico";
import { IndispFormFields } from "./IndispFormFields";
import { IndispDeleteConfirm } from "./IndispDeleteConfirm";

// Labels amigáveis para os campos do log
const fieldLabels: Record<string, string> = {
   date_start: "Data Início",
   date_end: "Data Fim",
   mtv: "Motivo",
   obs: "Observações",
};

function formatFieldValue(field: string, value: string): string {
   if (field === "mtv") return getIndispOption(value)?.label || value;
   return value;
}

interface IndispFormProps {
   open: boolean;
   setOpen: (open: boolean) => void;
   trip: CrewIndisp;
   indisp: IndispType | null;
   readOnly?: boolean;
}

export function IndispForm({
   open,
   setOpen,
   trip,
   indisp,
   readOnly = false,
}: IndispFormProps) {
   const { push } = useToast();
   const [confirmingDelete, setConfirmingDelete] = useState(false);

   const createMutation = useCreateIndisp();
   const updateMutation = useUpdateIndisp();
   const deleteMutation = useDeleteIndisp();

   const isMutating =
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending;

   const { values, setField, reset, isChanged, validate, buildPayload } =
      useIndispFormState(indisp);

   const { logs, isLoading: isLoadingLogs } = useIndispLogs(indisp?.id, open);

   const closeModal = () => setOpen(false);

   const handleIndisp = () => {
      const errors = validate();
      if (errors.length > 0) {
         push({
            title: "Campos Inválidos",
            message: errors.join("\n"),
            type: "error",
         });
         return;
      }

      const data = buildPayload(trip.user.id);
      const mutation = indisp ? updateMutation : createMutation;

      mutation.mutate(data, {
         onSuccess: (message) => {
            push({
               message: message || "Operação realizada com sucesso",
               type: "success",
            });
            reset();
            closeModal();
         },
         onError: (err: Error) => {
            push({
               message: err.message || "Falha na comunicação com o servidor.",
               type: "error",
            });
         },
      });
   };

   const confirmDelete = () => {
      if (!indisp?.id) return;

      deleteMutation.mutate(indisp.id, {
         onSuccess: (message) => {
            push({
               message: message || "Indisponibilidade excluída com sucesso",
               type: "success",
            });
            setConfirmingDelete(false);
            closeModal();
         },
         onError: (err: Error) => {
            push({
               message: err.message || "Falha ao excluir indisponibilidade.",
               type: "error",
            });
            setConfirmingDelete(false);
         },
      });
   };

   return (
      <Modal
         show={open}
         size="lg"
         popup
         onClose={() => {
            reset();
            closeModal();
         }}
         dismissible
      >
         <ModalHeader>
            <div className="flex flex-row items-center gap-2">
               {indisp && (
                  <span className="text-sm font-normal text-gray-500">
                     ID: {indisp.id}
                  </span>
               )}
               <span className="text-lg font-bold">
                  {readOnly ? "Visualizar" : indisp ? "Atualizar" : "Adicionar"}{" "}
                  Indisponibilidade
               </span>
            </div>
         </ModalHeader>
         <ModalBody>
            <div className="mb-4 rounded border border-red-200 bg-red-50 p-4">
               <h3 className="text-center font-bold text-gray-900 uppercase">
                  {trip.user.posto.short} {trip.user.nome_guerra}
               </h3>
            </div>

            <IndispFormFields
               values={values}
               setField={setField}
               readOnly={readOnly}
            />

            {indisp && (
               <div className="mt-5">
                  <Historico
                     logs={logs}
                     createdAt={indisp.created_at}
                     createdBy={indisp.user_created}
                     fieldLabels={fieldLabels}
                     formatFieldValue={formatFieldValue}
                     isLoading={isLoadingLogs}
                  />
               </div>
            )}
         </ModalBody>
         <ModalFooter className="flex justify-center gap-3 bg-gray-50">
            {!readOnly && !confirmingDelete && (
               <Button
                  color="red"
                  onClick={handleIndisp}
                  disabled={isMutating || (indisp ? !isChanged : false)}
                  size="md"
               >
                  {isMutating && !deleteMutation.isPending ? (
                     <Spinner color="failure" size="sm" />
                  ) : indisp ? (
                     "Atualizar"
                  ) : (
                     "Adicionar"
                  )}
               </Button>
            )}
            {indisp && !readOnly && !confirmingDelete && (
               <Button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  color="red"
                  outline
                  size="md"
                  disabled={isMutating}
               >
                  Excluir
               </Button>
            )}
            {confirmingDelete && (
               <IndispDeleteConfirm
                  isDeleting={deleteMutation.isPending}
                  onConfirm={confirmDelete}
                  onCancel={() => setConfirmingDelete(false)}
               />
            )}
            {!confirmingDelete && (
               <Button
                  color="gray"
                  onClick={() => {
                     reset();
                     closeModal();
                  }}
                  size="md"
                  disabled={isMutating}
               >
                  Cancelar
               </Button>
            )}
         </ModalFooter>
      </Modal>
   );
}
