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
import { ptBR } from "date-fns/locale";

import { indispsOptions, getIndisp } from "./options";
import {
   addIndisp,
   updateIndisp,
   deleteIndisp,
   IndispType,
} from "services/routes/indisps";
import { getUserActionLogs, UserActionLog } from "services/routes/logs";
import { useToast } from "@/app/context/toast";

// Labels amigáveis para os campos do log
const fieldLabels: Record<string, string> = {
   date_start: "Data Início",
   date_end: "Data Fim",
   mtv: "Motivo",
   obs: "Observações",
};

export function IndispForm({
   open,
   setOpen,
   trip,
   update,
   indisp,
   readOnly = false,
}) {
   const { push } = useToast();
   const [confirmingDelete, setConfirmingDelete] = useState(false);
   const [isDeleting, setIsDeleting] = useState(false);
   const [logs, setLogs] = useState<UserActionLog[]>([]);

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
         getUserActionLogs({ resource: "indisp", resource_id: indisp.id })
            .then(setLogs)
            .catch(() => setLogs([]));
      } else {
         setLogs([]);
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

   // 3. Submissão manual
   const handleIndisp = async () => {
      if (validateForm()) {
         let data: IndispType;

         if (indisp) {
            // Para atualização, envia apenas os campos que mudaram
            data = { id: indisp.id } as IndispType;
            if (mtv !== defaultValues.mtv) data.mtv = mtv;
            if (dateStart !== defaultValues.dateStart)
               data.date_start = dateStart;
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

         try {
            let response: Response;
            if (indisp) {
               response = await updateIndisp(data);
            } else {
               response = await addIndisp(data);
            }

            const rdata = await response.json();

            if (response.ok) {
               push({
                  message: rdata.detail || "Operação realizada com sucesso",
                  type: "success",
               });
               // Chama update ANTES de fechar para garantir atualização
               // (evita que o componente seja desmontado antes da atualização)
               await update();
               clearModal();
               closeModal();
            } else {
               push({
                  message: rdata.detail || "Erro na operação",
                  type: "error",
               });
            }
         } catch (err: any) {
            push({
               message: err?.message || "Falha na comunicação com o servidor.",
               type: "error",
            });
         }
      }
   };

   // 4. Lógica de exclusão
   const confirmDelete = async () => {
      if (!indisp?.id) return;
      setIsDeleting(true);

      try {
         const response = await deleteIndisp(indisp.id);
         const rData = await response.json();

         if (response.ok) {
            push({
               message:
                  rData.detail || "Indisponibilidade excluída com sucesso",
               type: "success",
            });
            // Chama update ANTES de fechar para garantir atualização
            await update();
            closeModal();
         } else {
            push({
               message: rData.detail || "Erro ao excluir indisponibilidade",
               type: "error",
            });
         }
      } catch (err: any) {
         push({
            message: err?.message || "Falha ao excluir indisponibilidade.",
            type: "error",
         });
      } finally {
         setIsDeleting(false);
         setConfirmingDelete(false);
      }
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
               {readOnly && (
                  <div className="mb-4 rounded-lg border border-red-300 bg-red-100 px-4 py-2 text-center font-medium text-red-700">
                     🗑️ Esta indisponibilidade foi deletada
                  </div>
               )}
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

                  {/* Histórico de Alterações */}
                  {indisp && logs.length > 0 && (
                     <div className="mt-6 border-t border-gray-200 pt-4">
                        <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-700">
                           <span>📝</span> Histórico de Alterações
                        </h4>
                        <div className="max-h-48 space-y-3 overflow-y-auto">
                           {logs.map((log) => {
                              const before = log.before
                                 ? JSON.parse(log.before)
                                 : {};
                              const after = log.after
                                 ? JSON.parse(log.after)
                                 : {};
                              const changedFields = Object.keys(after);
                              const isDeleteAction = log.action === "delete";

                              return (
                                 <div
                                    key={log.id}
                                    className={`rounded-lg border p-3 text-sm ${
                                       isDeleteAction
                                          ? "border-red-200 bg-red-50"
                                          : "border-gray-100 bg-gray-50"
                                    }`}
                                 >
                                    <div className="mb-2 flex items-center justify-between">
                                       <span className="font-medium text-gray-900 uppercase">
                                          {log.user.p_g} {log.user.nome_guerra}
                                       </span>
                                       <span className="text-xs text-gray-500">
                                          {format(
                                             new Date(log.timestamp + "Z"),
                                             "dd/MM/yyyy HH:mm",
                                             { locale: ptBR }
                                          )}
                                       </span>
                                    </div>
                                    {isDeleteAction ? (
                                       <div className="font-medium text-red-600">
                                          🗑️ Indisponibilidade deletada
                                       </div>
                                    ) : (
                                       <ul className="space-y-1">
                                          {changedFields.map((field) => {
                                             const label =
                                                fieldLabels[field] || field;
                                             let oldVal = before[field] ?? "";
                                             let newVal = after[field] ?? "";

                                             // Traduzir valores de motivo
                                             if (field === "mtv") {
                                                oldVal =
                                                   getIndisp(oldVal)?.label ||
                                                   oldVal;
                                                newVal =
                                                   getIndisp(newVal)?.label ||
                                                   newVal;
                                             }

                                             return (
                                                <li
                                                   key={field}
                                                   className="text-gray-600"
                                                >
                                                   <span className="font-medium">
                                                      {label}:
                                                   </span>{" "}
                                                   <span className="text-red-600 line-through">
                                                      {oldVal || "(vazio)"}
                                                   </span>
                                                   {" → "}
                                                   <span className="text-green-600">
                                                      {newVal || "(vazio)"}
                                                   </span>
                                                </li>
                                             );
                                          })}
                                       </ul>
                                    )}
                                 </div>
                              );
                           })}
                        </div>
                     </div>
                  )}
               </div>
            </ModalBody>
            <ModalFooter className="flex justify-center gap-3 bg-gray-50">
               {!readOnly && !confirmingDelete && (
                  <Button
                     color="blue"
                     onClick={handleIndisp}
                     disabled={indisp ? !isChanged : false}
                     size="md"
                  >
                     {indisp ? "Atualizar" : "Adicionar"}
                  </Button>
               )}
               {indisp && !readOnly && !confirmingDelete && (
                  <Button
                     type="button"
                     onClick={() => setConfirmingDelete(true)}
                     color="red"
                     size="md"
                  >
                     Excluir
                  </Button>
               )}
               {confirmingDelete && (
                  <>
                     <span className="text-sm font-medium text-gray-700">
                        {isDeleting ? "Excluindo..." : "Confirmar exclusão?"}
                     </span>
                     <Button
                        color="red"
                        size="md"
                        onClick={confirmDelete}
                        disabled={isDeleting}
                     >
                        {isDeleting ? (
                           <Spinner color="failure" size="sm" />
                        ) : (
                           "Sim"
                        )}
                     </Button>
                     <Button
                        color="gray"
                        size="md"
                        onClick={() => setConfirmingDelete(false)}
                        disabled={isDeleting}
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
                  >
                     Cancelar
                  </Button>
               )}
            </ModalFooter>
         </Modal>
      </>
   );
}
