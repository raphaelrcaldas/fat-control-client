"use client";

import { useEffect, useState } from "react";
import {
   Modal,
   ModalHeader,
   ModalBody,
   ModalFooter,
   Button,
   Label,
   TextInput,
} from "flowbite-react";
import { useToast } from "@/app/context/toast";
import { useUpdateTenant } from "@/hooks/queries";
import { normalizeOrgTheme, type OrgTheme } from "@/lib/orgTheme";
import type { Tenant } from "services/routes/tenants";
import { ThemeSelector } from "./ThemeSelector";

const SAUDACAO_MAX = 120;

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
   const [saudacao, setSaudacao] = useState("");

   // Reabrir o modal (ou trocar de tenant) recarrega o campo do servidor.
   useEffect(() => {
      setSaudacao(tenant?.saudacao ?? "");
   }, [tenant?.organizacao_id, tenant?.saudacao]);

   if (!tenant) return null;

   const sigla = tenant.organizacao.sigla;
   const temaAtual = normalizeOrgTheme(tenant.tema);
   const busy = updateMutation.isPending;
   const saudacaoAlterada = saudacao.trim() !== tenant.saudacao;

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

   async function handleSaveSaudacao() {
      if (!tenant || !saudacaoAlterada) return;
      try {
         const result = await updateMutation.mutateAsync({
            organizacaoId: tenant.organizacao_id,
            data: { saudacao: saudacao.trim() },
         });
         push(
            result.ok
               ? { type: "success", message: "Saudação atualizada!" }
               : {
                    type: "error",
                    message: result.message || "Erro ao atualizar a saudação",
                 }
         );
      } catch (err) {
         console.error("updateTenant saudacao failed", err);
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
                     Saudação
                  </h3>
                  <p className="text-xs text-slate-500">
                     Lema da unidade, exibido abaixo do nome na tela de
                     carregamento. Deixe em branco para não exibir nenhum.
                  </p>
                  <div className="flex items-start gap-2">
                     <div className="flex-1">
                        <Label htmlFor="saudacao" className="sr-only">
                           Saudação
                        </Label>
                        <TextInput
                           id="saudacao"
                           value={saudacao}
                           maxLength={SAUDACAO_MAX}
                           disabled={busy}
                           placeholder="Ex: Uma equipe, um coração."
                           onChange={(e) => setSaudacao(e.target.value)}
                        />
                     </div>
                     <Button
                        color="red"
                        disabled={busy || !saudacaoAlterada}
                        onClick={handleSaveSaudacao}
                     >
                        {busy && saudacaoAlterada ? "Salvando..." : "Salvar"}
                     </Button>
                  </div>
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
