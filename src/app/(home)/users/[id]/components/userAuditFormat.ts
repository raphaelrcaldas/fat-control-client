import { cpf as cpfValidator } from "cpf-cnpj-validator";
import { postoGradRecords } from "@/constants/militar/postos";
import { formatCpf } from "@/constants/formats";

export const USER_AUDIT_ACTION_LABELS: Record<string, string> = {
   "change-pwd": "Senha alterada",
   "reset-pwd": "Senha redefinida",
   "role-add": "Perfil concedido",
   "role-update": "Perfil alterado",
   "role-delete": "Perfil removido",
};

/**
 * Campos que só existem no before/after dos eventos de perfil
 * (`role-add`/`role-update`/`role-delete`, gravados pelas rotas de
 * `/security/roles/users`). Ficam fora de `USER_FIELD_LABELS` porque aquele
 * mapa também alimenta os erros de validação e os avisos de completude de
 * cadastro, onde `role` e `organizacao` não são campos do usuário.
 */
export const USER_ROLE_AUDIT_FIELD_LABELS: Record<string, string> = {
   role: "Perfil",
   organizacao: "Organização",
};

/**
 * Formata os valores persistidos no before/after da auditoria de usuários.
 *
 * Sem caso para `unidade` e `password`: nenhum dos dois entra em
 * before/after de log de `users` — `UserUpdate`/`UserSchema` não têm
 * `unidade` (é sempre a org ativa de quem cadastra) e `create_user` grava
 * `after=None`; o hash de senha nunca é persistido no log (só a transição
 * de `first_login`). Ver `api/fcontrol_api/routers/users.py`.
 */
export function formatUserAuditFieldValue(
   field: string,
   value: string
): string {
   const str = String(value ?? "");
   if (!str) return str;

   switch (field) {
      case "p_g": {
         const posto = postoGradRecords.find((p) => p.short === str);
         return posto ? posto.long : str;
      }
      case "cpf":
         return cpfValidator.isValid(str) ? formatCpf(str) : str;
      case "active":
         return str === "true" ? "Ativo" : "Inativo";
      case "first_login":
         return str === "true" ? "Sim" : "Não";
      default:
         return str;
   }
}
