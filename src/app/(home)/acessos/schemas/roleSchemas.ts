import { z } from "zod";
import type { UserPublic } from "services/routes/users";

/**
 * Validação do formulário de adição de vínculo. `orgRequired` é derivado em
 * runtime (depende do perfil escolhido + escopo do admin), por isso entra
 * como campo do payload de validação. As refinements rodam em ordem, então
 * `issues[0]` reflete a primeira regra violada.
 */
export const addRoleSchema = z
   .object({
      selectedUser: z.custom<UserPublic | null>(),
      selectedRole: z.number().nullable(),
      selectedOrg: z.string().nullable(),
      orgRequired: z.boolean(),
   })
   .refine((d) => d.selectedUser != null, {
      message: "Selecione um usuário",
      path: ["selectedUser"],
   })
   .refine((d) => d.selectedRole != null, {
      message: "Selecione um perfil",
      path: ["selectedRole"],
   })
   .refine((d) => !(d.orgRequired && d.selectedOrg === null), {
      message:
         "Selecione uma unidade para este perfil " +
         "(apenas administrador pode ser do sistema)",
      path: ["selectedOrg"],
   });

export type AddRoleInput = z.infer<typeof addRoleSchema>;

/**
 * Validação do formulário de edição de vínculo. Vínculo de sistema (org NULL)
 * só aceita o perfil de administrador.
 */
export const editRoleSchema = z
   .object({
      selectedRole: z.number().nullable(),
      isSystemScope: z.boolean(),
      selectedRoleName: z.string().nullable(),
   })
   .refine((d) => d.selectedRole != null, {
      message: "Selecione um perfil",
      path: ["selectedRole"],
   })
   .refine((d) => !(d.isSystemScope && d.selectedRoleName !== "admin"), {
      message: "Vínculo de sistema só aceita o perfil de administrador",
      path: ["selectedRole"],
   });

export type EditRoleInput = z.infer<typeof editRoleSchema>;
