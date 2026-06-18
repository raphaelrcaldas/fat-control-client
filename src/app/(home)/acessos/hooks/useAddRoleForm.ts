import { useEffect, useState } from "react";
import type { Role } from "services/routes/security/roles";
import type { UserPublic } from "services/routes/users";
import type { Tenant } from "services/routes/tenants";
import { useToast } from "@/app/context/toast";
import { useAuth } from "@/app/context/auth";
import { useAddUserRole } from "@/hooks/queries/useRoles";
import { addRoleSchema } from "../schemas/roleSchemas";

interface UseAddRoleFormArgs {
   roles: Role[];
   tenants: Tenant[];
   show: boolean;
   onSuccess: () => void;
}

/** Estado, validação e submit do formulário de adição de vínculo. */
export function useAddRoleForm({
   roles,
   tenants,
   show,
   onSuccess,
}: UseAddRoleFormArgs) {
   const { push } = useToast();
   const { activeOrg } = useAuth();
   const addMutation = useAddUserRole();

   // Escopo ativo do admin logado: null = admin do sistema (vê todos os
   // tenants + global); caso contrário, admin de um tenant (travado no próprio)
   const isSystemScope = activeOrg === null;

   const [showSearch, setShowSearch] = useState(false);
   const [selectedUser, setSelectedUser] = useState<UserPublic | null>(null);
   const [selectedRole, setSelectedRole] = useState<number | null>(null);
   const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
   const [validationError, setValidationError] = useState<string>("");

   const selectedRoleObj = roles.find((r) => r.id === selectedRole) ?? null;
   const isAdminRole = selectedRoleObj?.name === "admin";
   // Escopo global (org NULL) só é opção para admin do sistema com perfil admin
   const orgRequired =
      selectedRoleObj !== null && (!isSystemScope || !isAdminRole);

   // Só tenants ativos podem receber vínculos (orgs clientes da plataforma)
   const activeTenants = tenants.filter((t) => t.active);

   // Admin de tenant: o vínculo é sempre criado na própria unidade
   const scopedTenant = isSystemScope
      ? null
      : (tenants.find((t) => t.organizacao_id === activeOrg) ?? null);

   // Admin de tenant entra com a unidade já travada no próprio escopo
   useEffect(() => {
      if (show && !isSystemScope) {
         setSelectedOrg(activeOrg);
      }
   }, [show, isSystemScope, activeOrg]);

   const validationInput = {
      selectedUser,
      selectedRole,
      selectedOrg,
      orgRequired,
   };
   const isFormValid = addRoleSchema.safeParse(validationInput).success;

   function reset() {
      setSelectedUser(null);
      setSelectedRole(null);
      setSelectedOrg(null);
      setValidationError("");
   }

   function pickUser(user: UserPublic) {
      setSelectedUser(user);
      setValidationError("");
   }

   function clearUser() {
      setSelectedUser(null);
   }

   function pickRole(roleId: number | null) {
      setSelectedRole(roleId);
      setValidationError("");
   }

   function pickOrg(org: string | null) {
      setSelectedOrg(org);
      setValidationError("");
   }

   async function handleSubmit(): Promise<boolean> {
      const parsed = addRoleSchema.safeParse(validationInput);
      if (!parsed.success) {
         setValidationError(
            parsed.error.issues[0]?.message ?? "Dados inválidos"
         );
         return false;
      }

      try {
         const result = await addMutation.mutateAsync({
            roleId: selectedRole!,
            userId: selectedUser!.id,
            organizacaoId: selectedOrg,
         });
         if (result.ok) {
            push({ type: "success", message: result.message });
            onSuccess();
            return true;
         }
         push({ type: "error", message: result.message });
         setValidationError(result.message || "Erro ao adicionar perfil");
         return false;
      } catch {
         const errorMsg = "Erro ao adicionar perfil. Tente novamente.";
         push({ type: "error", message: errorMsg });
         setValidationError(errorMsg);
         return false;
      }
   }

   return {
      // estado
      selectedUser,
      selectedRole,
      selectedOrg,
      showSearch,
      setShowSearch,
      validationError,
      // derivados
      isSystemScope,
      orgRequired,
      activeTenants,
      scopedTenant,
      isFormValid,
      isSaving: addMutation.isPending,
      // ações
      pickUser,
      clearUser,
      pickRole,
      pickOrg,
      reset,
      handleSubmit,
   };
}
