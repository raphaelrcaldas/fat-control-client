"use client";

import { memo, useState } from "react";
import {
   Modal,
   ModalHeader,
   ModalBody,
   ModalFooter,
   Button,
   Label,
   TextInput,
   Spinner,
} from "flowbite-react";
import { HiPhone, HiTrash } from "react-icons/hi";
import { FaPassport } from "react-icons/fa";
import clsx from "clsx";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { PermBased, usePermBased } from "@/app/(home)/hooks/usePermBased";
import { useToast } from "@/app/context/toast";
import { formatPhone, formatSaram } from "@/constants/formats";
import { useUpsertPassaporte, useDeletePassaporte } from "@/hooks/queries";
import type { TripPassaporteOut } from "services/routes/inteligencia/passaportes";
import {
   getDateStatus,
   getStatusConfig,
   getDaysRemaining,
} from "../utils/dateStatus";
import { usePassaporteForm } from "../hooks/usePassaporteForm";
import { DocumentoImagem } from "./DocumentoImagem";

// ========================================
// DocumentStatusStrip — assinatura da tela
// ========================================

/**
 * Faixa de status no topo de cada documento: tingida pela cor do status de
 * validade (Regular/Atenção/Crítico/Vencido) com o tipo do documento, o rótulo
 * do status e a contagem de dias. É o sinal operacional da tela — fonte única
 * de status (por isso os campos abaixo não repetem essa informação). Atualiza
 * ao vivo conforme a data de validade é editada no formulário.
 */
function DocumentStatusStrip({
   titulo,
   validade,
}: {
   titulo: string;
   validade: string;
}) {
   const status = getDateStatus(validade || null);
   const config = getStatusConfig(status);
   const Icon = config.icon;
   const dias = getDaysRemaining(validade || null);

   return (
      <div
         className={clsx(
            "flex items-center justify-between gap-3 border-b px-4 py-2.5",
            config.bg,
            config.border
         )}
      >
         <span className="font-mono text-[10px] font-bold tracking-[0.3em] text-slate-600 uppercase">
            {titulo}
         </span>
         <div className={clsx("flex items-center gap-1.5", config.color)}>
            <Icon className="h-4 w-4 shrink-0" />
            <span className="text-xs font-semibold">{config.label}</span>
            {dias && (
               <span className="font-mono text-xs tabular-nums opacity-80">
                  · {dias}
               </span>
            )}
         </div>
      </div>
   );
}

// ========================================
// DocumentSection — card de um documento
// ========================================

function DocumentSection({
   titulo,
   tipo,
   tripId,
   imageUrl,
   validade,
   children,
}: {
   titulo: string;
   tipo: "passaporte" | "visa";
   tripId: number;
   imageUrl: string | null;
   validade: string;
   children: React.ReactNode;
}) {
   return (
      <div className="overflow-hidden rounded border border-slate-200 shadow-sm">
         <DocumentStatusStrip titulo={titulo} validade={validade} />
         <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-[minmax(0,15rem)_1fr]">
            <DocumentoImagem tripId={tripId} tipo={tipo} url={imageUrl} />
            <div className="space-y-3">{children}</div>
         </div>
      </div>
   );
}

// ========================================
// DateField — input de data rotulado
// ========================================

function DateField({
   label,
   name,
   value,
   onChange,
   min,
   max,
   disabled,
}: {
   label: string;
   name: string;
   value: string;
   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
   min?: string;
   max?: string;
   disabled?: boolean;
}) {
   return (
      <div>
         <Label htmlFor={name}>{label}</Label>
         <div className="mt-1">
            <TextInput
               id={name}
               name={name}
               type="date"
               value={value}
               onChange={onChange}
               min={min || undefined}
               max={max || undefined}
               disabled={disabled}
            />
         </div>
      </div>
   );
}

// ========================================
// NumeroField — input de número do documento (serial, mono)
// ========================================

function NumeroField({
   label,
   name,
   value,
   onChange,
   disabled,
}: {
   label: string;
   name: string;
   value: string;
   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
   disabled?: boolean;
}) {
   return (
      <div>
         <Label htmlFor={name}>{label}</Label>
         <div className="mt-1">
            <TextInput
               id={name}
               name={name}
               type="text"
               placeholder="----"
               value={value}
               onChange={onChange}
               disabled={disabled}
               className="font-mono"
            />
         </div>
      </div>
   );
}

// ========================================
// EditPassaporteModal
// ========================================

interface EditPassaporteModalProps {
   show: boolean;
   onClose: () => void;
   item: TripPassaporteOut;
}

const EditPassaporteModal = memo(function EditPassaporteModal({
   show,
   onClose,
   item,
}: EditPassaporteModalProps) {
   const { push } = useToast();
   const { hasPerm } = usePermBased();
   const isEdit = !!item.passaporte;

   // Só-view abre o modal em modo leitura: sem a permissão de gravar
   // (update ao editar, create ao cadastrar) os campos ficam desabilitados.
   const canSave = hasPerm("passaportes", isEdit ? "update" : "create");
   const readOnly = !canSave;

   const upsertMutation = useUpsertPassaporte();
   const deleteMutation = useDeletePassaporte();

   const isLoading = upsertMutation.isPending || deleteMutation.isPending;
   const isDeleting = deleteMutation.isPending;

   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
   const { formData, handleChange, validate, buildPayload, isDirty } =
      usePassaporteForm(item, show);

   const handleSave = async () => {
      const error = validate();
      if (error) {
         push({ title: "Erro", message: error, type: "error" });
         return;
      }

      try {
         await upsertMutation.mutateAsync({
            trip_id: item.trip_id,
            data: buildPayload(),
         });
         push({
            message: isEdit
               ? "Passaporte atualizado com sucesso"
               : "Passaporte cadastrado com sucesso",
            type: "success",
         });
         onClose();
      } catch (err: unknown) {
         const message =
            err instanceof Error ? err.message : "Erro ao salvar passaporte";
         push({ title: "Erro", message, type: "error" });
      }
   };

   const handleDelete = async () => {
      try {
         await deleteMutation.mutateAsync(item.trip_id);
         push({ message: "Passaporte removido com sucesso", type: "success" });
         onClose();
      } catch (err: unknown) {
         const message =
            err instanceof Error ? err.message : "Erro ao remover passaporte";
         push({ title: "Erro", message, type: "error" });
      } finally {
         setShowDeleteConfirm(false);
      }
   };

   return (
      <>
         <Modal show={show} onClose={onClose} size="2xl" dismissible>
            {/* Cabeçalho-dossiê: identidade do militar como título */}
            <ModalHeader>
               <span className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-red-50 text-red-600 ring-1 ring-red-100 ring-inset">
                     <FaPassport className="h-5 w-5" />
                  </span>
                  <span className="block min-w-0">
                     <span className="block font-mono text-[10px] font-bold tracking-[0.3em] text-red-500 uppercase">
                        Inteligência · Documentos
                     </span>
                     <span className="block truncate text-lg leading-tight font-extrabold tracking-tight text-slate-900 uppercase">
                        {item.p_g} {item.nome_guerra}
                     </span>
                  </span>
               </span>
            </ModalHeader>
            <ModalBody>
               <div className="space-y-4">
                  {/* Meta do militar — linha enxuta, sem caixa */}
                  {(item.nome_completo || item.saram || item.telefone) && (
                     <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-slate-200 pb-3 text-sm text-gray-500">
                        {item.nome_completo && (
                           <span className="font-medium text-gray-700 uppercase">
                              {item.nome_completo}
                           </span>
                        )}
                        {item.saram && (
                           <span className="font-mono tabular-nums">
                              SARAM {formatSaram(item.saram)}
                           </span>
                        )}
                        {item.telefone && (
                           <span className="inline-flex items-center gap-1">
                              <HiPhone className="h-3.5 w-3.5" />
                              {formatPhone(item.telefone)}
                           </span>
                        )}
                     </div>
                  )}

                  {/* Documento — Passaporte */}
                  <DocumentSection
                     titulo="Passaporte"
                     tipo="passaporte"
                     tripId={item.trip_id}
                     imageUrl={item.passaporte?.passaporte_url ?? null}
                     validade={formData.validade_passaporte}
                  >
                     <NumeroField
                        label="Nº Passaporte"
                        name="passaporte"
                        value={formData.passaporte}
                        onChange={handleChange}
                        disabled={readOnly}
                     />
                     <DateField
                        label="Expedição"
                        name="data_expedicao_passaporte"
                        value={formData.data_expedicao_passaporte}
                        onChange={handleChange}
                        max={formData.validade_passaporte}
                        disabled={readOnly}
                     />
                     <DateField
                        label="Validade"
                        name="validade_passaporte"
                        value={formData.validade_passaporte}
                        onChange={handleChange}
                        min={formData.data_expedicao_passaporte}
                        disabled={readOnly}
                     />
                  </DocumentSection>

                  {/* Documento — Visto */}
                  <DocumentSection
                     titulo="Visto"
                     tipo="visa"
                     tripId={item.trip_id}
                     imageUrl={item.passaporte?.visa_url ?? null}
                     validade={formData.validade_visa}
                  >
                     <NumeroField
                        label="Nº Visto"
                        name="visa"
                        value={formData.visa}
                        onChange={handleChange}
                        disabled={readOnly}
                     />
                     <DateField
                        label="Expedição"
                        name="data_expedicao_visa"
                        value={formData.data_expedicao_visa}
                        onChange={handleChange}
                        max={formData.validade_visa}
                        disabled={readOnly}
                     />
                     <DateField
                        label="Validade"
                        name="validade_visa"
                        value={formData.validade_visa}
                        onChange={handleChange}
                        min={formData.data_expedicao_visa}
                        disabled={readOnly}
                     />
                  </DocumentSection>
               </div>
            </ModalBody>
            <ModalFooter>
               <div className="flex w-full justify-between">
                  <div>
                     {isEdit && (
                        <PermBased resource="passaportes" requiredPerm="delete">
                           <Button
                              color="red"
                              onClick={() => setShowDeleteConfirm(true)}
                              disabled={isLoading}
                           >
                              <HiTrash className="mr-2" />
                              Deletar
                           </Button>
                        </PermBased>
                     )}
                  </div>
                  <div className="flex gap-2">
                     <Button
                        color="gray"
                        onClick={onClose}
                        disabled={isLoading}
                     >
                        {readOnly || !isDirty ? "Fechar" : "Cancelar"}
                     </Button>
                     <PermBased
                        resource="passaportes"
                        requiredPerm={isEdit ? "update" : "create"}
                     >
                        <Button
                           color="blue"
                           onClick={handleSave}
                           disabled={isLoading || !isDirty}
                           title={
                              !isDirty && !isLoading
                                 ? "Nenhuma alteração para salvar"
                                 : undefined
                           }
                        >
                           {isLoading ? (
                              <div className="flex items-center gap-2">
                                 <Spinner size="sm" color="info" />
                                 <span>Salvando...</span>
                              </div>
                           ) : isEdit ? (
                              "Atualizar"
                           ) : (
                              "Cadastrar"
                           )}
                        </Button>
                     </PermBased>
                  </div>
               </div>
            </ModalFooter>
         </Modal>

         <ConfirmModal
            show={showDeleteConfirm}
            title="Confirmar Exclusão"
            description={`Remover o passaporte de ${item.p_g} ${item.nome_guerra}? Esta ação não pode ser desfeita.`}
            isLoading={isDeleting}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={handleDelete}
            confirmButtonText="Remover"
            icon={HiTrash}
         />
      </>
   );
});

export default EditPassaporteModal;
