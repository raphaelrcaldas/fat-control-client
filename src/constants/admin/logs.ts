/**
 * Configuração de cores para ações em logs
 */

export type ActionType = "create" | "update" | "delete" | "login" | "logout";

export interface ActionConfig {
   bg: string;
   text: string;
   label: string;
}

export const ACTION_CONFIG: Record<ActionType, ActionConfig> = {
   create: {
      bg: "bg-green-100",
      text: "text-green-700",
      label: "Criação",
   },
   update: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      label: "Atualização",
   },
   delete: {
      bg: "bg-red-100",
      text: "text-red-700",
      label: "Exclusão",
   },
   login: {
      bg: "bg-emerald-100",
      text: "text-emerald-700",
      label: "Login",
   },
   logout: {
      bg: "bg-gray-100",
      text: "text-gray-700",
      label: "Logout",
   },
};

/**
 * Retorna a configuração de uma ação
 */
export function getActionConfig(action: string): ActionConfig {
   return ACTION_CONFIG[action as ActionType] || ACTION_CONFIG.update;
}
