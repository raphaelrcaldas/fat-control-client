/**
 * Configuração de temas para roles/perfis de usuário
 */

export interface RoleTheme {
   bg: string;
   text: string;
   hover: string;
   label?: string;
}

export const ROLE_THEMES: Record<string, RoleTheme> = {
   admin: {
      bg: "bg-red-100",
      text: "text-red-700",
      hover: "hover:bg-red-200",
      label: "Administrador",
   },
   apoio_avancado: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      hover: "hover:bg-blue-200",
      label: "Apoio Avançado",
   },
   apoio_basico: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      hover: "hover:bg-blue-200",
      label: "Apoio Básico",
   },
   ops_avancado: {
      bg: "bg-orange-100",
      text: "text-orange-700",
      hover: "hover:bg-orange-200",
      label: "Operações Avançado",
   },
   ops_basico: {
      bg: "bg-orange-100",
      text: "text-orange-700",
      hover: "hover:bg-orange-200",
      label: "Operações Básico",
   },
   dout_avancado: {
      bg: "bg-green-100",
      text: "text-green-700",
      hover: "hover:bg-green-200",
      label: "Doutrina Avançado",
   },
   default: {
      bg: "bg-gray-100",
      text: "text-gray-700",
      hover: "hover:bg-gray-200",
      label: "Default",
   },
};

/**
 * Retorna o tema de um role baseado no nome
 */
export function getRoleTheme(roleName: string): RoleTheme {
   const normalized = roleName.toLowerCase().trim();
   return ROLE_THEMES[normalized] || ROLE_THEMES.default;
}

/**
 * Retorna todas as chaves de roles disponíveis (exceto default)
 */
export function getAvailableRoles(): string[] {
   return Object.keys(ROLE_THEMES).filter((key) => key !== "default");
}
