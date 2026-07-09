"use client";

import {
   Modal,
   ModalHeader,
   ModalBody,
   ModalFooter,
   Button,
} from "flowbite-react";
import { useToast } from "@/app/context/toast";
import {
   useUpdateTenant,
   useUploadBrasao,
   useDeleteBrasao,
} from "@/hooks/queries";
import { normalizeOrgTheme, type OrgTheme } from "@/lib/orgTheme";
import type { Tenant } from "services/routes/tenants";
import { ThemeSelector } from "./ThemeSelector";
import { BrasaoUploader } from "./BrasaoUploader";

interface TenantConfigModalProps {
   show: boolean;
   tenant: Tenant | null;
   onClose: () => void;
}

export function TenantConfigModal({
   show,
   tenant,
   onClose,
}: TenantConfigModalProps) {
   const { push } = useToast();
   const updateMutation = useUpdateTenant();
   const uploadMutation = useUploadBrasao();
   const deleteMutation = useDeleteBrasao();

   if (!tenant) return null;

   const sigla = tenant.organizacao.sigla;
   const temaAtual = normalizeOrgTheme(tenant.tema);
   const brasaoUrl = tenant.organizacao.brasao_url;
   const busy =
      updateMutation.isPending ||
      uploadMutation.isPending ||
      deleteMutation.isPending;

   async function handleSelectTema(tema: OrgTheme) {
      if (!tenant || tema === temaAtual) return;
      try {
         const result = await updateMutation.mutateAsync({
            organizacaoId: tenant.organizacao_id,
            data: { tema },
         });
         push(
            result.ok
               ? { type: "success", message: "Tema atualizado!" }
               : {
                    type: "error",
                    message: result.message || "Erro ao atualizar o tema",
                 }
         );
      } catch (err) {
         console.error("updateTenant tema failed", err);
         push({ type: "error", message: "Ocorreu um erro inesperado" });
      }
   }

   async function handleUploadBrasao(file: File) {
      try {
         await uploadMutation.mutateAsync({ sigla, file });
         push({ type: "success", message: "Brasão atualizado!" });
      } catch (err) {
         console.error("uploadBrasao failed", err);
         push({
            type: "error",
            message:
               err instanceof Error ? err.message : "Erro ao enviar o brasão",
         });
      }
   }

   async function handleDeleteBrasao() {
      try {
         const result = await deleteMutation.mutateAsync(sigla);
         push(
            result.ok
               ? { type: "success", message: "Brasão removido!" }
               : {
                    type: "error",
                    message: result.message || "Erro ao remover o brasão",
                 }
         );
      } catch (err) {
         console.error("deleteBrasao failed", err);
         push({ type: "error", message: "Ocorreu um erro inesperado" });
      }
   }

   return (
      <Modal show={show} onClose={onClose} size="lg">
         <ModalHeader>Aparência — {sigla.toUpperCase()}</ModalHeader>
         <ModalBody>
            <div className="space-y-6">
               <section className="space-y-2">
                  <h3 className="text-sm font-semibold text-slate-700">
                     Tema de cor
                  </h3>
                  <p className="text-xs text-slate-500">
                     Define a cor de marca exibida aos usuários desta
                     organização.
                  </p>
                  <ThemeSelector
                     value={temaAtual}
                     onSelect={handleSelectTema}
                     savingTema={
                        updateMutation.isPending
                           ? (updateMutation.variables?.data.tema as OrgTheme)
                           : null
                     }
                     disabled={busy}
                  />
               </section>

               <section className="space-y-2">
                  <h3 className="text-sm font-semibold text-slate-700">
                     Brasão
                  </h3>
                  <BrasaoUploader
                     sigla={sigla}
                     brasaoUrl={brasaoUrl}
                     isUploading={uploadMutation.isPending}
                     isDeleting={deleteMutation.isPending}
                     onUpload={handleUploadBrasao}
                     onDelete={handleDeleteBrasao}
                     onValidationError={(message) =>
                        push({ type: "error", message })
                     }
                  />
               </section>
            </div>
         </ModalBody>
         <ModalFooter>
            <Button color="gray" onClick={onClose} disabled={busy}>
               Fechar
            </Button>
         </ModalFooter>
      </Modal>
   );
}
