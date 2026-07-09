"use client";

import { useMemo, useState } from "react";
import { FaSitemap } from "react-icons/fa6";
import { useToast } from "@/app/context/toast";
import {
   useTenants,
   useCreateTenant,
   useUpdateTenant,
   useDeleteTenant,
   useOrganizacoes,
} from "@/hooks/queries";
import type { Tenant } from "services/routes/tenants";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { TenantsHeader } from "./components/TenantsHeader";
import { TenantsTable, TenantsTableSkeleton } from "./components/TenantsTable";
import { TenantRegisterModal } from "./components/TenantRegisterModal";
import { TenantConfigModal } from "./components/TenantConfigModal";

export default function TenantsPage() {
   const { push } = useToast();

   const { data: tenants = [], isLoading, error } = useTenants();
   const { data: organizacoes = [] } = useOrganizacoes();
   const createMutation = useCreateTenant();
   const updateMutation = useUpdateTenant();
   const deleteMutation = useDeleteTenant();

   const [showRegisterModal, setShowRegisterModal] = useState(false);
   const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [deletingTenant, setDeletingTenant] = useState<Tenant | null>(null);
   // Guarda só o id: o tenant exibido é derivado da lista, para o modal
   // refletir o dado fresco após atualizar tema/brasão.
   const [configId, setConfigId] = useState<string | null>(null);
   const configTenant =
      tenants.find((t) => t.organizacao_id === configId) ?? null;

   // Organizações do diretório que ainda não são tenants
   const availableOrgs = useMemo(() => {
      const tenantIds = new Set(tenants.map((t) => t.organizacao_id));
      return organizacoes.filter((o) => !tenantIds.has(o.sigla));
   }, [organizacoes, tenants]);

   const handleRegister = async (organizacaoId: string) => {
      try {
         const result = await createMutation.mutateAsync({
            organizacao_id: organizacaoId,
         });
         if (result.ok) {
            push({
               type: "success",
               message: result.message || "Tenant registrado com sucesso!",
            });
            setShowRegisterModal(false);
         } else {
            push({
               type: "error",
               message: result.message || "Erro ao registrar tenant",
            });
         }
      } catch (err) {
         console.error("createTenant failed", err);
         push({ type: "error", message: "Ocorreu um erro inesperado" });
      }
   };

   const handleToggleActive = async (tenant: Tenant) => {
      try {
         const result = await updateMutation.mutateAsync({
            organizacaoId: tenant.organizacao_id,
            data: { active: !tenant.active },
         });
         if (result.ok) {
            push({
               type: "success",
               message: result.message || "Tenant atualizado!",
            });
         } else {
            push({
               type: "error",
               message: result.message || "Erro ao atualizar tenant",
            });
         }
      } catch (err) {
         console.error("updateTenant failed", err);
         push({ type: "error", message: "Ocorreu um erro inesperado" });
      }
   };

   const handleDelete = async () => {
      if (!deletingTenant) return;
      try {
         const result = await deleteMutation.mutateAsync(
            deletingTenant.organizacao_id
         );
         if (result.ok) {
            push({
               type: "success",
               message: result.message || "Tenant removido com sucesso!",
            });
            setShowDeleteModal(false);
            setDeletingTenant(null);
         } else {
            push({
               type: "error",
               message: result.message || "Erro ao remover tenant",
            });
         }
      } catch (err) {
         console.error("deleteTenant failed", err);
         push({ type: "error", message: "Ocorreu um erro inesperado" });
      }
   };

   if (isLoading) {
      return (
         <div className="space-y-2">
            <TenantsHeader onRegister={() => setShowRegisterModal(true)} />
            <TenantsTableSkeleton rows={6} />
         </div>
      );
   }

   if (error) {
      return (
         <div className="space-y-2">
            <TenantsHeader onRegister={() => setShowRegisterModal(true)} />
            <div className="rounded border border-red-300 bg-red-50 p-4">
               <p className="text-sm text-red-800">
                  Erro ao carregar tenants. Por favor, tente novamente.
               </p>
            </div>
         </div>
      );
   }

   return (
      <div className="space-y-2">
         <TenantsHeader
            count={tenants.length}
            onRegister={() => setShowRegisterModal(true)}
         />

         {tenants.length === 0 ? (
            <EmptyState
               icon={FaSitemap}
               title="Nenhum tenant registrado"
               description="Registre uma organização do diretório como cliente da plataforma."
            />
         ) : (
            <TenantsTable
               tenants={tenants}
               isUpdating={updateMutation.isPending}
               onToggleActive={handleToggleActive}
               onConfig={(tenant) => setConfigId(tenant.organizacao_id)}
               onDelete={(tenant) => {
                  setDeletingTenant(tenant);
                  setShowDeleteModal(true);
               }}
            />
         )}

         <TenantRegisterModal
            show={showRegisterModal}
            availableOrgs={availableOrgs}
            isSaving={createMutation.isPending}
            onClose={() => setShowRegisterModal(false)}
            onSubmit={handleRegister}
         />

         <TenantConfigModal
            show={configTenant !== null}
            tenant={configTenant}
            onClose={() => setConfigId(null)}
         />

         <ConfirmModal
            show={showDeleteModal}
            title="Descadastrar tenant?"
            description={
               deletingTenant
                  ? `O tenant "${deletingTenant.organizacao.sigla}" deixará de ser cliente da plataforma. A organização permanece no diretório.`
                  : undefined
            }
            isLoading={deleteMutation.isPending}
            onClose={() => {
               setShowDeleteModal(false);
               setDeletingTenant(null);
            }}
            onConfirm={handleDelete}
            confirmButtonText="Sim, descadastrar"
         />
      </div>
   );
}
