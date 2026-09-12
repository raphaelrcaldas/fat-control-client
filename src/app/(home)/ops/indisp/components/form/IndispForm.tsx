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
import { useAuth } from "@/app/context/auth";
import { usePermBased } from "@/app/(home)/hooks/usePermBased";
import { useToast } from "@/app/context/toast";
import {
   useCreateIndisp,
   useUpdateIndisp,
   useDeleteIndisp,
} from "@/hooks/queries/useIndisps";
import { formatSaveError } from "utils/apiErrors";
import { useIndispFormState } from "./hooks/useIndispFormState";
import { useIndispLogs } from "./hooks/useIndispLogs";
import { Historico } from "@/components/audit/Historico";
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
   /** Data que a criação já nasce preenchendo (vaga "+" da grade). */
   initialDate?: string;
}

export function IndispForm({
   open,
   setOpen,
   trip,
   indisp,
   readOnly = false,
   initialDate,
}: IndispFormProps) {
   const { push } = useToast();
   const [confirmingDelete, setConfirmingDelete] = useState(false);

   /**
    * Espelha `ensure_org_permission_or_owner` do backend: **dono OU
    * permissão**, e a permissão é por AÇÃO, uma a uma.
    *
    * Só o "Adicionar" era gateado, então quem tinha apenas `ops.indisp.create`
    * via "Atualizar" e "Excluir" e levava 403 ao clicar — a tela prometia o
    * que a API recusa. Gatear só por permissão também estaria errado no outro
    * sentido: o militar sem role perderia o botão da PRÓPRIA
    * indisponibilidade, que o backend deixa passar por ser dele.
    */
   const { hasPerm } = usePermBased();
   const { userId } = useAuth();
   const isOwner = userId !== null && userId === trip.user.id;
   const podeGravar =
      isOwner || hasPerm("ops.indisp", indisp ? "update" : "create");
   const podeExcluir = isOwner || hasPerm("ops.indisp", "delete");
   // Sem nenhuma das duas, editar campo não leva a lugar nenhum: a tela
   // assume a consulta em vez de oferecer um formulário que não salva.
   const somenteLeitura = readOnly || (!podeGravar && !podeExcluir);

   const createMutation = useCreateIndisp();
   const updateMutation = useUpdateIndisp();
   const deleteMutation = useDeleteIndisp();

   const isMutating =
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending;

   const { values, setField, reset, isChanged, validate, buildPayload } =
      useIndispFormState(indisp, initialDate);

   const {
      logs,
      isLoading: isLoadingLogs,
      isError: isErrorLogs,
      refetch: refetchLogs,
   } = useIndispLogs(indisp?.id, open);

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
               message: formatSaveError(
                  err,
                  "Falha na comunicação com o servidor.",
                  { fields: fieldLabels }
               ),
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
         onClose={() => {
            if (isMutating) return;
            reset();
            closeModal();
         }}
         dismissible={!isMutating}
         className="h-dvh items-start"
         theme={{ content: { base: "h-auto" } }}
      >
         <ModalHeader
            as="h2"
            theme={{ title: "min-w-0", close: { base: "shrink-0" } }}
         >
            <span
               className="block truncate text-lg font-bold text-slate-800 uppercase"
               title={`${trip.user.posto.short} ${trip.user.nome_guerra}`}
            >
               {trip.user.posto.short} {trip.user.nome_guerra}
            </span>
            <span className="block text-sm font-normal text-slate-500">
               {somenteLeitura
                  ? "Consultar indisponibilidade"
                  : indisp
                    ? "Editar indisponibilidade"
                    : "Nova indisponibilidade"}
            </span>
         </ModalHeader>
         <ModalBody className="min-h-0 space-y-4 p-3 sm:p-6">
            {somenteLeitura && (
               <p className="rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                  Registro disponível apenas para consulta.
               </p>
            )}
            <form
               id="indisp-form"
               onSubmit={(event) => {
                  event.preventDefault();
                  if (podeGravar && !somenteLeitura && !isMutating)
                     handleIndisp();
               }}
            >
               <IndispFormFields
                  values={values}
                  setField={setField}
                  readOnly={somenteLeitura || !podeGravar || isMutating}
               />
            </form>
            {indisp && (
               <Historico
                  logs={logs}
                  createdAt={indisp.created_at}
                  createdBy={indisp.user_created}
                  fieldLabels={fieldLabels}
                  formatFieldValue={formatFieldValue}
                  isLoading={isLoadingLogs}
                  isError={isErrorLogs}
                  onRetry={refetchLogs}
               />
            )}
         </ModalBody>
         <ModalFooter className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-slate-200 bg-slate-50 p-3 sm:p-4">
            {podeGravar && !somenteLeitura && !confirmingDelete && (
               <Button
                  color="primary"
                  type="submit"
                  form="indisp-form"
                  disabled={isMutating || (indisp ? !isChanged : false)}
                  size="md"
               >
                  {isMutating && !deleteMutation.isPending ? (
                     <>
                        <Spinner
                           color="primary"
                           size="sm"
                           aria-hidden
                           className="mr-2"
                        />
                        Salvando…
                     </>
                  ) : indisp ? (
                     "Atualizar"
                  ) : (
                     "Adicionar"
                  )}
               </Button>
            )}
            {indisp && podeExcluir && !somenteLeitura && !confirmingDelete && (
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
                  color="light"
                  onClick={() => {
                     reset();
                     closeModal();
                  }}
                  size="md"
                  disabled={isMutating}
               >
                  {somenteLeitura ? "Fechar" : "Cancelar"}
               </Button>
            )}
         </ModalFooter>
      </Modal>
   );
}
