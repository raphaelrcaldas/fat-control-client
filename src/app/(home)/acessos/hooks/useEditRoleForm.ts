import { useEffect, useState } from "react";
import type { Role } from "services/routes/security/roles";
import { useToast } from "@/app/context/toast";
import { useUpdateUserRole } from "@/hooks/queries/useRoles";
import { editRoleSchema } from "../schemas/roleSchemas";
import type { EditingRole } from "../helpers/types";

interface UseEditRoleFormArgs {
   roles: Role[];
   editing: EditingRole | null;
   show: boolean;
   onSuccess: () => void;
}

/** Estado, validação e submit do formulário de edição de vínculo. */
export function useEditRoleForm({
   roles,
   editing,
   show,
   onSuccess,
}: UseEditRoleFormArgs) {
   const { push } = useToast();
   const updateMutation = useUpdateUserRole();

   const [selectedRole, setSelectedRole] = useState<number | null>(null);
   const [validationError, setValidationError] = useState<string>("");

   // Vínculo de sistema (org NULL): só pode ser 'admin'
   const isSystemScope = editing?.organizacaoId === null;

   useEffect(() => {
      if (show && editing) {
         setSelectedRole(editing.currentRoleId);
         setValidationError("");
      }
   }, [show, editing]);

   function reset() {
      setSelectedRole(null);
      setValidationError("");
   }

   function pickRole(roleId: number | null) {
      setSelectedRole(roleId);
      setValidationError("");
   }

   async function handleSubmit(): Promise<boolean> {
      if (!editing) return false;

      const selectedRoleName =
         roles.find((r) => r.id === selectedRole)?.name ?? null;
      const parsed = editRoleSchema.safeParse({
         selectedRole,
         isSystemScope,
         selectedRoleName,
      });
      if (!parsed.success) {
         setValidationError(
            parsed.error.issues[0]?.message ?? "Dados inválidos"
         );
         return false;
      }

      // Sem alteração: apenas fecha
      if (selectedRole === editing.currentRoleId) {
         onSuccess();
         return true;
      }

      try {
         const result = await updateMutation.mutateAsync({
            roleId: selectedRole!,
            userId: editing.userId,
            organizacaoId: editing.organizacaoId,
         });
         if (result.ok) {
            push({ type: "success", message: result.message });
            onSuccess();
            return true;
         }
         push({ type: "error", message: result.message });
         setValidationError(result.message || "Erro ao atualizar perfil");
         return false;
      } catch {
         const errorMsg = "Erro ao atualizar perfil. Tente novamente.";
         push({ type: "error", message: errorMsg });
         setValidationError(errorMsg);
         return false;
      }
   }

   return {
      selectedRole,
      validationError,
      isSystemScope,
      isSaving: updateMutation.isPending,
      pickRole,
      reset,
      handleSubmit,
   };
}
