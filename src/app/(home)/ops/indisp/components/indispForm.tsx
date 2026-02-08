"use client";

import { useState, useMemo, useEffect } from "react";
import {
   Button,
   Label,
   Modal,
   ModalBody,
   ModalFooter,
   ModalHeader,
   Select,
   Spinner,
   Textarea,
   TextInput,
} from "flowbite-react";
import { format } from "date-fns";

import { indispsOptions, getIndisp } from "./options";
import { IndispType } from "services/routes/indisps";
import { getUserActionLogs, UserActionLog } from "services/routes/logs";
import { useToast } from "@/app/context/toast";
import { Historico } from "./Historico";
import {
   useCreateIndisp,
   useUpdateIndisp,
   useDeleteIndisp,
} from "@/hooks/queries";

// Labels amigáveis para os campos do log
const fieldLabels: Record<string, string> = {
   date_start: "Data Início",
   date_end: "Data Fim",
   mtv: "Motivo",
   obs: "Observações",
};

// Formata valor de campo para exibição no histórico
function formatFieldValue(field: string, value: string): string {
   if (field === "mtv") {
      return getIndisp(value)?.label || value;
   }
   return value;
}

export function IndispForm({ open, setOpen, trip, indisp, readOnly = false }) {
   const { push } = useToast();
   const [confirmingDelete, setConfirmingDelete] = useState(false);
   const [logs, setLogs] = useState<UserActionLog[]>([]);
   const [isLoadingLogs, setIsLoadingLogs] = useState(false);

   // Mutations do React Query
   const createMutation = useCreateIndisp();
   const updateMutation = useUpdateIndisp();
   const deleteMutation = useDeleteIndisp();

   const isMutating =
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending;

   // 1. Gerenciamento de estado com useState
   const defaultValues = useMemo(() => {
      const today = format(new Date(), "yyyy-MM-dd");
      return {
         mtv: indisp ? indisp.mtv : "",
         dateStart: indisp ? indisp.date_start : today,
         dateEnd: indisp ? indisp.date_end : today,
         obs: indisp ? indisp.obs : "",
      };
   }, [indisp]);

   const [mtv, setMtv] = useState(defaultValues.mtv);
   const [dateStart, setDateStart] = useState(defaultValues.dateStart);
   const [dateEnd, setDateEnd] = useState(defaultValues.dateEnd);
   const [obs, setObs] = useState(defaultValues.obs);

   // Efeito para atualizar os estados quando a indisponibilidade mudar
   useEffect(() => {
      setMtv(defaultValues.mtv);
      setDateStart(defaultValues.dateStart);
      setDateEnd(defaultValues.dateEnd);
      setObs(defaultValues.obs);
   }, [defaultValues]);

   // Buscar logs de alteração quando estiver editando
   useEffect(() => {
      if (open && indisp?.id) {
         setIsLoadingLogs(true);
         getUserActionLogs({ resource: "indisp", resource_id: indisp.id })
            .then(setLogs)
            .catch(() => setLogs([]))
            .finally(() => setIsLoadingLogs(false));
      } else {
         setLogs([]);
         setIsLoadingLogs(false);
      }
   }, [open, indisp?.id]);

   // Efeito para sincronizar a data final com a inicial
   useEffect(() => {
      if (dateStart && dateEnd && dateEnd < dateStart) {
         setDateEnd(dateStart);
      }
   }, [dateStart]);

   const closeModal = () => setOpen(false);

   const clearModal = () => {
      setMtv(defaultValues.mtv);
      setDateStart(defaultValues.dateStart);
      setDateEnd(defaultValues.dateEnd);
      setObs(defaultValues.obs);
   };

   const isChanged =
      mtv !== defaultValues.mtv ||
      dateStart !== defaultValues.dateStart ||
      dateEnd !== defaultValues.dateEnd ||
      obs !== defaultValues.obs;

   // 2. Validação manual
   const validateForm = () => {
      const invalidStart = isNaN(new Date(dateStart).getTime());
      const invalidEnd = isNaN(new Date(dateEnd).getTime());
      const invalidMtv = mtv === "";
      const compareDates = new Date(dateStart) > new Date(dateEnd);

      let msg = [];
      if (invalidStart) msg.push("- Insira uma data de início válida!");
      if (invalidEnd) msg.push("- Insira uma data final válida!");
      if (invalidMtv) msg.push("- Escolha um motivo");
      if (compareDates)
         msg.push("- A data de início não deve ser maior que a data final");

      if (msg.length > 0) {
         push({
            title: "Campos Inválidos",
            message: msg.join("\n"),
            type: "error",
         });
         return false;
      }
      return true;
   };

   // 3. Submissão com React Query mutations
   const handleIndisp = () => {
      if (!validateForm()) return;

      let data: IndispType;

      if (indisp) {
         // Para atualização, envia apenas os campos que mudaram
         data = { id: indisp.id } as IndispType;
         if (mtv !== defaultValues.mtv) data.mtv = mtv;
         if (dateStart !== defaultValues.dateStart) data.date_start = dateStart;
         if (dateEnd !== defaultValues.dateEnd) data.date_end = dateEnd;
         if (obs !== defaultValues.obs) data.obs = obs;
      } else {
         // Para criação, envia todos os campos
         data = {
            mtv,
            date_start: dateStart,
            date_end: dateEnd,
            obs,
            user_id: trip.user.id,
         };
      }

      const mutation = indisp ? updateMutation : createMutation;

      mutation.mutate(data, {
         onSuccess: (message) => {
            push({
               message: message || "Operação realizada com sucesso",
               type: "success",
            });
            clearModal();
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

   // 4. Lógica de exclusão com React Query mutation
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
      <>
         <Modal
            show={open}
            size="lg"
            popup
            onClose={() => {
               clearModal();
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
                     {readOnly
                        ? "Visualizar"
                        : indisp
                          ? "Atualizar"
                          : "Adicionar"}{" "}
                     Indisponibilidade
                  </span>
               </div>
            </ModalHeader>
            <ModalBody>
               <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
                  <h3 className="text-center font-bold text-gray-900 uppercase">
                     {trip.user.posto.short} {trip.user.esp}{" "}
                     {trip.user.nome_guerra}
                  </h3>
               </div>

               <div className="grid gap-5">
                  <div className="grid gap-2">
                     <Label
                        htmlFor="mtv"
                        className="font-semibold text-gray-700"
                     >
                        Motivo <span className="text-red-500">*</span>
                     </Label>
                     <Select
                        id="mtv"
                        className="w-full"
                        value={mtv}
                        onChange={(e) => setMtv(e.target.value)}
                        required
                        disabled={readOnly}
                     >
                        <option value="" disabled>
                           Selecione um motivo
                        </option>
                        {indispsOptions.map((item) => (
                           <option key={item.value} value={item.value}>
                              {item.label}
                           </option>
                        ))}
                     </Select>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                     <div className="grid gap-2">
                        <Label
                           htmlFor="date_start"
                           className="font-semibold text-gray-700"
                        >
                           Data de Início{" "}
                           <span className="text-red-500">*</span>
                        </Label>
                        <TextInput
                           id="date_start"
                           type="date"
                           value={dateStart}
                           onChange={(e) => setDateStart(e.target.value)}
                           required
                           disabled={readOnly}
                        />
                     </div>
                     <div className="grid gap-2">
                        <Label
                           htmlFor="date_end"
                           className="font-semibold text-gray-700"
                        >
                           Data de Fim <span className="text-red-500">*</span>
                        </Label>
                        <TextInput
                           id="date_end"
                           type="date"
                           value={dateEnd}
                           min={dateStart}
                           onChange={(e) => setDateEnd(e.target.value)}
                           required
                           disabled={readOnly}
                        />
                     </div>
                  </div>

                  <div className="grid gap-2">
                     <Label
                        htmlFor="obs"
                        className="font-semibold text-gray-700"
                     >
                        Observações
                     </Label>
                     <Textarea
                        id="obs"
                        placeholder="Detalhes adicionais sobre a indisponibilidade..."
                        value={obs}
                        className="placeholder-slate-500"
                        onChange={(e) => setObs(e.target.value)}
                        disabled={readOnly}
                     />
                  </div>

                  {/* Histórico */}
                  {indisp && (
                     <Historico
                        logs={logs}
                        createdAt={indisp.created_at}
                        createdBy={indisp.user_created}
                        fieldLabels={fieldLabels}
                        formatFieldValue={formatFieldValue}
                        isLoading={isLoadingLogs}
                     />
                  )}
               </div>
            </ModalBody>
            <ModalFooter className="flex justify-center gap-3 bg-gray-50">
               {!readOnly && !confirmingDelete && (
                  <Button
                     color="blue"
                     onClick={handleIndisp}
                     disabled={isMutating || (indisp ? !isChanged : false)}
                     size="md"
                  >
                     {isMutating && !deleteMutation.isPending ? (
                        <Spinner color="info" size="sm" />
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
                     size="md"
                     disabled={isMutating}
                  >
                     Excluir
                  </Button>
               )}
               {confirmingDelete && (
                  <>
                     <span className="text-sm font-medium text-gray-700">
                        {deleteMutation.isPending
                           ? "Excluindo..."
                           : "Confirmar exclusão?"}
                     </span>
                     <Button
                        color="red"
                        size="md"
                        onClick={confirmDelete}
                        disabled={deleteMutation.isPending}
                     >
                        {deleteMutation.isPending ? (
                           <Spinner color="failure" size="sm" />
                        ) : (
                           "Sim"
                        )}
                     </Button>
                     <Button
                        color="gray"
                        size="md"
                        onClick={() => setConfirmingDelete(false)}
                        disabled={deleteMutation.isPending}
                     >
                        Não
                     </Button>
                  </>
               )}
               {!confirmingDelete && (
                  <Button
                     color="gray"
                     onClick={() => {
                        clearModal();
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
      </>
   );
}
