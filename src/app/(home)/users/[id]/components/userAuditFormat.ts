import { cpf as cpfValidator } from "cpf-cnpj-validator";
import { postoGradRecords } from "@/constants/militar/postos";
import { formatCpf } from "@/constants/formats";

export const USER_AUDIT_ACTION_LABELS: Record<string, string> = {
   "change-pwd": "Senha alterada",
   "reset-pwd": "Senha redefinida",
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
