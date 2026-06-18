/** Identifica o vínculo (user_role) em vias de remoção. */
export interface DeletingUserRole {
   userId: number;
   roleId: number;
   organizacaoId: string | null;
   userName: string;
}

/** Vínculo em edição (alimenta o modal de edição de perfil). */
export interface EditingRole {
   userId: number;
   userLabel: string;
   organizacaoId: string | null;
   orgLabel: string;
   currentRoleId: number;
}
