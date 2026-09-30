"use client";

import { useMemo, useState } from "react";
import { Button } from "flowbite-react";
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
import { formatTenantSaveError } from "./tenantErrors";

export default function TenantsPage() {
   const { push } = useToast();

   const {
      data: tenantsData,
      isLoading,
      isFetching,
      error,
      refetch,
   } = useTenants();
   // Query secundária (só alimenta o select de "Registrar"): a falha dela é
   // dita dentro do modal, não vira "todas as organizações já são tenants"
   const {
      data: organizacoes = [],
      isLoading: orgsLoading,
      isFetching: orgsFetching,
      isError: orgsError,
      refetch: refetchOrgs,
   } = useOrganizacoes();
   const tenants = useMemo(() => tenantsData ?? [], [tenantsData]);
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
         push({
            type: "success",
            message: result.message || "Tenant registrado com sucesso!",
         });
         setShowRegisterModal(false);
      } catch (err) {
         push({
            type: "error",
            message: formatTenantSaveError(err, "Erro ao registrar tenant"),
         });
      }
   };

   const handleToggleActive = async (tenant: Tenant) => {
      try {
         const result = await updateMutation.mutateAsync({
            organizacaoId: tenant.organizacao_id,
            data: { active: !tenant.active },
         });
         push({
            type: "success",
            message: result.message || "Tenant atualizado!",
         });
      } catch (err) {
         push({
            type: "error",
            message: formatTenantSaveError(err, "Erro ao atualizar tenant"),
         });
      }
   };

   const handleDelete = async () => {
      if (!deletingTenant) return;
      try {
         const result = await deleteMutation.mutateAsync(
            deletingTenant.organizacao_id
         );
         push({
            type: "success",
            message: result.message || "Tenant removido com sucesso!",
         });
         setShowDeleteModal(false);
         setDeletingTenant(null);
      } catch (err) {
         push({
            type: "error",
            message: formatTenantSaveError(err, "Erro ao remover tenant"),
         });
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

   // Erro sem dado em tela; com a lista em cache o erro vira aviso, abaixo
   if (error && !tenantsData) {
      return (
         <div className="space-y-2">
            <TenantsHeader onRegister={() => setShowRegisterModal(true)} />
            <div
               role="alert"
               className="space-y-3 rounded border border-red-300 bg-red-50 p-4"
            >
               <p className="text-sm text-red-800">
                  Erro ao carregar tenants. Por favor, tente novamente.
               </p>
               <Button
                  color="light"
                  size="xs"
                  onClick={() => refetch()}
                  disabled={isFetching}
               >
                  Tentar novamente
               </Button>
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

         {/* Refetch que falhou com a lista em tela: mantém e avisa */}
         {error && (
            <p
               role="status"
               className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500"
            >
               <span className="min-w-0 flex-1 truncate">
                  Não foi possível atualizar a lista de tenants
               </span>
               <button
                  type="button"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="min-h-[24px] shrink-0 font-semibold text-slate-900 underline underline-offset-2 disabled:opacity-50"
               >
                  Tentar novamente
               </button>
            </p>
         )}

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
            orgsLoading={orgsLoading}
            orgsError={orgsError}
            orgsFetching={orgsFetching}
            onRetryOrgs={() => refetchOrgs()}
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
