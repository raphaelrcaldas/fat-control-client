"use client";

import { useState, useRef } from "react";
import { Button, Label, TextInput, Spinner } from "flowbite-react";
import {
   HiTrash,
   HiUpload,
   HiExternalLink,
   HiExclamation,
   HiInformationCircle,
} from "react-icons/hi";
import { useToast } from "@/app/context/toast";
import {
   useAtasByUser,
   useExtrairAta,
   useUploadAta,
   useDeleteAta,
} from "@/hooks/queries";
import type {
   AtaInspecaoWithUrl,
   NomeConflito,
} from "services/routes/aeromedica/atas";
import { formatDateFull } from "utils/dateHandler";

export default function AtasTab({
   userId,
   onCemalUpdated,
}: {
   userId: number;
   onCemalUpdated?: (cemal: string) => void;
}) {
   const { push } = useToast();
   const fileInputRef = useRef<HTMLInputElement>(null);

   const { data: atas, isLoading } = useAtasByUser(userId);
   const extrairMutation = useExtrairAta();
   const uploadMutation = useUploadAta();
   const deleteMutation = useDeleteAta();

   // Arquivo pendente aguardando confirmação do usuário
   const [pendingFile, setPendingFile] = useState<File | null>(null);
   const [extracaoVazia, setExtracaoVazia] = useState(false);
   const [nomeConflito, setNomeConflito] = useState<NomeConflito | null>(null);
   const [manualForm, setManualForm] = useState({
      letra_finalidade: "",
      data_realizacao: "",
      validade_inspsau: "",
   });
   const [showDeleteAtaConfirm, setShowDeleteAtaConfirm] = useState<
      number | null
   >(null);

   const resetFileInput = () => {
      if (fileInputRef.current) fileInputRef.current.value = "";
   };

   const clearPending = () => {
      setPendingFile(null);
      setExtracaoVazia(false);
      setNomeConflito(null);
      setManualForm({
         letra_finalidade: "",
         data_realizacao: "",
         validade_inspsau: "",
      });
      resetFileInput();
   };

   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.name.toLowerCase().endsWith(".pdf")) {
         push({
            title: "Erro",
            message: "Apenas PDFs são permitidos",
            type: "error",
         });
         return;
      }

      if (file.size > 10 * 1024 * 1024) {
         push({
            title: "Erro",
            message: "Arquivo excede 10 MB",
            type: "error",
         });
         return;
      }

      try {
         const result = await extrairMutation.mutateAsync({ userId, file });
         setPendingFile(file);
         setExtracaoVazia(result.data.extracao_vazia);
         setNomeConflito(result.nomeConflito);

         if (result.data.extracao_vazia) {
            push({
               message: "Preencha os dados manualmente antes de enviar.",
               type: "warning",
            });
         } else {
            setManualForm({
               letra_finalidade: result.data.dados_extraidos.letra_finalidade || "",
               data_realizacao: result.data.dados_extraidos.data_realizacao || "",
               validade_inspsau: result.data.dados_extraidos.validade_inspsau || "",
            });
            if (result.nomeConflito) {
               push({ message: "Atenção: nome divergente. Confira os dados.", type: "warning" });
            } else {
               push({ message: "Confira os dados extraídos antes de enviar.", type: "success" });
            }
         }
      } catch (err: unknown) {
         const message =
            err instanceof Error ? err.message : "Erro ao processar ata";
         push({ title: "Erro", message, type: "error" });
      }

      resetFileInput();
   };

   const handleConfirmUpload = async () => {
      if (!pendingFile) return;
      try {
         const result = await uploadMutation.mutateAsync({
            userId,
            file: pendingFile,
            dados: {
               letra_finalidade: manualForm.letra_finalidade,
               data_realizacao: manualForm.data_realizacao,
               validade_inspsau: manualForm.validade_inspsau,
            },
         });
         if (result.cemal_atualizado && manualForm.validade_inspsau) {
            onCemalUpdated?.(manualForm.validade_inspsau);
         }
         push({ message: "Ata enviada com sucesso", type: "success" });
         clearPending();
      } catch (err: unknown) {
         const message =
            err instanceof Error ? err.message : "Erro ao enviar ata";
         push({ title: "Erro", message, type: "error" });
      }
   };

   const handleDeleteAta = async (ataId: number) => {
      try {
         await deleteMutation.mutateAsync(ataId);
         push({ message: "Ata removida com sucesso", type: "success" });
      } catch (err: unknown) {
         const message =
            err instanceof Error ? err.message : "Erro ao remover ata";
         push({ title: "Erro", message, type: "error" });
      } finally {
         setShowDeleteAtaConfirm(null);
      }
   };

   const isExtracting = extrairMutation.isPending;
   const isUploading = uploadMutation.isPending;

   return (
      <div className="space-y-4">
         {/* Upload */}
         {!pendingFile && (
            <div>
               <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  aria-label="Selecionar PDF de ata de inspeção"
                  onChange={handleFileChange}
               />
               <Button
                  color="blue"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isExtracting}
               >
                  {isExtracting ? (
                     <>
                        <Spinner color="failure" size="sm" className="mr-2" />
                        Processando...
                     </>
                  ) : (
                     <>
                        <HiUpload className="mr-2" />
                        Upload de Ata (PDF)
                     </>
                  )}
               </Button>
            </div>
         )}

         {/* Formulário de confirmação dos dados */}
         {pendingFile && (
            <ManualForm
               form={manualForm}
               onChange={setManualForm}
               onSave={handleConfirmUpload}
               onCancel={clearPending}
               isSaving={isUploading}
               variant={extracaoVazia ? "warning" : "success"}
               nomeConflito={nomeConflito}
            />
         )}

         {/* Lista de atas */}
         {isLoading ? (
            <div className="flex justify-center py-8">
               <Spinner color="failure" size="lg" />
            </div>
         ) : !atas || atas.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
               Nenhuma ata cadastrada
            </p>
         ) : (
            <div className="space-y-2">
               {atas.map((ata: AtaInspecaoWithUrl) => (
                  <AtaCard
                     key={ata.id}
                     ata={ata}
                     showConfirm={showDeleteAtaConfirm === ata.id}
                     isDeleting={deleteMutation.isPending}
                     onDelete={() => handleDeleteAta(ata.id)}
                     onConfirmToggle={(show) =>
                        setShowDeleteAtaConfirm(show ? ata.id : null)
                     }
                  />
               ))}

               {atas.length > 1 && (
                  <div className="flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2.5 dark:bg-blue-900/20">
                     <HiInformationCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-500 dark:text-blue-400" />
                     <p className="text-xs text-blue-700 dark:text-blue-300">
                        Considere excluir atas antigas para liberar espaço de
                        armazenamento. Apenas a ata mais recente é utilizada
                        para atualizar o CEMAL.
                     </p>
                  </div>
               )}
            </div>
         )}
      </div>
   );
}

// ========================================
// Sub-components
// ========================================

function ManualForm({
   form,
   onChange,
   onSave,
   onCancel,
   isSaving,
   variant = "warning",
   nomeConflito,
}: {
   form: { letra_finalidade: string; data_realizacao: string; validade_inspsau: string };
   onChange: React.Dispatch<
      React.SetStateAction<typeof form>
   >;
   onSave: () => void;
   onCancel: () => void;
   isSaving: boolean;
   variant?: "warning" | "success";
   nomeConflito: NomeConflito | null;
}) {
   const isSuccess = variant === "success" && !nomeConflito;

   return (
      <div
         className={
            isSuccess
               ? "rounded-lg border border-green-300 bg-green-50 p-4 dark:border-green-700 dark:bg-green-900/20"
               : "rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/20"
         }
      >
         <div className="flex items-start gap-3">
            <div
               className={
                  isSuccess
                     ? "rounded-full bg-green-100 p-1.5 dark:bg-green-800"
                     : "rounded-full bg-amber-100 p-1.5 dark:bg-amber-800"
               }
            >
               {isSuccess ? (
                  <HiInformationCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
               ) : (
                  <HiExclamation className="h-5 w-5 text-amber-600 dark:text-amber-400" />
               )}
            </div>
            <div className="flex-1">
               <p
                  className={
                     isSuccess
                        ? "text-sm font-semibold text-green-800 dark:text-green-300"
                        : "text-sm font-semibold text-amber-800 dark:text-amber-300"
                  }
               >
                  {nomeConflito
                     ? "O nome na ata não confere com o sistema"
                     : variant === "warning"
                       ? "Não foi possível extrair os dados automaticamente"
                       : "Confira os dados extraídos"}
               </p>
               <p
                  className={
                     isSuccess
                        ? "mt-1 text-xs text-green-700 dark:text-green-400"
                        : "mt-1 text-xs text-amber-700 dark:text-amber-400"
                  }
               >
                  {nomeConflito
                     ? "Verifique se a ata pertence a este militar."
                     : variant === "warning"
                       ? "O PDF parece ser uma imagem digitalizada. Preencha os campos manualmente."
                       : "Verifique e corrija se necessário antes de enviar."}
               </p>
            </div>
         </div>

         {/* Alerta de nome divergente inline */}
         {nomeConflito && (
            <div className="mt-3 space-y-2">
               <div className="rounded-md bg-white/60 px-3 py-2 dark:bg-gray-800/40">
                  <span className="text-xs text-amber-600 dark:text-amber-400">
                     Nome na ata
                  </span>
                  <p className="text-sm font-semibold uppercase text-gray-900 dark:text-white">
                     {nomeConflito.nomeAta}
                  </p>
               </div>
               <div className="rounded-md bg-white/60 px-3 py-2 dark:bg-gray-800/40">
                  <span className="text-xs text-amber-600 dark:text-amber-400">
                     Nome no sistema
                  </span>
                  <p className="text-sm font-semibold uppercase text-gray-900 dark:text-white">
                     {nomeConflito.nomeSistema}
                  </p>
               </div>
            </div>
         )}

         <div className="mt-4 space-y-3">
            <div>
               <Label htmlFor="manual_letra">Letra de finalidade</Label>
               <div className="mt-1">
                  <TextInput
                     id="manual_letra"
                     type="text"
                     placeholder="Ex: H"
                     maxLength={1}
                     value={form.letra_finalidade}
                     onChange={(e) =>
                        onChange((prev) => ({
                           ...prev,
                           letra_finalidade: e.target.value.toUpperCase(),
                        }))
                     }
                  />
               </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
               <div>
                  <Label htmlFor="manual_realizacao">Data de realização</Label>
                  <div className="mt-1">
                     <TextInput
                        id="manual_realizacao"
                        type="date"
                        value={form.data_realizacao}
                        onChange={(e) =>
                           onChange((prev) => ({
                              ...prev,
                              data_realizacao: e.target.value,
                           }))
                        }
                     />
                  </div>
               </div>
               <div>
                  <Label htmlFor="manual_validade">Validade</Label>
                  <div className="mt-1">
                     <TextInput
                        id="manual_validade"
                        type="date"
                        value={form.validade_inspsau}
                        onChange={(e) =>
                           onChange((prev) => ({
                              ...prev,
                              validade_inspsau: e.target.value,
                           }))
                        }
                     />
                  </div>
               </div>
            </div>
            {!form.validade_inspsau && (
               <p className="text-xs text-red-600 dark:text-red-400">
                  A validade é obrigatória para enviar.
               </p>
            )}
            <div className="flex gap-2 pt-1">
               <Button
                  color="blue"
                  size="xs"
                  onClick={onSave}
                  disabled={isSaving || !form.validade_inspsau}
               >
                  {isSaving
                     ? "Enviando..."
                     : isSuccess
                       ? "Confirmar e Enviar"
                       : "Salvar e Enviar"}
               </Button>
               <Button color="gray" size="xs" onClick={onCancel}>
                  Cancelar
               </Button>
            </div>
         </div>
      </div>
   );
}

function AtaCard({
   ata,
   showConfirm,
   isDeleting,
   onDelete,
   onConfirmToggle,
}: {
   ata: AtaInspecaoWithUrl;
   showConfirm: boolean;
   isDeleting: boolean;
   onDelete: () => void;
   onConfirmToggle: (show: boolean) => void;
}) {
   return (
      <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <span className="text-lg font-bold text-gray-700 dark:text-gray-300">
                  {ata.letra_finalidade || "—"}
               </span>
               <div className="h-8 w-px bg-gray-200 dark:bg-gray-600" />
               <div className="space-y-0.5">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                     Realização:{" "}
                     <span className="font-medium text-gray-800 dark:text-gray-200">
                        {formatDateFull(ata.data_realizacao) || "—"}
                     </span>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                     Validade:{" "}
                     <span className="font-medium text-gray-800 dark:text-gray-200">
                        {formatDateFull(ata.validade_inspsau) || "—"}
                     </span>
                  </p>
               </div>
            </div>

            <div className="flex items-center gap-1">
               <a
                  href={ata.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-700"
                  title="Visualizar PDF"
               >
                  <HiExternalLink className="h-4 w-4" />
               </a>
               {showConfirm ? (
                  <div className="flex gap-1">
                     <button
                        className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700"
                        onClick={onDelete}
                        disabled={isDeleting}
                     >
                        {isDeleting ? "..." : "Sim"}
                     </button>
                     <button
                        className="rounded-md bg-gray-200 px-2.5 py-1 text-xs font-medium hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500"
                        onClick={() => onConfirmToggle(false)}
                     >
                        Não
                     </button>
                  </div>
               ) : (
                  <button
                     className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-gray-700 dark:hover:text-red-400"
                     onClick={() => onConfirmToggle(true)}
                     title="Excluir"
                  >
                     <HiTrash className="h-4 w-4" />
                  </button>
               )}
            </div>
         </div>
      </div>
   );
}
